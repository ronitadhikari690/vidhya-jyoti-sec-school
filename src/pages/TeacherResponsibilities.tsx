import { CheckCircle2, Star, Info } from 'lucide-react';
import { InlineEdit } from '../components/InlineEdit';

export default function TeacherResponsibilities() {
  const responsibilities = [
    {
        title: 'परीक्षा तथा पुरस्कार व्यवस्थापन समिति',
        coordinatorRole: 'स.प्र.अ. / संयोजक',
        coordinator: 'बालकृष्ण अधिकारी',
        coCoordinator: 'गौतम पोखरेल'
    },
    {
        title: 'होस्टल तथा ट्युशन व्यवस्थापन समिति',
        coordinatorRole: 'स.प्र.अ. / संयोजक',
        coordinator: 'खुशिराम खनिया',
        coCoordinator: 'आनन्द धिताल'
    },
    {
        title: 'आधारभूत तह व्यवस्थापन',
        coordinatorRole: 'संयोजक',
        coordinator: 'पशुपति न्यौपाने',
        coCoordinator: 'जुना गुरुङ्ग'
    },
    {
        title: 'प्रार्थना व्यवस्थापन समिति',
        coordinatorRole: 'संयोजक',
        coordinator: 'बासुदेव काफ्ले',
        coCoordinator: 'काजल श्रेष्ठ'
    },
    {
        title: 'शैक्षिक परामर्श',
        coordinatorRole: 'संयोजक',
        coordinator: 'पशुपति न्यौपाने',
        coCoordinator: 'चिन्तामणि अधिकारी'
    },
    {
        title: 'सूचना अधिकारी',
        coordinatorRole: 'संयोजक',
        coordinator: 'राजु अधिकारी',
        coCoordinator: 'जुना गुरुङ्ग'
    },
    {
        title: 'स्वास्थ्य व्यवस्थापन',
        coordinatorRole: 'संयोजक',
        coordinator: 'चिन्तामणि अधिकारी',
        coCoordinator: 'कविता भण्डारी'
    },
    {
        title: 'स्टिम व्यवस्थापन',
        coordinatorRole: 'संयोजक',
        coordinator: 'अरुण खड्का',
        coCoordinator: 'कविता भण्डारी'
    },
    {
        title: 'बाल क्लव व्यवस्थापन',
        coordinatorRole: 'संयोजक',
        coordinator: 'विनोद खनिया',
        coCoordinator: 'अनिता गौली'
    },
    {
        title: 'अतिरिक्त क्रियाकलाप',
        coordinatorRole: 'संयोजक',
        coordinator: 'काजल श्रेष्ठ',
        coCoordinator: 'सरला अधिकारी'
    },
    {
        title: 'सामाजिक परिचालन',
        coordinatorRole: 'संयोजक',
        coordinator: 'सूर्यकुमार अधिकारी',
        coCoordinator: 'एलिजा अधिकारी'
    },
    {
        title: 'खेलकुँद व्यवस्थापन',
        coordinatorRole: 'संयोजक',
        coordinator: 'रमाकान्त ढुङ्गाना',
        coCoordinator: 'पशुपति न्यौपाने'
    },
    {
        title: 'आर्थिक तथा स्टोर व्यवस्थापन',
        coordinatorRole: 'संयोजक',
        coordinator: 'हस्तबहादुर गुरुङ्ग',
        coCoordinator: 'गणेश तामाङ'
    },
    {
        title: 'छात्रा सम्पर्क व्यक्ति',
        coordinatorRole: 'संयोजक',
        coordinator: 'सावित्रा केसी',
        coCoordinator: 'जुना गुरुङ्ग'
    },
    {
        title: 'खाजा व्यवस्थापन',
        coordinatorRole: 'संयोजक',
        coordinator: 'प्रेमराज सापकोटा',
        coCoordinator: 'हस्तबहादुर गुरुङ्ग'
    }
  ];

  return (
    <div className="bg-light py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 np-text">
            <InlineEdit settingKey="respTitle" fallback="Teacher Responsibilities" /> 
            <span className="text-2xl text-gray-500 font-normal ml-2">(शिक्षक जिम्मेवारी)</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            <InlineEdit 
              settingKey="respSubtitle" 
              fallback="Our teachers take on various administrative and extracurricular roles to ensure holistic development and smooth operations." 
              as="span" 
            />
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden mb-12">
          <div className="bg-primary px-8 py-6 flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-2xl font-bold text-white np-text flex items-center gap-3">
              <Star className="w-8 h-8 text-accent fill-accent" />
              प्रधानाध्यापक (Principal)
            </h2>
            <div className="bg-white/20 px-6 py-2 rounded-full">
              <span className="text-xl font-bold text-white np-text">सूर्यबहादुर के.सी.</span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b-2 border-gray-200 pb-2">
            Committees & Duties <span className="text-lg text-gray-500 font-normal ml-2 np-text">(शिक्षकहरुको कार्य विभाजन)</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {responsibilities.map((resp, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-start hover:shadow-md transition-shadow group">
                <div className="flex items-start gap-4 mb-4">
                  <div className="mt-1 flex-shrink-0 bg-blue-50 p-2 rounded-full group-hover:bg-primary transition-colors">
                    <CheckCircle2 className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 np-text pt-1">{resp.title}</h3>
                </div>
                
                <div className="w-full bg-gray-50 p-4 rounded-lg border border-gray-100 flex flex-col gap-2">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-sm font-semibold text-gray-600 np-text">{resp.coordinatorRole}:</span>
                    <span className="text-md font-bold text-gray-900 np-text">{resp.coordinator}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-sm font-semibold text-gray-600 np-text">सह-संयोजक:</span>
                    <span className="text-md font-bold text-gray-900 np-text">{resp.coCoordinator}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 bg-amber-50 border border-amber-200 rounded-xl p-6 flex flex-col sm:flex-row items-center gap-4 text-amber-900">
            <div className="bg-amber-100 p-3 rounded-full flex-shrink-0">
              <Info className="w-6 h-6 text-amber-600" />
            </div>
            <p className="np-text text-lg font-medium text-center sm:text-left">
              नोट: प्रत्येक शुक्रबार Friday For Future सँग सम्बन्धित क्रियाकलापहरु सञ्चालन गरिने छ।
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
