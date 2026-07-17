import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, LogOut, LayoutDashboard, FileText, Users, Settings as SettingsIcon, Save, Plus, Trash2, Edit, X, Upload } from 'lucide-react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { doc, getDoc, setDoc, collection, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

function ImageUpload({ onUpload, label, currentImageUrl }: { onUpload: (url: string) => void, label: string, currentImageUrl?: string }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert("This image is quite large! For better performance, please try images smaller than 1MB.");
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      onUpload(reader.result as string);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center gap-4">
        {currentImageUrl && (
          <div className="relative w-16 h-16 group">
            <img src={currentImageUrl} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
              <span className="text-[10px] text-white font-bold">New</span>
            </div>
          </div>
        )}
        <div className="flex-1">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
          />
          <label
            htmlFor={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
            className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl p-3 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group"
          >
            {uploading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-blue-600 font-medium">Processing...</span>
              </div>
            ) : (
              <>
                <Upload className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                <span className="text-sm text-gray-500 group-hover:text-blue-600 transition-colors">Select from Device</span>
              </>
            )}
          </label>
        </div>
      </div>
    </div>
  );
}

function NoticesAdmin() {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    imageUrl: '',
    date: new Date().toISOString().split('T')[0],
    category: 'General'
  });

  const categories = ["Academic", "Holiday", "Events", "Committee", "General"];

  useEffect(() => {
    loadNotices();
  }, []);

  async function loadNotices() {
    try {
      const q = query(collection(db, 'notices'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotices(docs);
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, 'notices');
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (notice: any) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      excerpt: notice.excerpt,
      content: notice.content || '',
      imageUrl: notice.imageUrl || '',
      date: notice.date,
      category: notice.category
    });
    setIsSidebarOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    try {
      await deleteDoc(doc(db, 'notices', id));
      loadNotices();
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `notices/${id}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        updatedAt: serverTimestamp()
      };

      if (editingNotice) {
        await updateDoc(doc(db, 'notices', editingNotice.id), payload);
      } else {
        await addDoc(collection(db, 'notices'), {
          ...payload,
          createdAt: serverTimestamp()
        });
      }

      setIsSidebarOpen(false);
      setEditingNotice(null);
      setFormData({
        title: '',
        excerpt: '',
        content: '',
        imageUrl: '',
        date: new Date().toISOString().split('T')[0],
        category: 'General'
      });
      loadNotices();
    } catch (e) {
      handleFirestoreError(e, editingNotice ? OperationType.UPDATE : OperationType.CREATE, 'notices');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Notices Management</h3>
        <button 
          onClick={() => { setEditingNotice(null); setIsSidebarOpen(true); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" /> Add Notice
        </button>
      </div>

      <div className="grid gap-4">
        {notices.map((notice) => (
          <div key={notice.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <span className="text-xs font-bold text-primary bg-blue-50 px-2 py-1 rounded mb-2 inline-block uppercase tracking-wider">{notice.category}</span>
              <h4 className="font-bold text-gray-900">{notice.title}</h4>
              <p className="text-sm text-gray-500">{notice.date}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(notice)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"><Edit className="w-5 h-5" /></button>
              <button onClick={() => handleDelete(notice.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full transition"><Trash2 className="w-5 h-5" /></button>
            </div>
          </div>
        ))}
      </div>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="w-full max-w-xl bg-white h-full p-8 overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-8">
              <h4 className="text-xl font-bold">{editingNotice ? 'Edit Notice' : 'Add New Notice'}</h4>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500">
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt (Short description)</label>
                <textarea required rows={2} value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500"></textarea>
              </div>
              <div>
                <ImageUpload 
                  label="Notice Image" 
                  currentImageUrl={formData.imageUrl} 
                  onUpload={(url) => setFormData({...formData, imageUrl: url})} 
                />
                <div className="mt-2">
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Or Paste Image URL</label>
                  <input type="text" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full border p-2 rounded-md text-sm focus:ring-2 focus:ring-blue-500" placeholder="https://images.unsplash.com/..." />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Content (Optional)</label>
                <textarea rows={6} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500"></textarea>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition">
                {editingNotice ? 'Update Notice' : 'Published Notice'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StaffAdmin() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    phone: '',
    subject: '',
    imageUrl: '',
    category: 'Teaching'
  });

  const categories = ["Teaching", "Non-Teaching", "Management", "PTA", "Advisory", "SocialAudit"];

  useEffect(() => { loadStaff(); }, []);

  async function loadStaff() {
    try {
      const q = query(collection(db, 'staff'), orderBy('category'));
      const querySnapshot = await getDocs(q);
      setStaff(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) { handleFirestoreError(e, OperationType.GET, 'staff'); }
    finally { setLoading(false); }
  }

  const handleEdit = (member: any) => {
    setEditingStaff(member);
    setFormData({ name: member.name, role: member.role, phone: member.phone || '', subject: member.subject || '', imageUrl: member.imageUrl || '', category: member.category });
    setIsSidebarOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this staff member?')) return;
    try { await deleteDoc(doc(db, 'staff', id)); loadStaff(); }
    catch (e) { handleFirestoreError(e, OperationType.DELETE, `staff/${id}`); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData, updatedAt: serverTimestamp() };
      if (editingStaff) await updateDoc(doc(db, 'staff', editingStaff.id), payload);
      else await addDoc(collection(db, 'staff'), { ...payload, createdAt: serverTimestamp() });
      setIsSidebarOpen(false);
      setEditingStaff(null);
      setFormData({ name: '', role: '', phone: '', subject: '', imageUrl: '', category: 'Teaching' });
      loadStaff();
    } catch (e) { handleFirestoreError(e, editingStaff ? OperationType.UPDATE : OperationType.CREATE, 'staff'); }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Staff Management</h3>
        <button onClick={() => { setEditingStaff(null); setIsSidebarOpen(true); }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          <Plus className="w-5 h-5" /> Add Staff Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map((member) => (
          <div key={member.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative group">
            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleEdit(member)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"><Edit className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(member.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full"><Trash2 className="w-4 h-4" /></button>
            </div>
            <div className="text-xs font-bold text-primary uppercase mb-2">{member.category}</div>
            <h4 className="font-bold text-lg text-gray-900">{member.name}</h4>
            <p className="text-primary font-medium">{member.role}</p>
            {member.subject && <p className="text-sm text-gray-500 mt-1">{member.subject}</p>}
            {member.phone && <p className="text-sm text-gray-500 mt-1">{member.phone}</p>}
          </div>
        ))}
      </div>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="w-full max-w-xl bg-white h-full p-8 overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h4 className="text-xl font-bold">{editingStaff ? 'Edit Staff member' : 'Add New Staff Member'}</h4>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500">
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position / Role</label>
                <input required type="text" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500" placeholder="e.g. Principal, Primary Teacher" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject (if applicable)</label>
                <input type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <ImageUpload 
                  label="Staff Photo" 
                  currentImageUrl={formData.imageUrl} 
                  onUpload={(url) => setFormData({...formData, imageUrl: url})} 
                />
                <div className="mt-2">
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Or Paste Avatar URL</label>
                  <input type="text" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full border p-2 rounded-md text-sm focus:ring-2 focus:ring-blue-500" placeholder="https://..." />
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition">
                {editingStaff ? 'Update Staff Member' : 'Add Staff Member'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsAdmin() {
  const [formData, setFormData] = useState({
    email: '',
    address: '',
    phoneNumbers: '',
    facebookUrl: '',
    instagramUrl: '',
    youtubeUrl: '',
    mapLocation: '',
    aboutText: '',
    principalMessage: '',
    heroTitle: '',
    heroSubtitle: '',
    principalImageUrl: '',
    heroImageUrl: '',
    announcementText: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const docRef = doc(db, 'settings', 'general');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            email: data.email || '',
            address: data.address || '',
            phoneNumbers: data.phoneNumbers ? data.phoneNumbers.join(', ') : '',
            facebookUrl: data.facebookUrl || '',
            instagramUrl: data.instagramUrl || '',
            youtubeUrl: data.youtubeUrl || '',
            mapLocation: data.mapLocation || '',
            aboutText: data.aboutText || '',
            principalMessage: data.principalMessage || '',
            heroTitle: data.heroTitle || '',
            heroSubtitle: data.heroSubtitle || '',
            principalImageUrl: data.principalImageUrl || '',
            heroImageUrl: data.heroImageUrl || '',
            announcementText: data.announcementText || ''
          });
        }
      } catch (e) {
        handleFirestoreError(e, OperationType.GET, 'settings/general');
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, 'settings', 'general');
      const phones = formData.phoneNumbers.split(',').map(p => p.trim()).filter(p => p !== '');
      await setDoc(docRef, {
        ...formData,
        phoneNumbers: phones,
        updatedAt: serverTimestamp()
      }, { merge: true });
      alert('Settings saved successfully!');
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'settings/general');
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4">Loading settings...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-4xl text-left mx-auto">
      <h3 className="text-xl font-bold mb-6 text-gray-800">Site Management & Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="font-bold text-primary border-b pb-2">Contact Info</h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Numbers (comma separated)</label>
            <input type="text" name="phoneNumbers" value={formData.phoneNumbers} onChange={handleChange} className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500" />
          </div>
          <h4 className="font-bold text-primary border-b pb-2 pt-4">Social Media</h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
            <input type="text" name="facebookUrl" value={formData.facebookUrl} onChange={handleChange} className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
            <input type="text" name="instagramUrl" value={formData.instagramUrl} onChange={handleChange} className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-primary border-b pb-2">Home & About Content</h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hero Section Title</label>
            <input type="text" name="heroTitle" value={formData.heroTitle} onChange={handleChange} className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500" placeholder="Vidhya Jyoti Secondary School" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hero Section Tagline</label>
            <input type="text" name="heroSubtitle" value={formData.heroSubtitle} onChange={handleChange} className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500" placeholder="Empowering Students for a Bright Future" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">About Us Text</label>
            <textarea name="aboutText" value={formData.aboutText} onChange={handleChange} rows={4} className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500"></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Principal's Message</label>
            <textarea name="principalMessage" value={formData.principalMessage} onChange={handleChange} rows={6} className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500"></textarea>
          </div>
          <h4 className="font-bold text-primary border-b pb-2 pt-4">Dynamic Images</h4>
          <div className="space-y-6">
            <div>
              <ImageUpload 
                label="Hero Section Image" 
                currentImageUrl={formData.heroImageUrl} 
                onUpload={(url) => setFormData({...formData, heroImageUrl: url})} 
              />
              <div className="mt-2">
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Or Paste URL</label>
                <input type="text" name="heroImageUrl" value={formData.heroImageUrl} onChange={handleChange} className="w-full border p-2 rounded-md text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <ImageUpload 
                label="Principal Photo" 
                currentImageUrl={formData.principalImageUrl} 
                onUpload={(url) => setFormData({...formData, principalImageUrl: url})} 
              />
              <div className="mt-2">
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Or Paste URL</label>
                <input type="text" name="principalImageUrl" value={formData.principalImageUrl} onChange={handleChange} className="w-full border p-2 rounded-md text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Announcement Banner Text</label>
            <input type="text" name="announcementText" value={formData.announcementText} onChange={handleChange} className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500" placeholder="Welcome to the new academic year!" />
          </div>
        </div>
      </div>

      <div className="mt-8 border-t pt-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps Embed HTML</label>
        <textarea name="mapLocation" value={formData.mapLocation} onChange={handleChange} rows={3} className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500" placeholder="<iframe src='...' ></iframe>"></textarea>
      </div>
      
      <div className="mt-8 flex justify-end">
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-lg hover:bg-blue-800 disabled:opacity-50 transition shadow-lg font-bold">
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
}

function AdminManagement() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const { user } = useAuth();

  useEffect(() => { loadAdmins(); }, []);

  async function loadAdmins() {
    try {
      const querySnapshot = await getDocs(collection(db, 'admins'));
      setAdmins(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) { 
      handleFirestoreError(e, OperationType.GET, 'admins'); 
    } finally { 
      setLoading(false); 
    }
  }

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
  };

  if (loading) return <div>Loading admins...</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-4xl mx-auto">
      <h3 className="text-2xl font-bold mb-6">Manage Administrators</h3>
      
      <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> To authorize a new administrator, you currently need to add their 
          UID (User ID) from the Firebase Authentication tab. 
          Alternatively, they can just be given the "Bootstrap Admin" status in the security rules if it's just you.
        </p>
      </div>

      <div className="space-y-4">
        {admins.map(admin => (
          <div key={admin.id} className="flex justify-between items-center p-4 border rounded-lg">
            <div>
              <p className="font-bold">{admin.email}</p>
              <p className="text-xs text-gray-500">UID: {admin.id}</p>
            </div>
            {admin.id !== user?.uid && (
              <button 
                onClick={async () => {
                   if(confirm('Remove this admin?')) {
                     await deleteDoc(doc(db, 'admins', admin.id));
                     loadAdmins();
                   }
                }}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Admin() {
  const { user, isAdmin, loading, loginWithGoogle, logout } = useAuth();
  const location = useLocation();

  if (loading) return <div className="p-20 text-center text-gray-500">Loading...</div>;

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Admin Login</h2>
          {user && !isAdmin ? (
            <div className="mb-6 text-red-600 bg-red-50 p-3 rounded">
              Your account ({user.email}) does not have admin privileges.
            </div>
          ) : (
            <p className="mb-8 text-gray-600">Please sign in with an authorized Google account to continue.</p>
          )}
          
          <button
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition"
          >
            <LogIn className="w-5 h-5" />
            Sign in with Google
          </button>

          {user && (
            <button
              onClick={logout}
              className="mt-4 text-sm text-gray-500 hover:text-gray-800"
            >
              Sign out
            </button>
          )}
        </div>
      </div>
    );
  }

  const tabs = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Notices', path: '/admin/notices', icon: FileText },
    { name: 'Staff', path: '/admin/staff', icon: Users },
    { name: 'Admins', path: '/admin/admins', icon: Users },
    { name: 'Settings', path: '/admin/settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-slate-900 text-white">
        <div className="p-6">
          <h2 className="text-xl font-bold tracking-wider">Admin Panel</h2>
        </div>
        <nav className="mt-6 flex flex-col gap-1 px-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path;
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 mt-auto">
          <div className="bg-slate-800 p-4 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Logged in as</p>
            <p className="text-sm font-medium mb-4 truncate" title={user.email || ''}>{user.email}</p>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 text-sm bg-red-600/20 text-red-500 py-2 rounded border border-red-600/30 hover:bg-red-600 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <Routes>
          <Route path="/" element={<div className="bg-white p-6 rounded-lg shadow"><h3 className="text-2xl font-bold mb-4">Welcome to Admin Dashboard</h3><p>Select a tab from the sidebar to manage content.</p></div>} />
          <Route path="/notices" element={<NoticesAdmin />} />
          <Route path="/staff" element={<StaffAdmin />} />
          <Route path="/admins" element={<AdminManagement />} />
          <Route path="/settings" element={<SettingsAdmin />} />
        </Routes>
      </main>
    </div>
  );
}
