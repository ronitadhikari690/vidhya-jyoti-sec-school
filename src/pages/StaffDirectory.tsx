import React, { useState, useEffect, useRef } from 'react';
import { Search, Phone, BookOpen, User, Upload, Trash2, Edit, Save, Plus, Database, AlertCircle, CheckCircle2 } from 'lucide-react';
import { collection, query, orderBy, getDocs, where, addDoc, serverTimestamp, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { InlineEdit } from '../components/InlineEdit';

function ImageUpload({ currentImageUrl, onUpload }: { currentImageUrl?: string, onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large. Please use an image under 2MB.");
      return;
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
    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer rounded-full backdrop-blur-[1px] z-10" onClick={() => fileInputRef.current?.click()}>
      {uploading ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <>
          <Upload className="w-5 h-5 text-white mb-0.5 drop-shadow-md" />
          <span className="text-[8px] text-white font-bold uppercase tracking-wider drop-shadow-md">Change</span>
        </>
      )}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
    </div>
  );
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  phone?: string;
  category: string;
  imageUrl?: string;
  subject?: string;
}

export default function StaffDirectory() {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [staffGroups, setStaffGroups] = useState<{ [key: string]: StaffMember[] }>({
    'Teaching': [
      { id: 't1', name: 'सूर्यबहादुर के.सी.', role: 'प्रधानाध्यापक (Principal)', phone: '९८५६०४०७१५', category: 'Teaching' },
      { id: 't2', name: 'बालकृष्ण अधिकारी', role: 'सहायक प्रधानाध्यापक', phone: '९८४६१५०४१४', category: 'Teaching' },
      { id: 't3', name: 'खुशिराम खनिया', role: 'शिक्षक', phone: '९८४६५१३०७६', category: 'Teaching' },
      { id: 't4', name: 'गौतम पोखरेल', role: 'शिक्षक', phone: '९८४१८५३६६७', category: 'Teaching' },
      { id: 't5', name: 'बासुदेव काफ्ले', role: 'शिक्षक', phone: '९८४१०२१३०८', category: 'Teaching' },
      { id: 't6', name: 'राजु अधिकारी', role: 'शिक्षक', phone: '९८४६२७८५०६', category: 'Teaching' },
      { id: 't7', name: 'आनन्द धिताल', role: 'शिक्षक', phone: '९८४३०८९४४२', category: 'Teaching' },
      { id: 't8', name: 'अरुणा खड्का', role: 'शिक्षक', phone: '९८६०११३६८०', category: 'Teaching' },
      { id: 't9', name: 'धनदेवी बराल', role: 'शिक्षक', phone: '९८४६२४०९७५', category: 'Teaching' },
      { id: 't10', name: 'चिन्तामणि अधिकारी', role: 'शिक्षक', phone: '९८४६२७१८१२', category: 'Teaching' },
      { id: 't11', name: 'पशुपति न्यौपाने', role: 'शिक्षक', phone: '९८४६४२५९४५', category: 'Teaching' },
      { id: 't12', name: 'कबिता मण्डारी', role: 'शिक्षक', phone: '९८४०२३७५९४', category: 'Teaching' },
      { id: 't13', name: 'काजल श्रेष्ठ', role: 'शिक्षक', phone: '९८६६०२५१२१', category: 'Teaching' },
      { id: 't14', name: 'सूर्य कुमार अधिकारी', role: 'शिक्षक', phone: '९८४६१२०६५३', category: 'Teaching' },
      { id: 't15', name: 'प्रेमराज सापकोटा', role: 'शिक्षक', phone: '९८४६०९८४२२', category: 'Teaching' },
      { id: 't16', name: 'हस्तवहादुर गुरुङ', role: 'शिक्षक', phone: '९८५६०४२७७२', category: 'Teaching' },
      { id: 't17', name: 'विनोड खनिया', role: 'शिक्षक', phone: '९८४९२६७७६२', category: 'Teaching' },
      { id: 't18', name: 'रमाकान्त ढुङ्गाना', role: 'शिक्षक', phone: '९८४६१२५०१८', category: 'Teaching' },
      { id: 't19', name: 'सावित्रा के.सी.', role: 'शिक्षक', phone: '९८६१७८६५७१', category: 'Teaching' },
      { id: 't20', name: 'एलिजा अधिकारी', role: 'शिक्षक', phone: '९८१३२३३७४७', category: 'Teaching' },
      { id: 't21', name: 'धनमाया बसेल', role: 'शिक्षक', phone: '९८४६०६९४६४', category: 'Teaching' },
      { id: 't22', name: 'जुना गुरुङ', role: 'शिक्षक', phone: '९८४६१७०७९२', category: 'Teaching' },
      { id: 't23', name: 'मनिषा के.सी.', role: 'शिक्षक', phone: '९८४६१९२३२३', category: 'Teaching' },
      { id: 't24', name: 'अनिता गोली', role: 'शिक्षक', phone: '९८४३२८३८०८', category: 'Teaching' },
      { id: 't25', name: 'दिपना अधिकारी', role: 'शिक्षक', phone: '९८४६४१७३९२', category: 'Teaching' },
      { id: 't26', name: 'रेखा अधिकारी', role: 'शिक्षक', phone: '९८४६१६१७१७', category: 'Teaching' },
    ],
    'Non-Teaching': [
      { id: 'nt1', name: 'गणेश तामाङ', role: 'कार्यालय सहायक', phone: '९८४६१४३७१३', category: 'Non-Teaching' },
      { id: 'nt2', name: 'सरला अधिकारी', role: 'कार्यालय सहायक', phone: '९८६२३९३६५५', category: 'Non-Teaching' },
      { id: 'nt3', name: 'चन्द्रबहादुर गुरुङ', role: 'कार्यालय सहायक', phone: '९८६१०६६९६९', category: 'Non-Teaching' },
      { id: 'nt4', name: 'सविता अधिकारी', role: 'सहायक कर्मचारी', phone: '९८६६०५२४२३', category: 'Non-Teaching' },
      { id: 'nt5', name: 'कमला बसेल', role: 'सहायक कर्मचारी', phone: '९८४६६११४०६', category: 'Non-Teaching' },
    ]
  });

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  useEffect(() => {
    async function loadStaff() {
      try {
        const q = query(
          collection(db, 'staff'), 
          where('category', 'in', ['Teaching', 'Non-Teaching'])
        );
        const querySnapshot = await getDocs(q);
        const dbDocs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        if (dbDocs.length > 0) {
          setStaffGroups(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(cat => {
              updated[cat] = updated[cat].map((hMember: StaffMember) => {
                const dbMember = dbDocs.find((d: any) => d.name === hMember.name && d.category === hMember.category);
                return dbMember ? { ...hMember, ...dbMember } : hMember;
              });
            });
            return updated;
          });
        }
      } catch (e) {
        console.warn("Using fallback staff data", e);
      } finally {
        setLoading(false);
      }
    }
    loadStaff();
  }, []);

  const filterList = (list: any[]) => {
    return list.filter(member => 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.subject && member.subject.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const teachingStaff = filterList(staffGroups['Teaching']);
  const nonTeachingStaff = filterList(staffGroups['Non-Teaching']);

  const handleUpdateImage = async (memberId: string, url: string) => {
    try {
      setActionLoading(true);
      
      // Find member info in current state
      let memberInfo: StaffMember | null = null;
      Object.values(staffGroups).forEach((group: StaffMember[]) => {
        const m = group.find((m: StaffMember) => m.id === memberId);
        if (m) memberInfo = m;
      });

      if (!memberInfo) throw new Error("Member not found");

      const staffRef = collection(db, 'staff');
      let docRef;

      // Check if this member is already in Firestore (by name/category)
      const q = query(staffRef, where('name', '==', memberInfo.name), where('category', '==', memberInfo.category));
      const snap = await getDocs(q);

      if (!snap.empty) {
        docRef = doc(db, 'staff', snap.docs[0].id);
        await updateDoc(docRef, { imageUrl: url, updatedAt: serverTimestamp() });
      } else {
        const { id, ...cleanInfo } = memberInfo; // remove local ID
        const newDoc = await addDoc(staffRef, { ...cleanInfo, imageUrl: url, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        docRef = newDoc;
      }

      // Update local state
      const updatedGroups = { ...staffGroups };
      Object.keys(updatedGroups).forEach(cat => {
        updatedGroups[cat] = updatedGroups[cat].map(m => m.id === memberId ? { ...m, imageUrl: url, id: docRef.id } : m);
      });
      setStaffGroups(updatedGroups);
      showStatus('success', 'Photo updated successfully!');
    } catch (e) {
      console.error(e);
      showStatus('error', 'Failed to update photo.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleImportOfficialData = async () => {
    if (!window.confirm("This will import official school records (26 teaching staff, 5 non-teaching) into your database. Continue?")) return;
    
    setActionLoading(true);
    try {
      const teaching = [
        { name: 'सूर्यबहादुर के.सी.', role: 'प्रधानाध्यापक (Principal)', phone: '९८५६०४०७१५', category: 'Teaching' },
        { name: 'बालकृष्ण अधिकारी', role: 'सहायक प्रधानाध्यापक', phone: '९८४६१५०४१४', category: 'Teaching' },
        { name: 'खुशिराम खनिया', role: 'शिक्षक', phone: '९८४६५१३०७६', category: 'Teaching' },
        { name: 'गौतम पोखरेल', role: 'शिक्षक', phone: '९८४१८५३६६७', category: 'Teaching' },
        { name: 'बासुदेव काफ्ले', role: 'शिक्षक', phone: '९८४१०२१३०८', category: 'Teaching' },
        { name: 'राजु अधिकारी', role: 'शिक्षक', phone: '९८४६२७८५०६', category: 'Teaching' },
        { name: 'आनन्द धिताल', role: 'शिक्षक', phone: '९८४३०८९४४२', category: 'Teaching' },
        { name: 'अरुणा खड्का', role: 'शिक्षक', phone: '९८६०११३६८०', category: 'Teaching' },
        { name: 'धनदेवी बराल', role: 'शिक्षक', phone: '९८४६२४०९७५', category: 'Teaching' },
        { name: 'चिन्तामणि अधिकारी', role: 'शिक्षक', phone: '९८४६२७१८१२', category: 'Teaching' },
        { name: 'पशुपति न्यौपाने', role: 'शिक्षक', phone: '९८४६४२५९४५', category: 'Teaching' },
        { name: 'कबिता मण्डारी', role: 'शिक्षक', phone: '९८४०२३७५९४', category: 'Teaching' },
        { name: 'काजल श्रेष्ठ', role: 'शिक्षक', phone: '९८६६०२५१२१', category: 'Teaching' },
        { name: 'सूर्य कुमार अधिकारी', role: 'शिक्षक', phone: '९८४६१२०६५३', category: 'Teaching' },
        { name: 'प्रेमराज सापकोटा', role: 'शिक्षक', phone: '९८४६०९८४२२', category: 'Teaching' },
        { name: 'हस्तवहादुर गुरुङ', role: 'शिक्षक', phone: '९८५६०४२७७२', category: 'Teaching' },
        { name: 'विनोड खनिया', role: 'शिक्षक', phone: '९८४९२६७७६२', category: 'Teaching' },
        { name: 'रमाकान्त ढुङ्गाना', role: 'शिक्षक', phone: '९८४६१२५०१८', category: 'Teaching' },
        { name: 'सावित्रा के.सी.', role: 'शिक्षक', phone: '९८६१७८६५७१', category: 'Teaching' },
        { name: 'एलिजा अधिकारी', role: 'शिक्षक', phone: '९८१३२३३७४७', category: 'Teaching' },
        { name: 'धनमाया बसेल', role: 'शिक्षक', phone: '९८४६०६९४६४', category: 'Teaching' },
        { name: 'जुना गुरुङ', role: 'शिक्षक', phone: '९८४६१७०७९२', category: 'Teaching' },
        { name: 'मनिषा के.सी.', role: 'शिक्षक', phone: '९८४६१९२३२३', category: 'Teaching' },
        { name: 'अनिता गोली', role: 'शिक्षक', phone: '९८४३२८३८०८', category: 'Teaching' },
        { name: 'दिपना अधिकारी', role: 'शिक्षक', phone: '९८४६४१७३९२', category: 'Teaching' },
        { name: 'रेखा अधिकारी', role: 'शिक्षक', phone: '९८४६१६१७१७', category: 'Teaching' },
      ];

      const nonTeaching = [
        { name: 'गणेश तामाङ', role: 'कार्यालय सहायक', phone: '९८४६१४३७१३', category: 'Non-Teaching' },
        { name: 'सरला अधिकारी', role: 'कार्यालय सहायक', phone: '९८६२३९३६५५', category: 'Non-Teaching' },
        { name: 'चन्द्रबहादुर गुरुङ', role: 'कार्यालय सहायक', phone: '९८६१०६६९६९', category: 'Non-Teaching' },
        { name: 'सविता अधिकारी', role: 'सहायक कर्मचारी', phone: '९८६६०५२४२३', category: 'Non-Teaching' },
        { name: 'कमला बसेल', role: 'सहायक कर्मचारी', phone: '९८४६६११४०६', category: 'Non-Teaching' },
      ];

      const all = [...teaching, ...nonTeaching];
      const staffRef = collection(db, 'staff');
      
      for (const item of all) {
        await addDoc(staffRef, {
          ...item,
          imageUrl: '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      showStatus('success', `Imported ${all.length} staff records successfully! Refreshing...`);
      window.location.reload();
    } catch (e) {
      console.error(e);
      showStatus('error', 'Import failed. Check console for details.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-light py-12 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-light py-12 min-h-screen relative">
      {/* Floating Status Message */}
      {statusMessage && (
        <div className={`fixed top-24 right-4 z-[100] p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right border ${
          statusMessage.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
          <span className="font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* Admin Quick Action Button */}
      {isAdmin && (
        <div className="fixed bottom-8 right-8 z-50 group">
          <div className="absolute bottom-full right-0 mb-4 flex flex-col gap-2 items-end opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
            <button 
              onClick={handleImportOfficialData}
              disabled={actionLoading}
              className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-lg border border-gray-200 flex items-center gap-2 hover:bg-gray-50 transition min-w-[200px]"
            >
              <Database className="w-4 h-4 text-blue-600" />
              <span>Import Official Staff</span>
            </button>
            <p className="bg-slate-800 text-white text-[10px] px-2 py-1 rounded">Admin Mode Active</p>
          </div>
          <button className="bg-primary text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform">
            <Database className="w-6 h-6" />
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 np-text">
            <InlineEdit settingKey="staffTitle" fallback={t('Staff Directory', 'शिक्षक तथा कर्मचारी विवरण')} />
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8 np-text">
            <InlineEdit settingKey="staffSubtitle" fallback={t('Meet our dedicated team of educators and staff members.', 'हाम्रा समर्पित शिक्षक र कर्मचारीहरूको टोलीलाई भेट्नुहोस्।')} as="span" />
          </p>
          
          <div className="max-w-md mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm shadow-sm np-text"
              placeholder={t('Search by name...', 'नामबाट खोज्नुहोस्...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-12">
          {/* Teaching Staff */}
          {teachingStaff.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 np-text flex items-center gap-2 border-l-4 border-primary pl-4">
                {t('Teaching Staff', 'शिक्षक कर्मचारी')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teachingStaff.map(member => (
                  <div key={member.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4 hover:shadow-md transition-shadow group relative">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center border-4 border-white shadow-sm group-hover:border-primary/20 group-hover:scale-105 transition-all duration-300 overflow-hidden relative">
                      {member.imageUrl ? (
                        <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <User className="w-8 h-8 text-gray-400" />
                      )}
                      {isAdmin && <ImageUpload currentImageUrl={member.imageUrl} onUpload={(url) => handleUpdateImage(member.id, url)} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 mb-0.5 np-text truncate">{member.name}</h3>
                      <p className="text-sm text-primary font-medium mb-2">{member.role}</p>
                      
                      <div className="space-y-1">
                        {member.subject && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                            <span className="truncate">{member.subject}</span>
                          </div>
                        )}
                        {member.phone && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            <span>{member.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Non-Teaching Staff */}
          {nonTeachingStaff.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 np-text flex items-center gap-2 border-l-4 border-accent pl-4">
                {t('Non-Teaching Staff', 'गैर-शिक्षक कर्मचारी')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nonTeachingStaff.map(member => (
                  <div key={member.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4 hover:shadow-md transition-shadow group relative">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center border-4 border-white shadow-sm group-hover:border-primary/20 group-hover:scale-105 transition-all duration-300 overflow-hidden relative">
                      {member.imageUrl ? (
                        <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <User className="w-8 h-8 text-gray-400" />
                      )}
                      {isAdmin && <ImageUpload currentImageUrl={member.imageUrl} onUpload={(url) => handleUpdateImage(member.id, url)} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 mb-0.5 np-text truncate">{member.name}</h3>
                      <p className="text-sm text-primary font-medium mb-2">{member.role}</p>
                      
                      <div className="space-y-1">
                        {member.subject && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                            <span className="truncate">{member.subject}</span>
                          </div>
                        )}
                        {member.phone && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            <span>{member.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {teachingStaff.length === 0 && nonTeachingStaff.length === 0 && (
            <div className="py-12 text-center text-gray-500 np-text">
              {t('No staff members found matching search term.', 'खोजिएको नामका कुनै कर्मचारी भेटिएनन्।')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
