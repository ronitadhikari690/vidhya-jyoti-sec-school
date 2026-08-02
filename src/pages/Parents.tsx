import { useState, useEffect } from 'react';
import { FileText, Download, Bell, Printer, ExternalLink } from 'lucide-react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { InlineEdit } from '../components/InlineEdit';
import FormModal from '../components/FormModal';

export default function Parents() {
  const [activeForm, setActiveForm] = useState<'leave' | 'admission' | 'scholarship' | null>(null);
  const [notices, setNotices] = useState<any[]>([]);
  const [loadingNotices, setLoadingNotices] = useState(true);

  useEffect(() => {
    async function loadNotices() {
      try {
        const q = query(collection(db, 'notices'), orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);
        const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setNotices(docs);
      } catch (e) {
        console.error('Error loading notices in Parents page:', e);
      } finally {
        setLoadingNotices(false);
      }
    }
    loadNotices();
  }, []);

  return (
    <div className="bg-light py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <InlineEdit settingKey="parentsTitle" fallback="Parent Resources" />
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            <InlineEdit settingKey="parentsSubtitle" fallback="Everything you need to support your child's educational journey at Vidhya Jyoti Secondary School." as="span" />
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Bell className="w-6 h-6 text-primary" /> Recent Notices for Parents
            </h2>
            
            {loadingNotices ? (
              <div className="p-6 text-center text-gray-400">Loading parent notices...</div>
            ) : notices.length === 0 ? (
              <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
                No active parent notices at the moment.
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                {notices.map((notice) => (
                  <div key={notice.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-primary bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">{notice.category || 'General'}</span>
                      <span className="text-xs text-gray-400 font-medium">{notice.date}</span>
                    </div>
                    <p className="font-semibold text-gray-900 np-text">{notice.title}</p>
                    {notice.excerpt && <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notice.excerpt}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Download className="w-6 h-6 text-primary" /> Official School Forms
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Click any form below to fill online, print, or download a printable document copy.
            </p>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 hover:bg-blue-50/50 rounded-xl border border-gray-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-blue-100 text-primary rounded-lg mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Leave Application Form</h3>
                    <p className="text-xs text-gray-500">फर्मा / बिदाको लागि निवेदन फारम</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    id="btn-leave-form"
                    onClick={() => setActiveForm('leave')}
                    className="flex-1 sm:flex-none px-4 py-2 bg-primary hover:bg-blue-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" /> Fill, Print & Download
                  </button>
                </div>
              </div>

              <div className="p-4 bg-gray-50 hover:bg-blue-50/50 rounded-xl border border-gray-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-blue-100 text-primary rounded-lg mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Admission Form</h3>
                    <p className="text-xs text-gray-500">विद्यार्थी भर्ना आवेदन फारम</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    id="btn-admission-form"
                    onClick={() => setActiveForm('admission')}
                    className="flex-1 sm:flex-none px-4 py-2 bg-primary hover:bg-blue-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" /> Fill, Print & Download
                  </button>
                </div>
              </div>

              <div className="p-4 bg-gray-50 hover:bg-blue-50/50 rounded-xl border border-gray-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-blue-100 text-primary rounded-lg mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Scholarship Application Form</h3>
                    <p className="text-xs text-gray-500">छात्रवृत्ति तथा शुल्क छुट आवेदन फारम</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    id="btn-scholarship-form"
                    onClick={() => setActiveForm('scholarship')}
                    className="flex-1 sm:flex-none px-4 py-2 bg-primary hover:bg-blue-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" /> Fill, Print & Download
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Render the interactive forms modal if one is selected */}
      {activeForm && (
        <FormModal 
          formType={activeForm} 
          onClose={() => setActiveForm(null)} 
        />
      )}
    </div>
  );
}
