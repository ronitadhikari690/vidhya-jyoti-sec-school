import { useState } from 'react';
import { FileText, Download, Bell } from 'lucide-react';
import { InlineEdit } from '../components/InlineEdit';
import FormModal from '../components/FormModal';

export default function Parents() {
  const [activeForm, setActiveForm] = useState<'leave' | 'admission' | 'scholarship' | null>(null);

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
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="font-semibold text-gray-900 np-text">First Term Result Distribution (पहिलो त्रैमासिक नतिजा वितरण)</p>
                <p className="text-sm text-gray-500 mt-1">Date: 2081/04/15</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="font-semibold text-gray-900 np-text">Parent-Teacher Meeting (अभिभावक-शिक्षक अन्तर्क्रिया)</p>
                <p className="text-sm text-gray-500 mt-1">Date: 2081/04/20</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Download className="w-6 h-6 text-primary" /> Downloadable Forms
            </h2>
            <div className="space-y-4">
              <button 
                id="btn-leave-form"
                onClick={() => setActiveForm('leave')}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-100 transition-colors group cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400 group-hover:text-primary" />
                  <span className="font-medium text-gray-700 group-hover:text-primary">Leave Application Form</span>
                </div>
                <Download className="w-5 h-5 text-gray-400 group-hover:text-primary" />
              </button>
              <button 
                id="btn-admission-form"
                onClick={() => setActiveForm('admission')}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-100 transition-colors group cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400 group-hover:text-primary" />
                  <span className="font-medium text-gray-700 group-hover:text-primary">Admission Form</span>
                </div>
                <Download className="w-5 h-5 text-gray-400 group-hover:text-primary" />
              </button>
              <button 
                id="btn-scholarship-form"
                onClick={() => setActiveForm('scholarship')}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-100 transition-colors group cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400 group-hover:text-primary" />
                  <span className="font-medium text-gray-700 group-hover:text-primary">Scholarship Application Form</span>
                </div>
                <Download className="w-5 h-5 text-gray-400 group-hover:text-primary" />
              </button>
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
