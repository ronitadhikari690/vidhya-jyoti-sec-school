import React, { useState, useEffect, useRef } from 'react';
import { Users, User as UserIcon, Upload, Trash2, Edit, Save, Plus, Database, AlertCircle, CheckCircle2 } from 'lucide-react';
import { collection, query, orderBy, getDocs, where, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../context/AuthContext';

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
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <>
          <Upload className="w-4 h-4 text-white mb-0.5 drop-shadow-md" />
          <span className="text-[7px] text-white font-bold uppercase tracking-wider drop-shadow-md">Change</span>
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
}

export default function Committees() {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [committees, setCommittees] = useState<{ [key: string]: StaffMember[] }>({
    'Management': [
      { id: 'smc-1', name: 'श्री कृष्णप्रसाद अधिकारी', role: 'अध्यक्ष', phone: '९८४६१७०६५०', category: 'Management' },
      { id: 'smc-2', name: 'श्री मुक्तिनाथ ढकाल', role: 'सदस्य', phone: '९८४६१२८९१२', category: 'Management' },
      { id: 'smc-3', name: 'श्री राजेन्द्र वि.क.', role: 'सदस्य', phone: '९८४३६८५६४१', category: 'Management' },
      { id: 'smc-4', name: 'श्री स्मृति घिमिरे', role: 'सदस्य', phone: '९८४६१७२६७६', category: 'Management' },
      { id: 'smc-5', name: 'श्री सावित्रा कोईराला', role: 'सदस्य', phone: '९८६६१५२३४०', category: 'Management' },
      { id: 'smc-6', name: 'श्री लक्ष्मी श्रेष्ठ', role: 'सदस्य', phone: '९८१५१५८७४३', category: 'Management' },
      { id: 'smc-7', name: 'श्री ज्ञान नारायण गुरुङ', role: 'सदस्य', phone: '९८१४१४३२३२', category: 'Management' },
      { id: 'smc-8', name: 'श्री सूर्यकुमार अधिकारी', role: 'सदस्य', phone: '९८४६१२०६५३', category: 'Management' },
      { id: 'smc-9', name: 'श्री सूर्यबहादुर के.सी.', role: 'सदस्य सचिव', phone: '९८५६०४०७१५', category: 'Management' },
    ],
    'PTA': [
      { id: 'pta-1', name: 'श्री केशबहादुर गुरुङ', role: 'अध्यक्ष', phone: '९८४६२४९१३६', category: 'PTA' },
      { id: 'pta-2', name: 'श्री सिंहबहादुर गुरुङ', role: 'सदस्य', phone: '९८४६१९०३८६', category: 'PTA' },
      { id: 'pta-3', name: 'श्री मिना मजकोटी', role: 'सदस्य', phone: '९८४६१३२१३५', category: 'PTA' },
      { id: 'pta-4', name: 'श्री सिता के.सी.', role: 'सदस्य', phone: '९७५६५४१७२१', category: 'PTA' },
      { id: 'pta-5', name: 'श्री विन्दु न्यौपाने', role: 'सदस्य', phone: '९८६०६२४६९६', category: 'PTA' },
      { id: 'pta-6', name: 'श्री सूर्यबहादुर भुजेल', role: 'सदस्य', phone: '९७४६४३०६८१', category: 'PTA' },
      { id: 'pta-7', name: 'श्री सुनिमा इसाकोटी', role: 'सदस्य', phone: '९८४९१८९२३३', category: 'PTA' },
      { id: 'pta-8', name: 'श्री अर्जुन बस्नेत', role: 'सदस्य', phone: '९८४९२२२१८९', category: 'PTA' },
      { id: 'pta-9', name: 'श्री मदन खनिया', role: 'सदस्य', phone: '९८४६३३९४५५', category: 'PTA' },
      { id: 'pta-10', name: 'श्री सगिता कुमाल', role: 'सदस्य', phone: '९८४६१८९५२०', category: 'PTA' },
      { id: 'pta-11', name: 'श्री बालकृष्ण अधिकारी', role: 'सदस्य', phone: '९८४६१५०४१४', category: 'PTA' },
    ],
    'Advisory': [
      { id: 'adv-1', name: 'श्री श्रीकाजी गुरुङ', role: 'सलाहकार', phone: '९८४६४२८७०३', category: 'Advisory' },
      { id: 'adv-2', name: 'श्री धर्मराज लामा', role: 'सलाहकार', phone: '९८४६१५१७१४', category: 'Advisory' },
      { id: 'adv-3', name: 'श्री प्रकाशराज मद्टराई', role: 'सलाहकार', phone: '९८४६०५९८३४', category: 'Advisory' },
      { id: 'adv-4', name: 'श्री रसकहादुर गुरुङ', role: 'सलाहकार', phone: '९८५६०७०४०२', category: 'Advisory' },
      { id: 'adv-5', name: 'श्री श्यामबहादुर के.सी.', role: 'सलाहकार', phone: '९८६५३३२४००', category: 'Advisory' },
      { id: 'adv-6', name: 'श्री शिवलाल ढकाल', role: 'सलाहकार', phone: '९८४६२००३९५', category: 'Advisory' },
      { id: 'adv-7', name: 'श्री रामचन्द्र घिमिरे', role: 'सलाहकार', phone: '९८४६५६५४२२', category: 'Advisory' },
    ],
    'SocialAudit': [
      { id: 'sa-1', name: 'श्री केशबहादुर गुरुङ', role: 'संयोजक', phone: '९८४६२४९१३६', category: 'SocialAudit' },
      { id: 'sa-2', name: 'श्री टिकाराम घिमिरे', role: 'सदस्य', phone: '९८४६१२८४३६', category: 'SocialAudit' },
      { id: 'sa-3', name: 'श्री केदारबहादुर के.सी.', role: 'सदस्य', phone: '९८४६००१५४४', category: 'SocialAudit' },
      { id: 'sa-4', name: 'श्री शारदा मद्टराई', role: 'सदस्य', phone: '९८४१७७१२११', category: 'SocialAudit' },
    ]
  });

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  useEffect(() => {
    async function loadCommittees() {
      try {
        const q = query(
          collection(db, 'staff'),
          where('category', 'in', ['Management', 'PTA', 'Advisory', 'SocialAudit'])
        );
        const querySnapshot = await getDocs(q);
        const dbDocs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        if (dbDocs.length > 0) {
          setCommittees(prev => {
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
        console.warn("Using fallback committee data", e);
      } finally {
        setLoading(false);
      }
    }
    loadCommittees();
  }, []);

  const handleUpdateImage = async (memberId: string, url: string) => {
    try {
      setActionLoading(true);
      
      // Find member info in current state
      let memberInfo: StaffMember | null = null;
      Object.values(committees).forEach((group: StaffMember[]) => {
        const m = group.find((m: StaffMember) => m.id === memberId);
        if (m) memberInfo = m;
      });

      if (!memberInfo) throw new Error("Member not found");

      const staffRef = collection(db, 'staff');
      let docRef;

      // Check if already in Firestore
      const q = query(staffRef, where('name', '==', memberInfo.name), where('category', '==', memberInfo.category));
      const snap = await getDocs(q);

      if (!snap.empty) {
        docRef = doc(db, 'staff', snap.docs[0].id);
        await updateDoc(docRef, { imageUrl: url, updatedAt: serverTimestamp() });
      } else {
        const { id, ...cleanInfo } = memberInfo;
        const newDoc = await addDoc(staffRef, { ...cleanInfo, imageUrl: url, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        docRef = newDoc;
      }

      // Update local state
      const updatedCommittees = { ...committees };
      Object.keys(updatedCommittees).forEach(cat => {
        updatedCommittees[cat] = updatedCommittees[cat].map(m => m.id === memberId ? { ...m, imageUrl: url, id: docRef.id } : m);
      });
      setCommittees(updatedCommittees);
      showStatus('success', 'Photo updated successfully!');
    } catch (e) {
      console.error(e);
      showStatus('error', 'Failed to update photo.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleImportOfficialData = async () => {
    if (!window.confirm("This will import all committee members (SMC, PTA, Advisory, Social Audit) into your database. Continue?")) return;
    
    setActionLoading(true);
    try {
      const smc = [
        { name: 'श्री कृष्णप्रसाद अधिकारी', role: 'अध्यक्ष', phone: '९८४६१७०६५०', category: 'Management' },
        { name: 'श्री मुक्तिनाथ ढकाल', role: 'सदस्य', phone: '९८४६१२८९१२', category: 'Management' },
        { name: 'श्री राजेन्द्र वि.क.', role: 'सदस्य', phone: '९८४३६८५६४१', category: 'Management' },
        { name: 'श्री स्मृति घिमिरे', role: 'सदस्य', phone: '९८४६१७२६७६', category: 'Management' },
        { name: 'श्री सावित्रा कोईराला', role: 'सदस्य', phone: '९८६६१५२३४०', category: 'Management' },
        { name: 'श्री लक्ष्मी श्रेष्ठ', role: 'सदस्य', phone: '९८१५१५८७४३', category: 'Management' },
        { name: 'श्री ज्ञान नारायण गुरुङ', role: 'सदस्य', phone: '९८१४१४३२३२', category: 'Management' },
        { name: 'श्री सूर्यकुमार अधिकारी', role: 'सदस्य', phone: '९८४६१२०६५३', category: 'Management' },
        { name: 'श्री सूर्यबहादुर के.सी.', role: 'सदस्य सचिव', phone: '९८५६०४०७१५', category: 'Management' },
      ];
      const pta = [
        { name: 'श्री केशबहादुर गुरुङ', role: 'अध्यक्ष', phone: '९८४६२४९१३६', category: 'PTA' },
        { name: 'श्री सिंहबहादुर गुरुङ', role: 'सदस्य', phone: '९८४६१९०३८६', category: 'PTA' },
        { name: 'श्री मिना मजकोटी', role: 'सदस्य', phone: '९८४६१३२१३५', category: 'PTA' },
        { name: 'श्री सिता के.सी.', role: 'सदस्य', phone: '९७५६५४१७२१', category: 'PTA' },
        { name: 'श्री विन्दु न्यौपाने', role: 'सदस्य', phone: '९८६०६२४६९६', category: 'PTA' },
        { name: 'श्री सूर्यबहादुर भुजेल', role: 'सदस्य', phone: '९७४६४३०६८१', category: 'PTA' },
        { name: 'श्री सुनिमा इसाकोटी', role: 'सदस्य', phone: '९८४९१८९२३३', category: 'PTA' },
        { name: 'श्री अर्जुन बस्नेत', role: 'सदस्य', phone: '९८४९२२२१८९', category: 'PTA' },
        { name: 'श्री मदन खनिया', role: 'सदस्य', phone: '९८४६३३९४५५', category: 'PTA' },
        { name: 'श्री सगिता कुमाल', role: 'सदस्य', phone: '९८४६१८९५२०', category: 'PTA' },
        { name: 'श्री बालकृष्ण अधिकारी', role: 'सदस्य', phone: '९८४६१५०४१४', category: 'PTA' },
      ];
      const advisory = [
        { name: 'श्री श्रीकाजी गुरुङ', role: 'सलाहकार', phone: '९८४६४२८७०३', category: 'Advisory' },
        { name: 'श्री धर्मराज लामा', role: 'सलाहकार', phone: '९८४६१५१७१४', category: 'Advisory' },
        { name: 'श्री प्रकाशराज मद्टराई', role: 'सलाहकार', phone: '९८४६०५९८३४', category: 'Advisory' },
        { name: 'श्री रसकहादुर गुरुङ', role: 'सलाहकार', phone: '९८५६०७०४०२', category: 'Advisory' },
        { name: 'श्री श्यामबहादुर के.सी.', role: 'सलाहकार', phone: '९८६५३३२४००', category: 'Advisory' },
        { name: 'श्री शिवलाल ढकाल', role: 'सलाहकार', phone: '९८४६२००३९५', category: 'Advisory' },
        { name: 'श्री रामचन्द्र घिमिरे', role: 'सलाहकार', phone: '९८४६५६५४२२', category: 'Advisory' },
      ];
      const socialAudit = [
        { name: 'श्री केशबहादुर गुरुङ', role: 'संयोजक', phone: '९८४६२४९१३६', category: 'SocialAudit' },
        { name: 'श्री टिकाराम घिमिरे', role: 'सदस्य', phone: '९८४६१२८४३६', category: 'SocialAudit' },
        { name: 'श्री केदारबहादुर के.सी.', role: 'सदस्य', phone: '९८४६००१५४४', category: 'SocialAudit' },
        { name: 'श्री शारदा मद्टराई', role: 'सदस्य', phone: '९८४१७७१२११', category: 'SocialAudit' },
      ];

      const all = [...smc, ...pta, ...advisory, ...socialAudit];
      const staffRef = collection(db, 'staff');
      
      for (const item of all) {
        await addDoc(staffRef, {
          ...item,
          imageUrl: '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      showStatus('success', `Imported ${all.length} committee records successfully! Refreshing...`);
      window.location.reload();
    } catch (e) {
      console.error(e);
      showStatus('error', 'Import failed. Check console for details.');
    } finally {
      setActionLoading(false);
    }
  };

  const renderMemberCard = (member: any) => (
    <div key={member.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow group relative">
      <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden border-2 border-white shadow-sm relative group-hover:border-primary/20 group-hover:scale-105 transition-all duration-300">
        {member.imageUrl ? (
          <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <UserIcon className="w-6 h-6" />
          </div>
        )}
        {isAdmin && <ImageUpload currentImageUrl={member.imageUrl} onUpload={(url) => handleUpdateImage(member.id, url)} />}
      </div>
      <div>
        <div className="font-bold text-gray-900 np-text line-clamp-1">{member.name}</div>
        <div className="text-xs text-primary font-medium">{member.role}</div>
        {member.phone && (
          <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
            <span className="opacity-70">📞</span> {member.phone}
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-light py-12 relative">
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
              className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-lg border border-gray-200 flex items-center gap-2 hover:bg-gray-50 transition min-w-[220px]"
            >
              <Database className="w-4 h-4 text-accent" />
              <span>Import Official Committees</span>
            </button>
            <p className="bg-slate-800 text-white text-[10px] px-2 py-1 rounded">Admin Mode Active</p>
          </div>
          <button className="bg-primary text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform">
            <Database className="w-6 h-6" />
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <Users className="w-10 h-10 text-primary" />
            School Committees <span className="text-2xl text-gray-500 font-normal ml-2 np-text">(विद्यालय समितिहरु)</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our governing bodies and committees work collaboratively to ensure the ongoing success and smooth operation of Vidhya Jyoti Secondary School.
          </p>
        </div>

        <div className="space-y-12">
          {/* SMC */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 np-text flex items-center gap-2 border-l-4 border-primary pl-4">
              विद्यालय व्यवस्थापन समिति
              <span className="text-sm font-normal text-gray-500 ml-2">(SMC)</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {committees['Management'].length > 0 ? (
                committees['Management'].map(renderMemberCard)
              ) : (
                <p className="text-gray-400 text-sm italic">No records found. Visit admin to add.</p>
              )}
            </div>
          </section>

          {/* PTA */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 np-text flex items-center gap-2 border-l-4 border-accent pl-4">
              शिक्षक, विद्यार्थी र अभिभावक संघ
              <span className="text-sm font-normal text-gray-500 ml-2">(PTA)</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {committees['PTA'].length > 0 ? (
                committees['PTA'].map(renderMemberCard)
              ) : (
                <p className="text-gray-400 text-sm italic">No records found. Visit admin to add.</p>
              )}
            </div>
          </section>

          {/* Social Audit */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 np-text flex items-center gap-2 border-l-4 border-emerald-500 pl-4">
              सामाजिक परीक्षण समिति
              <span className="text-sm font-normal text-gray-500 ml-2">(Social Audit Committee)</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {committees['SocialAudit'].length > 0 ? (
                committees['SocialAudit'].map(renderMemberCard)
              ) : (
                <p className="text-gray-400 text-sm italic">No records found. Visit admin to add.</p>
              )}
            </div>
          </section>

          {/* Advisory */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 np-text flex items-center gap-2 border-l-4 border-purple-500 pl-4">
              सलाकार समिति
              <span className="text-sm font-normal text-gray-500 ml-2">(Advisory Committee)</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {committees['Advisory'].length > 0 ? (
                committees['Advisory'].map(renderMemberCard)
              ) : (
                <p className="text-gray-400 text-sm italic">No records found. Visit admin to add.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
