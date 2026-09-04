import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  ShieldCheck, Clock, FileText, CheckCircle2, 
  HelpCircle, Search, Printer, Download, Building, PhoneCall 
} from 'lucide-react';

interface CharterService {
  id: string;
  sn: string;
  titleEn: string;
  titleNp: string;
  category: 'admission' | 'certificate' | 'scholarship' | 'administrative' | 'grievance';
  responsibleDeptEn: string;
  responsibleDeptNp: string;
  durationEn: string;
  durationNp: string;
  feeEn: string;
  feeNp: string;
  documentsEn: string[];
  documentsNp: string[];
  responsibleOfficerEn: string;
  responsibleOfficerNp: string;
}

const CHARTER_SERVICES: CharterService[] = [
  {
    id: 'cs-1',
    sn: '१',
    titleEn: 'New Student Admission & Enrollment (Classes PG to 10)',
    titleNp: 'नयाँ विद्यार्थी भर्ना तथा दर्ता (कक्षा नर्सरी देखि १०)',
    category: 'admission',
    responsibleDeptEn: 'Administration & Admission Cell',
    responsibleDeptNp: 'प्रशासन तथा भर्ना शाखा',
    durationEn: 'Same Day (Within 1 hour)',
    durationNp: 'सोही दिन (१ घण्टा भित्र)',
    feeEn: 'Free / Official Government Rate',
    feeNp: 'निःशुल्क / नियमानुसार',
    documentsEn: [
      'Birth Registration Certificate (Copy)',
      'Previous Class Transfer Certificate (TC) or Grade Sheet',
      'Passport size photos (2 copies)',
      'Parent Citizenship Card (Copy)'
    ],
    documentsNp: [
      'जन्म दर्ता प्रमाणपत्रको प्रतिलिपि',
      'अघिल्लो कक्षाको स्थानान्तरण प्रमाणपत्र वा लब्धाङ्क पत्र',
      'पासपोर्ट साइजको फोटो (२ प्रति)',
      'अभिभावकको नागरिकताको प्रतिलिपि'
    ],
    responsibleOfficerEn: 'Admission In-Charge / Principal',
    responsibleOfficerNp: 'भर्ना शाखा प्रमुख / प्रधानाध्यापक'
  },
  {
    id: 'cs-2',
    sn: '२',
    titleEn: 'Transfer Certificate (TC) & Character Certificate Issuance',
    titleNp: 'स्थानान्तरण प्रमाणपत्र (TC) तथा चारित्रिक प्रमाणपत्र वितरण',
    category: 'certificate',
    responsibleDeptEn: 'Exam & Records Section',
    responsibleDeptNp: 'परीक्षा तथा अभिलेख शाखा',
    durationEn: 'Within 24 Hours',
    durationNp: '२४ घण्टा भित्र',
    feeEn: 'Free (As per school regulation)',
    feeNp: 'नियमानुसार',
    documentsEn: [
      'Written application signed by parent/guardian',
      'Library and Sports clearance slip',
      'All dues clearance confirmation'
    ],
    documentsNp: [
      'अभिभावकको हस्ताक्षर सहितको निवेदन',
      'पुस्तकालय तथा खेलकुद क्लियरेन्स स्लिप',
      'लेखा शाखाको क्लियरेन्स'
    ],
    responsibleOfficerEn: 'Exam In-Charge / Principal',
    responsibleOfficerNp: 'परीक्षा प्रमुख / प्रधानाध्यापक'
  },
  {
    id: 'cs-3',
    sn: '३',
    titleEn: 'Scholarship Recommendation & Quota Distribution',
    titleNp: 'छात्रवृत्ति सिफारिस तथा वितरण (विपन्न, जेहेन्दार तथा लक्षित वर्ग)',
    category: 'scholarship',
    responsibleDeptEn: 'Scholarship Committee',
    responsibleDeptNp: 'छात्रवृत्ति व्यवस्थापन समिति',
    durationEn: 'Within designated notice period',
    durationNp: 'तोकिएको समयावधि भित्र',
    feeEn: 'Completely Free (निःशुल्क)',
    feeNp: 'पूर्णतः निःशुल्क',
    documentsEn: [
      'Prescribed Scholarship Application Form',
      'Ward Office Recommendation / Poverty identification document',
      'Previous annual academic marksheet'
    ],
    documentsNp: [
      'तोकिएको ढाँचाको छात्रवृत्ति फारम',
      'सम्बन्धित वडा कार्यालयको सिफारिस वा विपन्नताको प्रमाण',
      'अघिल्लो शैक्षिक सत्रको नतिजा विवरण'
    ],
    responsibleOfficerEn: 'Scholarship Committee Coordinator',
    responsibleOfficerNp: 'छात्रवृत्ति समिति संयोजक'
  },
  {
    id: 'cs-4',
    sn: '४',
    titleEn: 'Academic Recommendation Letters & Document Verification',
    titleNp: 'शैक्षिक सिफारिस पत्र तथा प्रमाणपत्र प्रमाणीकरण',
    category: 'administrative',
    responsibleDeptEn: 'Head Office / Administration',
    responsibleDeptNp: 'प्रशासन शाखा',
    durationEn: 'Same Day (Within 2 hours)',
    durationNp: 'सोही दिन (२ घण्टा भित्र)',
    feeEn: 'Free (निःशुल्क)',
    feeNp: 'निःशुल्क',
    documentsEn: [
      'Student Identity Card',
      'Original Certificate for verification',
      'Official letter specifying purpose if applicable'
    ],
    documentsNp: [
      'विद्यार्थी परिचय पत्र',
      'सम्बन्धित सक्कल प्रमाणपत्र',
      'सिफारिसको प्रयोजन खुल्ने निवेदन'
    ],
    responsibleOfficerEn: 'Principal / Admin Officer',
    responsibleOfficerNp: 'प्रधानाध्यापक / प्रशासकीय अधिकृत'
  },
  {
    id: 'cs-5',
    sn: '५',
    titleEn: 'Correction / Update of Student Records (Name, DOB, Parents)',
    titleNp: 'विद्यार्थीको विवरण सच्याउने वा अद्यावधिक गर्ने कार्य',
    category: 'administrative',
    responsibleDeptEn: 'IEMIS & Records Desk',
    responsibleDeptNp: 'IEMIS तथा अभिलेख शाखा',
    durationEn: 'Within 3 Business Days',
    durationNp: '३ कार्यदिन भित्र',
    feeEn: 'Free (निःशुल्क)',
    feeNp: 'निःशुल्क',
    documentsEn: [
      'Ward recommendation and Official Birth Certificate',
      'Official application mentioning the required amendment',
      'Previous school admission register record'
    ],
    documentsNp: [
      'वडा कार्यालयको सिफारिस तथा आधिकारिक जन्म दर्ता',
      'सच्याउनु पर्ने विवरण सहितको निवेदन',
      'सम्बन्धित पुराना कागजात'
    ],
    responsibleOfficerEn: 'IEMIS Operator / Principal',
    responsibleOfficerNp: 'IEMIS अपरेटर / प्रधानाध्यापक'
  },
  {
    id: 'cs-6',
    sn: '६',
    titleEn: 'Grievance, Complaint & Suggestion Redressal',
    titleNp: 'गुनासो तथा सुझाव दर्ता र सुनुवाइ',
    category: 'grievance',
    responsibleDeptEn: 'Grievance Hearing Committee',
    responsibleDeptNp: 'गुनासो सुनुवाइ समिति',
    durationEn: 'Initial response within 48 hours / Final resolution in 7 days',
    durationNp: '४८ घण्टा भित्र प्रारम्भिक जानकारी / ७ दिन भित्र समाधान',
    feeEn: 'Completely Free (निःशुल्क)',
    feeNp: 'पूर्णतः निःशुल्क',
    documentsEn: [
      'Written complaint or digital submission via website/complaint box'
    ],
    documentsNp: [
      'लिखित उजुरी वा गुनासो पेटीका / वेबसाइट मार्फत दर्ता'
    ],
    responsibleOfficerEn: 'Grievance Officer (गुनासो सुन्ने अधिकारी)',
    responsibleOfficerNp: 'गुनासो सुन्ने अधिकारी / प्र.अ.'
  }
];

export default function CitizenCharter() {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', labelEn: 'All Services', labelNp: 'सबै सेवाहरू' },
    { id: 'admission', labelEn: 'Admissions', labelNp: 'भर्ना तथा दर्ता' },
    { id: 'certificate', labelEn: 'Certificates & TC', labelNp: 'प्रमाणपत्र र TC' },
    { id: 'scholarship', labelEn: 'Scholarships', labelNp: 'छात्रवृत्ति' },
    { id: 'administrative', labelEn: 'Admin & Verification', labelNp: 'प्रशासकीय तथा प्रमाणीकरण' },
    { id: 'grievance', labelEn: 'Grievance & Redressal', labelNp: 'गुनासो सुनुवाइ' },
  ];

  const filteredServices = CHARTER_SERVICES.filter(service => {
    const matchesCat = selectedCategory === 'all' || service.category === selectedCategory;
    const title = language === 'np' ? service.titleNp : service.titleEn;
    const dept = language === 'np' ? service.responsibleDeptNp : service.responsibleDeptEn;
    const officer = language === 'np' ? service.responsibleOfficerNp : service.responsibleOfficerEn;
    const q = searchQuery.toLowerCase();
    const matchesSearch = title.toLowerCase().includes(q) || dept.toLowerCase().includes(q) || officer.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl mb-10 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-800/60 border border-blue-700 text-accent text-xs font-semibold uppercase tracking-wider mb-4">
                <ShieldCheck className="w-4 h-4" />
                <span>{t('Public Commitment & Transparency', 'पारदर्शिता तथा नागरिक प्रतिबद्धता')}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 np-text">
                {t('Citizen Charter', 'नागरिक बडापत्र')}
              </h1>
              <p className="text-blue-200 text-base sm:text-lg max-w-2xl leading-relaxed np-text">
                {t(
                  'Vidhya Jyoti Secondary School is committed to delivering transparent, accountable, and student-centered administrative services in a timely manner.',
                  'विद्या ज्योति माध्यमिक विद्यालय, खहरे, लमजुङद्वारा प्रदान गरिने शैक्षिक तथा प्रशासनिक सेवा, लाग्ने समय, दस्तुर तथा जिम्मेवार अधिकारी सम्बन्धी आधिकारिक बडापत्र।'
                )}
              </p>
            </div>

            {/* Print & Action Button */}
            <div className="flex items-center gap-3 self-stretch sm:self-auto">
              <button
                onClick={handlePrint}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-sm font-semibold transition"
              >
                <Printer className="w-4 h-4" />
                <span>{t('Print Charter', 'प्रिन्ट गर्नुहोस्')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-8">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('Search service, department, officer...', 'सेवा, शाखा वा अधिकारी खोज्नुहोस्...')}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
              />
            </div>

            <div className="text-xs text-slate-500 font-medium self-end md:self-center">
              {filteredServices.length} {t('services listed', 'सेवाहरू सूचीबद्ध')}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-slate-100">
            {categories.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    active
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  } np-text`}
                >
                  {language === 'np' ? cat.labelNp : cat.labelEn}
                </button>
              );
            })}
          </div>
        </div>

        {/* Services List / Cards */}
        <div className="space-y-6">
          {filteredServices.map((service) => {
            const title = language === 'np' ? service.titleNp : service.titleEn;
            const dept = language === 'np' ? service.responsibleDeptNp : service.responsibleDeptEn;
            const duration = language === 'np' ? service.durationNp : service.durationEn;
            const fee = language === 'np' ? service.feeNp : service.feeEn;
            const officer = language === 'np' ? service.responsibleOfficerNp : service.responsibleOfficerEn;
            const docs = language === 'np' ? service.documentsNp : service.documentsEn;

            return (
              <div
                key={service.id}
                className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/90 hover:border-blue-300 transition-all"
              >
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-6 border-b border-slate-100">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                      {service.sn}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 leading-snug np-text">
                        {title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-blue-600" />
                          <span className="font-semibold text-slate-700">{dept}</span>
                        </span>
                        <span>•</span>
                        <span>{t('Officer in Charge:', 'जिम्मेवार अधिकारी:')} <strong className="text-slate-700">{officer}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Badges for time and fee */}
                  <div className="flex flex-wrap gap-2.5">
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{duration}</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/60 text-xs font-semibold">
                      <span>{t('Fee:', 'दस्तुर:')} {fee}</span>
                    </div>
                  </div>
                </div>

                {/* Required Documents Section */}
                <div className="mt-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>{t('Required Documents & Procedures', 'आवश्यक कागजात तथा प्रक्रियाहरू')}</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {docs.map((docItem, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span className="np-text leading-snug">{docItem}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Grievance Help Desk Box */}
        <div className="mt-12 bg-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider mb-3">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{t('Information & Grievance Desk', 'सूचना तथा गुनासो डेस्क')}</span>
            </div>
            <h3 className="text-2xl font-bold mb-2 np-text">
              {t('Have Questions or Grievances?', 'कुनै जिज्ञासा वा गुनासो छ?')}
            </h3>
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed np-text">
              {t(
                'If your service was delayed or if you have suggestions for improvement, please contact our administrative desk or submit a note through our Contact page.',
                'यदि सेवा प्राप्त गर्न कुनै कठिनाइ भएमा वा सुझाव दिन चाहनुहुन्छ भने सिधै विद्यालय प्रशासनमा सम्पर्क गर्नुहोस् वा हाम्रो अनलाइन सम्पर्क फारम प्रयोग गर्नुहोस्।'
              )}
            </p>
          </div>
          <a
            href="/contact"
            className="whitespace-nowrap px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-blue-600/30"
          >
            {t('Contact School Administration', 'विद्यालय प्रशासनमा सम्पर्क')}
          </a>
        </div>

      </div>
    </div>
  );
}
