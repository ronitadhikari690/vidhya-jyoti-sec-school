import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, LogOut, LayoutDashboard, FileText, Users, Settings as SettingsIcon, Save, Plus, Trash2, Edit, X, Upload, Cake, Gift, Calendar as CalendarIcon, Image as ImageIcon, Bell, FolderDown, Link as LinkIcon, Download, CheckCircle2, AlertTriangle, Video } from 'lucide-react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { doc, getDoc, setDoc, collection, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { compressImage, uploadImageToStorage } from '../utils/imageCompressor';
import { uploadVideoToStorage, getVideoEmbedInfo } from '../utils/videoUtils';

interface AdminErrorContextType {
  setErrorBanner: (msg: string | null) => void;
  reportError: (error: unknown, operationType: OperationType, path: string | null) => void;
}

const AdminErrorContext = React.createContext<AdminErrorContextType>({
  setErrorBanner: () => {},
  reportError: () => {}
});

export const useAdminError = () => React.useContext(AdminErrorContext);

function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Delete",
  confirmColor = "bg-red-600 hover:bg-red-700"
}: {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  confirmColor?: string;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150 text-left">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
          <Trash2 className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="w-1/2 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`w-1/2 py-2.5 px-4 rounded-xl text-white font-bold text-sm shadow-md transition-colors ${confirmColor}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

function ImageUpload({
  onUpload,
  label,
  currentImageUrl,
  pathPrefix = 'general'
}: {
  onUpload: (url: string) => void;
  label: string;
  currentImageUrl?: string;
  pathPrefix?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `images/${pathPrefix}/${Date.now()}-${sanitizedName}`;
      const downloadUrl = await uploadImageToStorage(file, storagePath);
      onUpload(downloadUrl);
    } catch (err) {
      console.error('Failed to upload image', err);
      alert('Failed to upload image. Please try another image.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleApplyUrl = () => {
    if (customUrl.trim()) {
      onUpload(customUrl.trim());
      setShowUrlInput(false);
      setCustomUrl('');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-xs text-blue-600 hover:underline font-semibold"
        >
          {showUrlInput ? '« Back to File Upload' : '🔗 Or Paste Image URL'}
        </button>
      </div>

      {showUrlInput ? (
        <div className="flex gap-2">
          <input
            type="url"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="flex-1 border p-2 text-xs rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="bg-blue-600 text-white px-3 py-2 text-xs font-bold rounded-lg hover:bg-blue-700"
          >
            Apply URL
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          {currentImageUrl ? (
            <div className="relative w-16 h-16 shrink-0 group">
              <img
                src={currentImageUrl}
                alt="Preview"
                className="w-16 h-16 object-cover rounded-xl border border-gray-200 shadow-sm"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpload('');
                }}
                className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white p-0.5 rounded-full shadow"
                title="Remove Image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : null}
          <div className="flex-1">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-blue-500 bg-gray-50 hover:bg-blue-50/50 rounded-xl p-3 cursor-pointer transition-all group"
            >
              {uploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-blue-600 font-bold">Compressing Image...</span>
                </div>
              ) : (
                <>
                  <Upload className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
                  <span className="text-xs text-gray-600 group-hover:text-blue-600 font-semibold transition-colors">
                    {currentImageUrl ? 'Change / Replace Image' : 'Select Image from Device'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function NoticesAdmin() {
  const { reportError } = useAdminError();
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<any>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

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
      reportError(e, OperationType.GET, 'notices');
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

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteDoc(doc(db, 'notices', deleteTargetId));
      setDeleteTargetId(null);
      if (editingNotice && editingNotice.id === deleteTargetId) {
        setIsSidebarOpen(false);
        setEditingNotice(null);
      }
      loadNotices();
    } catch (e) {
      reportError(e, OperationType.DELETE, `notices/${deleteTargetId}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageUrl = formData.imageUrl;
      if (imageUrl && imageUrl.startsWith('data:image/')) {
        imageUrl = await uploadImageToStorage(imageUrl, `images/notices/${Date.now()}`);
      }

      const payload = {
        ...formData,
        imageUrl,
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
      reportError(e, editingNotice ? OperationType.UPDATE : OperationType.CREATE, 'notices');
    }
  };

  if (loading) return <div>Loading notices...</div>;

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Notices Management</h3>
        <button 
          onClick={() => { 
            setEditingNotice(null); 
            setFormData({
              title: '',
              excerpt: '',
              content: '',
              imageUrl: '',
              date: new Date().toISOString().split('T')[0],
              category: 'General'
            });
            setIsSidebarOpen(true); 
          }}
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
              <button onClick={() => setDeleteTargetId(notice.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full transition"><Trash2 className="w-5 h-5" /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        title="Delete Notice"
        message="Are you sure you want to permanently delete this notice? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />

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
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Content (Optional)</label>
                <textarea rows={6} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500"></textarea>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition">
                {editingNotice ? 'Update Notice' : 'Publish Notice'}
              </button>
              {editingNotice && (
                <button 
                  type="button" 
                  onClick={() => setDeleteTargetId(editingNotice.id)}
                  className="w-full bg-red-50 text-red-600 py-2.5 rounded-lg font-bold hover:bg-red-100 border border-red-200 transition flex items-center justify-center gap-2 mt-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete This Notice
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StaffAdmin() {
  const { reportError } = useAdminError();
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

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
    } catch (e) { reportError(e, OperationType.GET, 'staff'); }
    finally { setLoading(false); }
  }

  const handleEdit = (member: any) => {
    setEditingStaff(member);
    setFormData({ name: member.name, role: member.role, phone: member.phone || '', subject: member.subject || '', imageUrl: member.imageUrl || '', category: member.category });
    setIsSidebarOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteDoc(doc(db, 'staff', deleteTargetId));
      setDeleteTargetId(null);
      if (editingStaff && editingStaff.id === deleteTargetId) {
        setIsSidebarOpen(false);
        setEditingStaff(null);
      }
      loadStaff();
    } catch (e) {
      reportError(e, OperationType.DELETE, `staff/${deleteTargetId}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageUrl = formData.imageUrl;
      if (imageUrl && imageUrl.startsWith('data:image/')) {
        imageUrl = await uploadImageToStorage(imageUrl, `images/staff/${Date.now()}`);
      }
      const payload = { ...formData, imageUrl, updatedAt: serverTimestamp() };
      if (editingStaff) await updateDoc(doc(db, 'staff', editingStaff.id), payload);
      else await addDoc(collection(db, 'staff'), { ...payload, createdAt: serverTimestamp() });
      setIsSidebarOpen(false);
      setEditingStaff(null);
      setFormData({ name: '', role: '', phone: '', subject: '', imageUrl: '', category: 'Teaching' });
      loadStaff();
    } catch (e) { reportError(e, editingStaff ? OperationType.UPDATE : OperationType.CREATE, 'staff'); }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Staff Management</h3>
        <button onClick={() => { setEditingStaff(null); setFormData({ name: '', role: '', phone: '', subject: '', imageUrl: '', category: 'Teaching' }); setIsSidebarOpen(true); }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          <Plus className="w-5 h-5" /> Add Staff Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map((member) => (
          <div key={member.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative group">
            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleEdit(member)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"><Edit className="w-4 h-4" /></button>
              <button onClick={() => setDeleteTargetId(member.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full"><Trash2 className="w-4 h-4" /></button>
            </div>
            <div className="text-xs font-bold text-primary uppercase mb-2">{member.category}</div>
            <h4 className="font-bold text-lg text-gray-900">{member.name}</h4>
            <p className="text-primary font-medium">{member.role}</p>
            {member.subject && <p className="text-sm text-gray-500 mt-1">{member.subject}</p>}
            {member.phone && <p className="text-sm text-gray-500 mt-1">{member.phone}</p>}
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        title="Delete Staff Member"
        message="Are you sure you want to remove this staff member from the directory?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />

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

function BirthdaysAdmin() {
  const { reportError } = useAdminError();
  const [birthdays, setBirthdays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Student (Boy)',
    gradeOrRole: '',
    birthdayDate: new Date().toISOString().split('T')[0],
    photoUrl: '',
    wishMessage: '',
    wishesCount: 0
  });

  const categories = ['Student (Boy)', 'Student (Girl)', 'Teacher', 'Staff'];

  useEffect(() => {
    loadBirthdays();
  }, []);

  async function loadBirthdays() {
    try {
      const querySnapshot = await getDocs(collection(db, 'birthdays'));
      const docs = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a: any, b: any) => (a.birthdayDate || '').localeCompare(b.birthdayDate || ''));
      setBirthdays(docs);
    } catch (e) {
      reportError(e, OperationType.GET, 'birthdays');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a name.');
      return;
    }
    setSubmitting(true);
    try {
      let photoUrl = formData.photoUrl || '';
      if (photoUrl && photoUrl.startsWith('data:image/')) {
        photoUrl = await uploadImageToStorage(photoUrl, `images/birthdays/${Date.now()}`);
      }
      const payload = {
        ...formData,
        photoUrl,
        updatedAt: serverTimestamp()
      };

      if (editingItem) {
        await updateDoc(doc(db, 'birthdays', editingItem.id), payload);
      } else {
        await addDoc(collection(db, 'birthdays'), {
          ...payload,
          createdAt: serverTimestamp()
        });
      }

      setFormData({
        name: '',
        category: 'Student (Boy)',
        gradeOrRole: '',
        birthdayDate: new Date().toISOString().split('T')[0],
        photoUrl: '',
        wishMessage: '',
        wishesCount: 0
      });
      setEditingItem(null);
      setIsSidebarOpen(false);
      loadBirthdays();
    } catch (e) {
      console.error('Failed to save birthday entry:', e);
      reportError(e, editingItem ? OperationType.UPDATE : OperationType.WRITE, 'birthdays');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      category: item.category || 'Student (Boy)',
      gradeOrRole: item.gradeOrRole || '',
      birthdayDate: item.birthdayDate || new Date().toISOString().split('T')[0],
      photoUrl: item.photoUrl || '',
      wishMessage: item.wishMessage || '',
      wishesCount: item.wishesCount || 0
    });
    setIsSidebarOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteDoc(doc(db, 'birthdays', deleteTargetId));
      setDeleteTargetId(null);
      if (editingItem && editingItem.id === deleteTargetId) {
        setIsSidebarOpen(false);
        setEditingItem(null);
      }
      loadBirthdays();
    } catch (e) {
      reportError(e, OperationType.DELETE, 'birthdays');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Cake className="w-6 h-6 text-pink-500" />
          <span>Manage Birthdays (विद्यार्थी र शिक्षक/कर्मचारीको जन्मदिन)</span>
        </h2>
        <button
          onClick={() => {
            setEditingItem(null);
            setFormData({
              name: '',
              category: 'Student (Boy)',
              gradeOrRole: '',
              birthdayDate: new Date().toISOString().split('T')[0],
              photoUrl: '',
              wishMessage: '',
              wishesCount: 0
            });
            setIsSidebarOpen(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Birthday Entry</span>
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading birthday entries...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {birthdays.map((b) => (
            <div key={b.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={b.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                    alt={b.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-primary/20"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900">{b.name}</h3>
                    <p className="text-xs text-gray-500">{b.gradeOrRole}</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-pink-100 text-pink-800 uppercase tracking-wider inline-block mt-1">
                      {b.category}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-2">
                  <span className="font-semibold text-gray-700">Date: </span> {b.birthdayDate}
                </p>
                {b.wishMessage && (
                  <p className="text-xs italic bg-amber-50 text-amber-900 p-2 rounded border border-amber-200 mb-3">
                    "{b.wishMessage}"
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleEdit(b)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteTargetId(b.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {birthdays.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white rounded-xl border border-gray-200 text-gray-500">
              No birthday records found in database yet. Click "Add Birthday Entry" to create one.
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        title="Delete Birthday Record"
        message="Are you sure you want to remove this birthday record?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />

      {/* Slide-over Form Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-6 overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex justify-between items-center mb-6 pb-3 border-b">
              <h3 className="text-xl font-bold">
                {editingItem ? 'Edit Birthday Entry' : 'Add New Birthday Entry'}
              </h3>
              <button onClick={() => setIsSidebarOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Aayush Adhikari"
                  className="w-full border rounded-lg p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category / Role *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full border rounded-lg p-2.5 text-sm"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grade / Subject / Role</label>
                <input
                  type="text"
                  value={formData.gradeOrRole}
                  onChange={(e) => setFormData({ ...formData, gradeOrRole: e.target.value })}
                  placeholder="e.g. Grade 10-A or Science Teacher"
                  className="w-full border rounded-lg p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Birthday Date *</label>
                <input
                  type="date"
                  required
                  value={formData.birthdayDate}
                  onChange={(e) => setFormData({ ...formData, birthdayDate: e.target.value })}
                  className="w-full border rounded-lg p-2.5 text-sm"
                />
              </div>

              <ImageUpload
                label="Photo of Birthday Person"
                currentImageUrl={formData.photoUrl}
                onUpload={(url) => setFormData({ ...formData, photoUrl: url })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Wish / Congratulations Message</label>
                <textarea
                  rows={3}
                  value={formData.wishMessage}
                  onChange={(e) => setFormData({ ...formData, wishMessage: e.target.value })}
                  placeholder="Wishing you a very Happy Birthday! 🎉🎂"
                  className="w-full border rounded-lg p-2.5 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(false)}
                  className="w-1/2 border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 bg-primary text-white py-2.5 rounded-lg hover:bg-primary-dark font-medium disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Entry'}
                </button>
              </div>

              {editingItem && (
                <button
                  type="button"
                  onClick={() => setDeleteTargetId(editingItem.id)}
                  className="w-full bg-red-50 text-red-600 py-2.5 rounded-lg font-bold hover:bg-red-100 border border-red-200 transition flex items-center justify-center gap-2 mt-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete This Birthday Record
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function CalendarEventsAdmin() {
  const { reportError } = useAdminError();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    type: 'Pre-Notice',
    adDate: new Date().toISOString().split('T')[0],
    description: '',
    urgency: 'Important'
  });

  const types = ['Pre-Notice', 'Holiday', 'Event', 'Exam', 'Academic Term'];

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const querySnapshot = await getDocs(collection(db, 'calendar_events'));
      const docs = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a: any, b: any) => (a.adDate || '').localeCompare(b.adDate || ''));
      setEvents(docs);
    } catch (e) {
      reportError(e, OperationType.GET, 'calendar_events');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        updatedAt: serverTimestamp()
      };

      if (editingItem) {
        await updateDoc(doc(db, 'calendar_events', editingItem.id), payload);
      } else {
        await addDoc(collection(db, 'calendar_events'), {
          ...payload,
          createdAt: serverTimestamp()
        });
      }

      setFormData({
        title: '',
        type: 'Pre-Notice',
        adDate: new Date().toISOString().split('T')[0],
        description: '',
        urgency: 'Important'
      });
      setEditingItem(null);
      setIsSidebarOpen(false);
      loadEvents();
    } catch (e) {
      reportError(e, editingItem ? OperationType.UPDATE : OperationType.WRITE, 'calendar_events');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      type: item.type || 'Pre-Notice',
      adDate: item.adDate || new Date().toISOString().split('T')[0],
      description: item.description || '',
      urgency: item.urgency || 'Important'
    });
    setIsSidebarOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteDoc(doc(db, 'calendar_events', deleteTargetId));
      setDeleteTargetId(null);
      if (editingItem && editingItem.id === deleteTargetId) {
        setIsSidebarOpen(false);
        setEditingItem(null);
      }
      loadEvents();
    } catch (e) {
      reportError(e, OperationType.DELETE, 'calendar_events');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-primary" />
          <span>Manage Calendar & Pre-Notices (क्यालेन्डर र पूर्व-सूचना)</span>
        </h2>
        <button
          onClick={() => {
            setEditingItem(null);
            setFormData({
              title: '',
              type: 'Pre-Notice',
              adDate: new Date().toISOString().split('T')[0],
              description: '',
              urgency: 'Important'
            });
            setIsSidebarOpen(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Event / Pre-Notice</span>
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading calendar items...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => (
            <div key={ev.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between">
              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider inline-block mb-2 ${
                  ev.type === 'Pre-Notice' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                  ev.type === 'Holiday' ? 'bg-red-100 text-red-900' :
                  ev.type === 'Exam' ? 'bg-purple-100 text-purple-900' : 'bg-emerald-100 text-emerald-900'
                }`}>
                  {ev.type}
                </span>
                <h3 className="font-bold text-gray-900 mb-1">{ev.title}</h3>
                <p className="text-xs text-gray-500 mb-2">📅 Date: {ev.adDate}</p>
                {ev.description && <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">{ev.description}</p>}
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 mt-3">
                <button onClick={() => handleEdit(ev)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => setDeleteTargetId(ev.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {events.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white rounded-xl border border-gray-200 text-gray-500">
              No calendar items or pre-notices in database. Click "Add Event / Pre-Notice" to create one.
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        title="Delete Calendar Item"
        message="Are you sure you want to remove this calendar / pre-notice entry?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />

      {/* Slide-over Form Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-6 overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex justify-between items-center mb-6 pb-3 border-b">
              <h3 className="text-xl font-bold">
                {editingItem ? 'Edit Calendar Item' : 'Add Calendar Item / Pre-Notice'}
              </h3>
              <button onClick={() => setIsSidebarOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title / Notice *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Pre-Notice: First Term Exam starts in 10 days"
                  className="w-full border rounded-lg p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type / Category *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full border rounded-lg p-2.5 text-sm"
                >
                  {types.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date (AD) *</label>
                <input
                  type="date"
                  required
                  value={formData.adDate}
                  onChange={(e) => setFormData({ ...formData, adDate: e.target.value })}
                  className="w-full border rounded-lg p-2.5 text-sm"
                />
              </div>

              {formData.type === 'Pre-Notice' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Urgency Level</label>
                  <select
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value as any })}
                    className="w-full border rounded-lg p-2.5 text-sm"
                  >
                    <option value="Normal">Normal Alert</option>
                    <option value="Important">Important Pre-Notice</option>
                    <option value="High Alert">🚨 High Alert Deadline</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description / Notes</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add details regarding this event..."
                  className="w-full border rounded-lg p-2.5 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(false)}
                  className="w-1/2 border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 bg-primary text-white py-2.5 rounded-lg hover:bg-primary-dark font-medium disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Entry'}
                </button>
              </div>

              {editingItem && (
                <button
                  type="button"
                  onClick={() => setDeleteTargetId(editingItem.id)}
                  className="w-full bg-red-50 text-red-600 py-2.5 rounded-lg font-bold hover:bg-red-100 border border-red-200 transition flex items-center justify-center gap-2 mt-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete This Calendar Entry
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function DownloadsAdmin() {
  const { reportError } = useAdminError();
  const [downloads, setDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    titleNp: '',
    category: 'routines',
    fileUrl: '',
    fileType: 'PDF',
    fileSize: '1.2 MB',
    publishDate: new Date().toISOString().split('T')[0],
    description: '',
    descriptionNp: ''
  });

  const categories = [
    { id: 'routines', label: 'Exam Routines (परीक्षा तालिका)' },
    { id: 'syllabus', label: 'Syllabus & Questions (पाठ्यक्रम र प्रश्नपत्र)' },
    { id: 'forms', label: 'Application Forms (आवेदन फारमहरू)' },
    { id: 'reports', label: 'Calendar & Reports (क्यालेन्डर तथा प्रतिवेदन)' },
    { id: 'general', label: 'Guidelines & Rules (आचारसंहिता र निर्देशिका)' },
  ];

  useEffect(() => {
    loadDownloads();
  }, []);

  async function loadDownloads() {
    try {
      const q = query(collection(db, 'downloads'), orderBy('publishDate', 'desc'));
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setDownloads(docs);
    } catch (e) {
      reportError(e, OperationType.GET, 'downloads');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.fileUrl.trim()) return;
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        updatedAt: serverTimestamp()
      };

      if (editingItem) {
        await updateDoc(doc(db, 'downloads', editingItem.id), payload);
      } else {
        await addDoc(collection(db, 'downloads'), payload);
      }
      setIsSidebarOpen(false);
      setEditingItem(null);
      loadDownloads();
    } catch (e) {
      reportError(e, editingItem ? OperationType.UPDATE : OperationType.CREATE, 'downloads');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      titleNp: item.titleNp || '',
      category: item.category || 'routines',
      fileUrl: item.fileUrl || '',
      fileType: item.fileType || 'PDF',
      fileSize: item.fileSize || '1.2 MB',
      publishDate: item.publishDate || new Date().toISOString().split('T')[0],
      description: item.description || '',
      descriptionNp: item.descriptionNp || ''
    });
    setIsSidebarOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteDoc(doc(db, 'downloads', deleteTargetId));
      setDeleteTargetId(null);
      if (editingItem && editingItem.id === deleteTargetId) {
        setIsSidebarOpen(false);
        setEditingItem(null);
      }
      loadDownloads();
    } catch (e) {
      reportError(e, OperationType.DELETE, 'downloads');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FolderDown className="w-6 h-6 text-primary" />
          <span>Manage Download Center (डाउनलोड सामग्री व्यवस्थापन)</span>
        </h2>
        <button
          onClick={() => {
            setEditingItem(null);
            setFormData({
              title: '',
              titleNp: '',
              category: 'routines',
              fileUrl: '',
              fileType: 'PDF',
              fileSize: '1.2 MB',
              publishDate: new Date().toISOString().split('T')[0],
              description: '',
              descriptionNp: ''
            });
            setIsSidebarOpen(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Download Item</span>
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading downloads...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {downloads.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase">
                    {item.category}
                  </span>
                  <span className="text-xs text-gray-400 font-semibold">{item.fileType} • {item.fileSize}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1 leading-snug">{item.title}</h3>
                {item.titleNp && <p className="text-xs text-gray-500 mb-2">{item.titleNp}</p>}
                <p className="text-xs text-gray-400 mb-2">📅 Published: {item.publishDate}</p>
                {item.description && <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded line-clamp-2">{item.description}</p>}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-4">
                <a
                  href={item.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  View File Link
                </a>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteTargetId(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {downloads.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white rounded-xl border border-gray-200 text-gray-500">
              No download records created in Firestore yet. Click "Add Download Item" above. Default curated documents are shown to users until custom items are added.
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        title="Delete Download Document"
        message="Are you sure you want to delete this downloadable document?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />

      {/* Slide-over Form Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-white w-full max-w-lg h-full p-6 overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex justify-between items-center mb-6 pb-3 border-b">
              <h3 className="text-xl font-bold">
                {editingItem ? 'Edit Download Document' : 'Add Download Document'}
              </h3>
              <button onClick={() => setIsSidebarOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document Title (English) *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. First Term Exam Routine 2081"
                  className="w-full border rounded-lg p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document Title (Nepali)</label>
                <input
                  type="text"
                  value={formData.titleNp}
                  onChange={(e) => setFormData({ ...formData, titleNp: e.target.value })}
                  placeholder="e.g. प्रथम त्रैमासिक परीक्षा तालिका २०८१"
                  className="w-full border rounded-lg p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full border rounded-lg p-2.5 text-sm"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File / Cloud URL (Google Drive, Dropbox, PDF link) *</label>
                <input
                  type="url"
                  required
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  placeholder="https://drive.google.com/... or direct PDF link"
                  className="w-full border rounded-lg p-2.5 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File Format</label>
                  <select
                    value={formData.fileType}
                    onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
                    className="w-full border rounded-lg p-2.5 text-sm"
                  >
                    <option value="PDF">PDF Document</option>
                    <option value="DOCX">Word Document (.docx)</option>
                    <option value="XLSX">Excel Spreadsheet (.xlsx)</option>
                    <option value="ZIP">ZIP Archive (.zip)</option>
                    <option value="IMAGE">Image File</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Approx Size</label>
                  <input
                    type="text"
                    value={formData.fileSize}
                    onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                    placeholder="e.g. 1.2 MB or 450 KB"
                    className="w-full border rounded-lg p-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Publish Date *</label>
                <input
                  type="date"
                  required
                  value={formData.publishDate}
                  onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                  className="w-full border rounded-lg p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (English)</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief note about this document..."
                  className="w-full border rounded-lg p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Nepali)</label>
                <textarea
                  rows={2}
                  value={formData.descriptionNp}
                  onChange={(e) => setFormData({ ...formData, descriptionNp: e.target.value })}
                  placeholder="दस्तावेज सम्बन्धी संक्षिप्त विवरण..."
                  className="w-full border rounded-lg p-2.5 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(false)}
                  className="w-1/2 border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 bg-primary text-white py-2.5 rounded-lg hover:bg-primary-dark font-medium disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Document'}
                </button>
              </div>

              {editingItem && (
                <button
                  type="button"
                  onClick={() => setDeleteTargetId(editingItem.id)}
                  className="w-full bg-red-50 text-red-600 py-2.5 rounded-lg font-bold hover:bg-red-100 border border-red-200 transition flex items-center justify-center gap-2 mt-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete This Download Document
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function GalleryAdmin() {
  const { reportError } = useAdminError();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Annual Function',
    mediaType: 'image',
    url: '',
    description: '',
    eventDate: new Date().toISOString().split('T')[0]
  });

  const categories = ['Annual Function', 'Sports Week', 'Friday ECA', 'Science Exhibition', 'General'];

  useEffect(() => {
    loadGallery();
  }, []);

  async function loadGallery() {
    try {
      const querySnapshot = await getDocs(collection(db, 'gallery'));
      const docs = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setItems(docs);
    } catch (e) {
      reportError(e, OperationType.GET, 'gallery');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.url.trim()) return;
    setSubmitting(true);
    try {
      let finalUrl = formData.url;
      if (formData.mediaType === 'image' && formData.url.startsWith('data:image')) {
        finalUrl = await uploadImageToStorage(formData.url, `images/gallery/${Date.now()}`);
      }

      const payload = {
        ...formData,
        url: finalUrl,
        updatedAt: serverTimestamp()
      };

      if (editingItem) {
        await updateDoc(doc(db, 'gallery', editingItem.id), payload);
      } else {
        await addDoc(collection(db, 'gallery'), {
          ...payload,
          createdAt: serverTimestamp()
        });
      }

      setFormData({
        title: '',
        category: 'Annual Function',
        mediaType: 'image',
        url: '',
        description: '',
        eventDate: new Date().toISOString().split('T')[0]
      });
      setEditingItem(null);
      setIsSidebarOpen(false);
      loadGallery();
    } catch (e) {
      reportError(e, editingItem ? OperationType.UPDATE : OperationType.WRITE, 'gallery');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      category: item.category || 'Annual Function',
      mediaType: item.mediaType || 'image',
      url: item.url || '',
      description: item.description || '',
      eventDate: item.eventDate || new Date().toISOString().split('T')[0]
    });
    setIsSidebarOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteDoc(doc(db, 'gallery', deleteTargetId));
      setDeleteTargetId(null);
      if (editingItem && editingItem.id === deleteTargetId) {
        setIsSidebarOpen(false);
        setEditingItem(null);
      }
      loadGallery();
    } catch (e) {
      reportError(e, OperationType.DELETE, 'gallery');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ImageIcon className="w-6 h-6 text-indigo-600" />
          <span>Manage Gallery (ग्यालरी फोटो तथा भिडियोहरू)</span>
        </h2>
        <button
          onClick={() => {
            setEditingItem(null);
            setFormData({
              title: '',
              category: 'Annual Function',
              mediaType: 'image',
              url: '',
              description: '',
              eventDate: new Date().toISOString().split('T')[0]
            });
            setIsSidebarOpen(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Media Item</span>
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading gallery items...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((g) => (
            <div key={g.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between">
              <div>
                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3">
                  <img src={g.url} alt={g.title} className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    {g.category}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{g.title}</h3>
                {g.description && <p className="text-xs text-gray-500 line-clamp-2">{g.description}</p>}
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 mt-3">
                <button onClick={() => handleEdit(g)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => setDeleteTargetId(g.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white rounded-xl border border-gray-200 text-gray-500">
              No custom gallery items in database yet. Click "Add Media Item" to create one.
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        title="Delete Gallery Item"
        message="Are you sure you want to delete this media item from the gallery?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />

      {/* Form Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-6 overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex justify-between items-center mb-6 pb-3 border-b">
              <h3 className="text-xl font-bold">{editingItem ? 'Edit Gallery Item' : 'Add Gallery Item'}</h3>
              <button onClick={() => setIsSidebarOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Annual Function Cultural Dance 2082"
                  className="w-full border rounded-lg p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full border rounded-lg p-2.5 text-sm"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Media Type *</label>
                <select
                  value={formData.mediaType}
                  onChange={(e) => setFormData({ ...formData, mediaType: e.target.value as any })}
                  className="w-full border rounded-lg p-2.5 text-sm"
                >
                  <option value="image">Image / Photo</option>
                  <option value="video">Video (YouTube / Direct Link)</option>
                </select>
              </div>

              {formData.mediaType === 'image' ? (
                <ImageUpload
                  label="Upload Photo"
                  currentImageUrl={formData.url}
                  onUpload={(url) => setFormData({ ...formData, url })}
                />
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Video URL (YouTube Embed Link) *</label>
                  <input
                    type="url"
                    required
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="e.g. https://www.youtube.com/embed/dQw4w9WgXcQ"
                    className="w-full border rounded-lg p-2.5 text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Details about this event photo or video..."
                  className="w-full border rounded-lg p-2.5 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(false)}
                  className="w-1/2 border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 bg-primary text-white py-2.5 rounded-lg hover:bg-primary-dark font-medium disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Item'}
                </button>
              </div>

              {editingItem && (
                <button
                  type="button"
                  onClick={() => setDeleteTargetId(editingItem.id)}
                  className="w-full bg-red-50 text-red-600 py-2.5 rounded-lg font-bold hover:bg-red-100 border border-red-200 transition flex items-center justify-center gap-2 mt-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete This Gallery Item
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsAdmin() {
  const { reportError } = useAdminError();
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
    heroMediaType: 'image',
    heroVideoUrl: '',
    school_logo_url: '',
    announcementText: '',
    helplineTitle: '',
    helplineLocation: '',
    helplineProvince: '',
    helplinePhone: '',
    helplineHours: '',
    helplineEmail: '',
    helplineDept: ''
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
            heroMediaType: data.heroMediaType || (data.heroVideoUrl ? 'video' : 'image'),
            heroVideoUrl: data.heroVideoUrl || '',
            school_logo_url: data.school_logo_url || '',
            announcementText: data.announcementText || '',
            helplineTitle: data.helplineTitle || '',
            helplineLocation: data.helplineLocation || '',
            helplineProvince: data.helplineProvince || '',
            helplinePhone: data.helplinePhone || '',
            helplineHours: data.helplineHours || '',
            helplineEmail: data.helplineEmail || '',
            helplineDept: data.helplineDept || ''
          });
        }
      } catch (e) {
        reportError(e, OperationType.GET, 'settings/general');
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const [uploadingVideo, setUploadingVideo] = useState(false);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVideo(true);
    try {
      const storagePath = `videos/hero-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const downloadUrl = await uploadVideoToStorage(file, storagePath);
      setFormData(prev => ({
        ...prev,
        heroVideoUrl: downloadUrl,
        heroMediaType: 'video'
      }));
      alert('Video uploaded successfully!');
    } catch (err: any) {
      console.error('Failed to upload video:', err);
      reportError(err, OperationType.WRITE, 'storage/videos');
      alert('Failed to upload video. You can also paste a YouTube or Vimeo link.');
    } finally {
      setUploadingVideo(false);
      if (videoFileInputRef.current) {
        videoFileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, 'settings', 'general');
      const phones = formData.phoneNumbers.split(',').map(p => p.trim()).filter(p => p !== '');
      
      let heroImageUrl = formData.heroImageUrl || '';
      if (heroImageUrl.startsWith('data:image/')) {
        heroImageUrl = await uploadImageToStorage(heroImageUrl, `images/settings/hero-${Date.now()}`);
      }
      let principalImageUrl = formData.principalImageUrl || '';
      if (principalImageUrl.startsWith('data:image/')) {
        principalImageUrl = await uploadImageToStorage(principalImageUrl, `images/settings/principal-${Date.now()}`);
      }
      let school_logo_url = formData.school_logo_url || '';
      if (school_logo_url.startsWith('data:image/')) {
        school_logo_url = await uploadImageToStorage(school_logo_url, `images/settings/logo-${Date.now()}`);
      }

      const payload = {
        ...formData,
        heroImageUrl,
        principalImageUrl,
        school_logo_url,
        phoneNumbers: phones,
        updatedAt: serverTimestamp()
      };

      await setDoc(docRef, payload, { merge: true });
      setFormData(prev => ({
        ...prev,
        heroImageUrl,
        principalImageUrl,
        school_logo_url
      }));
      alert('Settings saved successfully!');
    } catch (e) {
      reportError(e, OperationType.UPDATE, 'settings/general');
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
          <h4 className="font-bold text-primary border-b pb-2 pt-4">Quick School Helpline (Homepage Banner)</h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Helpline Title</label>
            <input type="text" name="helplineTitle" value={formData.helplineTitle} onChange={handleChange} className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500" placeholder="Quick School Helpline" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Helpline Location / Address</label>
            <input type="text" name="helplineLocation" value={formData.helplineLocation} onChange={handleChange} className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500" placeholder="Khahare, Lamjung, Nepal" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Helpline Province / Region</label>
            <input type="text" name="helplineProvince" value={formData.helplineProvince} onChange={handleChange} className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500" placeholder="Gandaki Province" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Helpline Phone Numbers</label>
            <input type="text" name="helplinePhone" value={formData.helplinePhone} onChange={handleChange} className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500" placeholder="+977 066-XXXXXX / 98XXXXXXXX" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Helpline Office Hours</label>
            <input type="text" name="helplineHours" value={formData.helplineHours} onChange={handleChange} className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500" placeholder="Sunday - Friday: 9:00 AM - 4:30 PM" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Helpline Email Address</label>
            <input type="email" name="helplineEmail" value={formData.helplineEmail} onChange={handleChange} className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500" placeholder="info@vidhyajyoti.edu.np" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Helpline Department / Desk</label>
            <input type="text" name="helplineDept" value={formData.helplineDept} onChange={handleChange} className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500" placeholder="Administrative Office" />
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
                label="School Logo" 
                currentImageUrl={formData.school_logo_url} 
                onUpload={(url) => setFormData({...formData, school_logo_url: url})} 
              />
              <div className="mt-2">
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Or Paste URL</label>
                <input type="text" name="school_logo_url" value={formData.school_logo_url} onChange={handleChange} className="w-full border p-2 rounded-md text-sm focus:ring-2 focus:ring-blue-500" placeholder="https://..." />
              </div>
            </div>
            {/* Hero Section Media: Photo vs Video */}
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/80 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-gray-800 text-sm">Hero Background Media</h5>
                  <p className="text-xs text-gray-500">Choose whether the homepage displays a photo or a video background</p>
                </div>
                {/* Media Type Toggle */}
                <div className="flex items-center p-1 bg-gray-200 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, heroMediaType: 'image' }))}
                    className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                      formData.heroMediaType !== 'video' 
                        ? 'bg-white text-blue-700 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, heroMediaType: 'video' }))}
                    className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                      formData.heroMediaType === 'video' 
                        ? 'bg-white text-blue-700 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Video</span>
                  </button>
                </div>
              </div>

              {/* Video URL & Upload */}
              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Hero Video URL (YouTube, Vimeo, Facebook, or MP4)
                    </label>
                    <span className="text-[11px] text-blue-600 font-medium">Auto-loops & muted</span>
                  </div>
                  <input
                    type="text"
                    name="heroVideoUrl"
                    value={formData.heroVideoUrl}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-md text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                    placeholder="e.g. YouTube, Vimeo, Facebook video, or MP4 URL"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    Accepts YouTube links, Vimeo links, Facebook video links, or direct MP4/WebM video links.
                  </p>
                </div>

                {/* Upload MP4 file */}
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={videoFileInputRef}
                    onChange={handleVideoUpload}
                    accept="video/mp4,video/webm"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => videoFileInputRef.current?.click()}
                    disabled={uploadingVideo}
                    className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {uploadingVideo ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>Uploading Video...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 text-gray-600" />
                        <span>Upload MP4 / WebM Video</span>
                      </>
                    )}
                  </button>
                  {formData.heroVideoUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, heroVideoUrl: '' }))}
                      className="text-xs text-red-500 hover:text-red-700 underline cursor-pointer"
                    >
                      Clear Video
                    </button>
                  )}
                </div>

                {/* Video Live Preview in Admin */}
                {formData.heroVideoUrl && (
                  <div className="mt-3 p-2 bg-slate-900 rounded-lg overflow-hidden flex flex-col items-center justify-center">
                    <span className="text-[11px] font-semibold text-gray-400 mb-1.5 self-start">Video Live Preview:</span>
                    {(() => {
                      const info = getVideoEmbedInfo(formData.heroVideoUrl);
                      if (!info) return <span className="text-gray-400 text-xs py-4">Invalid video URL</span>;
                      if (info.type === 'youtube' || info.type === 'vimeo' || info.type === 'facebook') {
                        return (
                          <iframe
                            src={info.embedUrl}
                            className="w-full aspect-video max-h-48 rounded border-0"
                            title="Video Preview"
                            allow="autoplay; encrypted-media"
                          />
                        );
                      }
                      return (
                        <video src={info.srcUrl} controls className="w-full max-h-48 rounded object-contain" />
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Poster / Fallback Image */}
              <div className="pt-3 border-t border-slate-200">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {formData.heroMediaType === 'video' ? 'Video Poster / Fallback Image' : 'Hero Section Image'}
                </label>
                <p className="text-[11px] text-gray-500 mb-2">
                  {formData.heroMediaType === 'video' 
                    ? 'Shown while the video loads or on devices where video autoplay is restricted.'
                    : 'Shown as the main background banner on the homepage.'}
                </p>
                <ImageUpload 
                  label="" 
                  currentImageUrl={formData.heroImageUrl} 
                  onUpload={(url) => setFormData({...formData, heroImageUrl: url})} 
                />
                <div className="mt-2">
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Or Paste Image URL</label>
                  <input 
                    type="text" 
                    name="heroImageUrl" 
                    value={formData.heroImageUrl} 
                    onChange={handleChange} 
                    className="w-full border p-2 rounded-md text-sm focus:ring-2 focus:ring-blue-500 bg-white" 
                  />
                </div>
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
  const { reportError } = useAdminError();
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => { loadAdmins(); }, []);

  async function loadAdmins() {
    try {
      const querySnapshot = await getDocs(collection(db, 'admins'));
      setAdmins(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) { 
      reportError(e, OperationType.GET, 'admins'); 
    } finally { 
      setLoading(false); 
    }
  }

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteDoc(doc(db, 'admins', deleteTargetId));
      setDeleteTargetId(null);
      loadAdmins();
    } catch (e) {
      reportError(e, OperationType.DELETE, 'admins');
    }
  };

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
                onClick={() => setDeleteTargetId(admin.id)}
                className="text-red-500 hover:text-red-700 p-2"
                title="Remove Admin"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        title="Remove Administrator"
        message="Are you sure you want to revoke admin privileges for this account?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}

export default function Admin() {
  const { user, isAdmin, loading, isLoggingIn, loginError, loginWithGoogle, logout } = useAuth();
  const location = useLocation();
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const reportError = (error: unknown, operationType: OperationType, path: string | null) => {
    try {
      handleFirestoreError(error, operationType, path);
    } catch (err: any) {
      setErrorBanner(err.message);
    }
  };

  if (loading) return <div className="p-20 text-center text-gray-500">Loading...</div>;

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Admin Login</h2>
          {user && !isAdmin ? (
            <div className="mb-6 text-red-600 bg-red-50 p-3 rounded text-sm">
              Your account ({user.email}) does not have admin privileges.
            </div>
          ) : (
            <p className="mb-6 text-gray-600">Please sign in with an authorized Google account to continue.</p>
          )}

          {loginError && (
            <div className="mb-6 text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded text-sm">
              {loginError}
            </div>
          )}
          
          <button
            onClick={loginWithGoogle}
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
          >
            {isLoggingIn ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Opening Google Sign-In...</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Sign in with Google</span>
              </>
            )}
          </button>

          {user && (
            <button
              onClick={logout}
              className="mt-4 text-sm text-gray-500 hover:text-gray-800 block mx-auto cursor-pointer"
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
    { name: 'Calendar & Pre-Notices', path: '/admin/calendar', icon: CalendarIcon },
    { name: 'Downloads 📁', path: '/admin/downloads', icon: FolderDown },
    { name: 'Gallery 📸', path: '/admin/gallery', icon: ImageIcon },
    { name: 'Notices', path: '/admin/notices', icon: FileText },
    { name: 'Staff', path: '/admin/staff', icon: Users },
    { name: 'Birthdays 🎂', path: '/admin/birthdays', icon: Cake },
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
        {errorBanner && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <span className="text-sm font-medium">{errorBanner}</span>
            </div>
            <button
              onClick={() => setErrorBanner(null)}
              className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-100 transition cursor-pointer"
              title="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <AdminErrorContext.Provider value={{ setErrorBanner, reportError }}>
          <Routes>
            <Route path="/" element={<div className="bg-white p-6 rounded-lg shadow"><h3 className="text-2xl font-bold mb-4">Welcome to Admin Dashboard</h3><p>Select a tab from the sidebar to manage content.</p></div>} />
            <Route path="/calendar" element={<CalendarEventsAdmin />} />
            <Route path="/downloads" element={<DownloadsAdmin />} />
            <Route path="/gallery" element={<GalleryAdmin />} />
            <Route path="/notices" element={<NoticesAdmin />} />
            <Route path="/staff" element={<StaffAdmin />} />
            <Route path="/birthdays" element={<BirthdaysAdmin />} />
            <Route path="/admins" element={<AdminManagement />} />
            <Route path="/settings" element={<SettingsAdmin />} />
          </Routes>
        </AdminErrorContext.Provider>
      </main>
    </div>
  );
}
