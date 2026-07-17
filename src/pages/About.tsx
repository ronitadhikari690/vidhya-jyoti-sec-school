import { BookOpen, Target, Users } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import { InlineEdit } from '../components/InlineEdit';
import { InlineImageEdit } from '../components/InlineImageEdit';

export default function About() {
  const { t } = useLanguage();
  const { settings } = useSettings();

  return (
    <div className="bg-light min-h-screen pb-16">
      {/* Hero */}
      <div className="bg-primary py-24 px-4 sm:px-6 lg:px-8 text-center text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 np-text">
          <InlineEdit
            settingKey="aboutHeroTitle"
            fallback={t('About Our School', 'हाम्रो विद्यालयको बारेमा')}
          />
        </h1>
        <p className="text-xl max-w-2xl mx-auto text-blue-100 np-text">
          <InlineEdit
            settingKey="aboutHeroSubtitle"
            fallback={t(
              'Discover the history, mission, and vision of Vidhya Jyoti Secondary School.',
              'विद्या ज्योति माध्यमिक विद्यालयको इतिहास, उद्देश्य र लक्ष्य पत्ता लगाउनुहोस्।'
            )}
            multiline={true}
            as="span"
          />
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
          
          {/* Mission & Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <div className="flex gap-4">
              <div className="bg-blue-50 p-4 rounded-full h-fit">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 np-text">
                  <InlineEdit settingKey="missionTitle" fallback={t('Our Mission', 'हाम्रो उद्देश्य')} />
                </h2>
                <div className="text-gray-600 leading-relaxed np-text">
                  <InlineEdit
                    settingKey="missionText"
                    fallback={t(
                      'To provide quality education that empowers students to reach their full potential. We strive to create an inclusive environment where academic excellence is nurtured alongside moral and social development.',
                      'विद्यार्थीहरूलाई उनीहरूको पूर्ण क्षमतामा पुग्न सशक्त बनाउने गुणस्तरीय शिक्षा प्रदान गर्नु। हामी एक समावेशी वातावरण सिर्जना गर्न प्रयासरत छौं जहाँ नैतिक र सामाजिक विकासको साथसाथै शैक्षिक उत्कृष्टताको पालनपोषण हुन्छ।'
                    )}
                    multiline={true}
                    as="div"
                    className="whitespace-pre-line block"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-amber-50 p-4 rounded-full h-fit">
                <BookOpen className="w-8 h-8 text-accent" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 np-text">
                  <InlineEdit settingKey="visionTitle" fallback={t('Our Vision', 'हाम्रो लक्ष्य')} />
                </h2>
                <div className="text-gray-600 leading-relaxed np-text">
                  <InlineEdit
                    settingKey="visionText"
                    fallback={t(
                      'To be a leading educational institution in Lamjung that produces responsible, innovative, and compassionate citizens equipped to meet the challenges of the future.',
                      'भविष्यका चुनौतीहरूको सामना गर्न सुसज्जित जिम्मेवार, नवीन र दयालु नागरिकहरू उत्पादन गर्ने लमजुङको एक अग्रणी शैक्षिक संस्था बन्नु।'
                    )}
                    multiline={true}
                    as="div"
                    className="whitespace-pre-line block"
                  />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-200 mb-16" />

          {/* Principal's Message */}
          <div className="flex flex-col md:flex-row gap-10 items-center">
            <div className="md:w-1/3">
              <div className="bg-gray-200 w-full aspect-square rounded-2xl overflow-hidden relative shadow-md">
                <InlineImageEdit 
                  settingKey="principalImageUrl"
                  fallbackUrl="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                  className="w-full h-full object-cover"
                  alt="Principal"
                />
              </div>
            </div>
            <div className="md:w-2/3 space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 np-text">
                <InlineEdit settingKey="principalMessageTitle" fallback={t('Principal\'s Message', 'प्रधानाध्यापकको मन्तव्य')} />
              </h2>
              <h3 className="text-xl font-semibold text-primary np-text flex flex-col gap-1">
                <InlineEdit settingKey="principalName" fallback={t('Surya Bahadur K.C.', 'सूर्यबहादुर के.सी.')} as="span" />
                <span className="text-sm font-normal text-gray-500">
                  <InlineEdit settingKey="principalDesignation" fallback={t('Principal, Vidhya Jyoti Secondary School', 'प्रधानाध्यापक, विद्या ज्योति मा.वि.')} as="span" />
                </span>
              </h3>
              <div className="text-gray-600 leading-relaxed space-y-4 np-text">
                <InlineEdit
                  settingKey="principalMessage"
                  multiline={true}
                  fallback={t(
                    'Welcome to Vidhya Jyoti Secondary School. It is my privilege to lead this institution where every student is valued and encouraged to excel.\n\nOur dedicated staff works tirelessly to provide a curriculum that is not only academically rigorous but also rich in extracurricular opportunities. We believe in holistic education—nurturing the mind, body, and spirit.\n\nWe are deeply grateful for the continuous support from our parents and the local community in Khahare. Together, we are building a brighter future for our children.',
                    'विद्या ज्योति माध्यमिक विद्यालयमा स्वागत छ। प्रत्येक विद्यार्थीको कदर गरिने र उत्कृष्ट हुन प्रोत्साहित गरिने यस संस्थाको नेतृत्व गर्न पाउनु मेरो सौभाग्य हो।\n\nहाम्रा समर्पित कर्मचारीहरू शैक्षिक रूपमा मात्र नभई अतिरिक्त क्रियाकलापका अवसरहरूमा पनि समृद्ध पाठ्यक्रम प्रदान गर्न अथक प्रयास गर्छन्। हामी दिमाग, शरीर र आत्माको पालनपोषण गर्ने समग्र शिक्षामा विश्वास गर्छौं।\n\nहामी हाम्रा अभिभावक र खहरेको स्थानीय समुदायको निरन्तर सहयोगको लागि हृदयदेखि नै आभारी छौं। सँगै मिलेर, हामी हाम्रा बालबालिकाको लागि उज्यालो भविष्य निर्माण गर्दैछौं।'
                  )}
                  as="p"
                  className="whitespace-pre-line"
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-200 my-16" />

          {/* School Overview */}
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 np-text">
              <InlineEdit settingKey="overviewTitle" fallback={t('School Overview', 'विद्यालयको सिंहावलोकन')} />
            </h2>
            <div className="text-gray-600 leading-relaxed np-text">
              <InlineEdit
                settingKey="aboutText"
                multiline={true}
                fallback={t(
                  'Established in Khahare, Lamjung, Vidhya Jyoti Secondary School has grown steadily over the years. We provide classes from early childhood education up to the secondary level.\n\nOur facilities include well-equipped classrooms, a growing library, sports facilities, and dedicated spaces for extracurricular activities. We continuously strive to upgrade our infrastructure and teaching methodologies to align with modern educational standards.',
                  'खहरे, लमजुङमा स्थापित विद्या ज्योति माध्यमिक विद्यालय वर्षौंको दौडान निरन्तर रूपमा अगाडि बढिरहेको छ। हामी प्रारम्भिक बाल्यकालदेखि माध्यमिक तहसम्म कक्षाहरू प्रदान गर्दछौं।\n\nहाम्रा सुविधाहरूमा राम्ररी सुसज्जित कक्षा कोठाहरू, पुस्तकालय, खेलकुद सुविधाहरू र अतिरिक्त क्रियाकलापहरूका लागि समर्पित ठाउँहरू समावेश छन्। हामी आधुनिक शैक्षिक मापदण्डहरूसँग मिल्दोजुल्दो हाम्रा पूर्वाधार र शिक्षण पद्धतिहरू अपग्रेड गर्न निरन्तर प्रयास गर्छौं।'
                )}
                as="p"
                className="whitespace-pre-line block"
              />
            </div>
            <div className="flex justify-center mt-8">
              <div className="bg-blue-50 py-4 px-8 rounded-full flex items-center gap-3">
                 <Users className="w-6 h-6 text-primary" />
                 <span className="font-semibold text-primary np-text">
                   <InlineEdit settingKey="communityTagline" fallback={t('A vibrant community of learners', 'सिक्नेहरूको एक जीवन्त समुदाय')} as="span" />
                 </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
