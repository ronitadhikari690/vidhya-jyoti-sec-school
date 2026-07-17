import { Link } from 'react-router-dom';
import { Calendar, Bell, Users, FileWarning, ArrowRight, BookOpen, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import { InlineEdit } from '../components/InlineEdit';
import { InlineImageEdit } from '../components/InlineImageEdit';
import { motion } from 'motion/react';
// @ts-ignore
import heroBgImage from '../assets/images/regenerated_image_1777723287199.jpg';

export default function Home() {
  const currentDate = format(new Date(), 'EEEE, MMMM do, yyyy');
  const { t } = useLanguage();
  const { settings } = useSettings();

  const cardVariants = {
    hover: {
      y: -8,
      scale: 1.02,
      rotateX: 10,
      rotateY: 10,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  return (
    <div style={{ perspective: "1000px" }}>
      {/* Announcement Banner */}
      <div className="bg-accent text-white py-2 px-4 text-sm font-medium text-center np-text">
        <span className="animate-pulse mr-2">●</span>
        <InlineEdit 
          settingKey="announcementText"
          fallback={t('Welcome to the new academic year! More updates coming soon.', 'नयाँ शैक्षिक सत्रमा स्वागत छ! थप जानकारीहरू छिट्टै आउँदैछन्।')}
        />
      </div>

      {/* Hero Section */}
      <section className="relative bg-primary overflow-hidden">
        <div className="absolute inset-0">
          <InlineImageEdit
            settingKey="heroImageUrl"
            fallbackUrl={heroBgImage}
            className="w-full h-full object-cover opacity-20"
            alt="School building"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent"></div>
        </div>
        
        <div className="relative max-w-5xl mx-auto px-6 sm:px-10 lg:px-12 pt-16 pb-20 mt-12 mb-20 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl">
          <div className="text-center">
            <p className="text-blue-200 font-semibold tracking-wider uppercase mb-4">{currentDate}</p>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-lg np-text">
              <InlineEdit
                settingKey="heroTitle"
                fallback={t('Vidhya Jyoti Secondary School', 'विद्या ज्योति माध्यमिक विद्यालय')}
              />
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-2 font-medium np-text">
              <InlineEdit
                settingKey="address"
                fallback={t('Khahare, Lamjung, Nepal', 'खहरे, लमजुङ, नेपाल')}
              />
            </p>
            <p className="text-2xl md:text-3xl text-accent font-bold mb-10 italic np-text">
              <InlineEdit
                settingKey="heroSubtitle"
                fallback={t('Empowering Students for a Bright Future', 'उज्ज्वल भविष्यको लागि विद्यार्थीहरूलाई सशक्त बनाउँदै')}
              />
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/about" className="px-8 py-3 bg-white text-primary font-bold rounded-full shadow-lg hover:bg-blue-50 transition-colors np-text">
                {t('Discover Our School', 'हाम्रो विद्यालयको बारेमा')}
              </Link>
              <Link to="/contact" className="px-8 py-3 bg-transparent border-2 border-white text-white font-bold rounded-full hover:bg-white/10 transition-colors np-text">
                {t('Contact Us', 'सम्पर्क गर्नुहोस्')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <motion.div whileHover="hover" variants={cardVariants}>
            <Link to="/calendar" className="bg-white rounded-xl shadow-md p-5 flex flex-col items-center text-center hover:shadow-2xl transition-all group h-full">
              <div className="bg-blue-50 p-3 rounded-full mb-3 group-hover:bg-primary group-hover:text-white transition-colors text-primary shadow-sm">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-gray-900 np-text">{t('Calendar', 'क्यालेन्डर')}</h3>
              <p className="text-xs text-gray-400 mt-2 np-text">{t('View school events & holidays', 'विद्यालयका कार्यक्रम र बिदाहरू हेर्नुहोस्')}</p>
            </Link>
          </motion.div>
          
          <motion.div whileHover="hover" variants={cardVariants}>
            <Link to="/news" className="bg-white rounded-xl shadow-md p-5 flex flex-col items-center text-center hover:shadow-2xl transition-all group h-full">
              <div className="bg-blue-50 p-3 rounded-full mb-3 group-hover:bg-primary group-hover:text-white transition-colors text-primary shadow-sm">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-gray-900 np-text">{t('Notices', 'सूचना')}</h3>
              <p className="text-xs text-gray-400 mt-2 np-text">{t('Latest updates and announcements', 'पछिल्ला अद्यावधिकहरू र घोषणाहरू')}</p>
            </Link>
          </motion.div>
          
          <motion.div whileHover="hover" variants={cardVariants}>
            <Link to="/parents" className="bg-white rounded-xl shadow-md p-5 flex flex-col items-center text-center hover:shadow-2xl transition-all group h-full">
              <div className="bg-blue-50 p-3 rounded-full mb-3 group-hover:bg-primary group-hover:text-white transition-colors text-primary shadow-sm">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-gray-900 np-text">{t('Parent Info', 'अभिभावक जानकारी')}</h3>
              <p className="text-xs text-gray-400 mt-2 np-text">{t('Resources for parents and guardians', 'अभिभावकहरूका लागि स्रोतहरू')}</p>
            </Link>
          </motion.div>
          
          <motion.div whileHover="hover" variants={cardVariants}>
            <Link to="/contact" className="bg-white rounded-xl shadow-md p-5 flex flex-col items-center text-center hover:shadow-2xl transition-all group h-full border-b-4 border-accent">
              <div className="bg-amber-50 p-3 rounded-full mb-3 group-hover:bg-accent group-hover:text-white transition-colors text-accent shadow-sm">
                <FileWarning className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-gray-900 np-text">{t('Report Absence', 'अनुपस्थिति जानकारी')}</h3>
              <p className="text-xs text-gray-400 mt-2 np-text">{t('Notify the school of a student absence', 'विद्यार्थीको अनुपस्थितिको बारेमा विद्यालयलाई जानकारी गराउनुहोस्')}</p>
            </Link>
          </motion.div>
          
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-20 bg-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6 np-text">
                <InlineEdit
                  settingKey="welcomeTitle"
                  fallback={t('Welcome to Vidhya Jyoti Secondary School', 'विद्या ज्योति माध्यमिक विद्यालयमा स्वागत छ')}
                />
              </h2>
              <div className="space-y-4 text-gray-600 text-lg np-text">
                <InlineEdit
                  settingKey="aboutText"
                  multiline={true}
                  fallback={t(
                    'Located in the beautiful region of Khahare, Lamjung, our school has been a pillar of educational excellence in the community. We are committed to fostering an environment where students can thrive academically, socially, and personally.\n\nWith dedicated staff, active parent involvement, and a curriculum designed to challenge and inspire, we prepare our students to become responsible citizens and future leaders.',
                    'खहरे, लमजुङको सुन्दर क्षेत्रमा अवस्थित हाम्रो विद्यालय समुदायमा शैक्षिक उत्कृष्टताको एक स्तम्भ रहेको छ। हामी विद्यार्थीहरूले शैक्षिक, सामाजिक र व्यक्तिगत रूपमा फस्टाउन सक्ने वातावरण निर्माण गर्न प्रतिबद्ध छौं।\n\nसमर्पित कर्मचारी, सक्रिय अभिभावकको संलग्नता, र चुनौती एवं प्रेरित गर्न डिजाइन गरिएको पाठ्यक्रमको साथ, हामी हाम्रा विद्यार्थीहरूलाई जिम्मेवार नागरिक र भविष्यका नेता बन्न तयार गर्छौं।'
                  )}
                  as="p"
                  className="whitespace-pre-line block"
                />
              </div>
              <Link to="/about" className="inline-flex items-center gap-2 text-primary font-semibold mt-8 hover:text-primary-light transition-colors np-text">
                {t('Read Principal\'s Message', 'प्रधानाध्यापकको मन्तव्य पढ्नुहोस्')} <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-8">
                <InlineImageEdit
                  settingKey="homeImage1"
                  fallbackUrl="https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                  className="rounded-2xl shadow-lg w-full h-auto"
                />
                <InlineImageEdit
                  settingKey="homeImage2"
                  fallbackUrl="https://images.unsplash.com/photo-1610484826967-09c5720778c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                  className="rounded-2xl shadow-lg w-full h-auto"
                />
              </div>
              <div className="space-y-4">
                <InlineImageEdit
                  settingKey="homeImage3"
                  fallbackUrl="/src/assets/images/regenerated_image_1777713454789.jpg"
                  className="rounded-2xl shadow-lg w-full aspect-[4/5] object-cover transition-all duration-700 hover:scale-[1.03] hover:shadow-2xl"
                  alt="Vidhya Jyoti School Group"
                />
                <div className="bg-primary-light rounded-2xl p-6 text-white shadow-lg flex flex-col justify-center translate-y-4">
                  <h3 className="font-bold text-xl mb-2 flex items-center gap-2 np-text"><BookOpen className="w-6 h-6"/> {t('Excellence', 'उत्कृष्टता')}</h3>
                  <p className="text-blue-100 np-text">{t('Dedicated to high standards of teaching and learning.', 'शिक्षण र सिकाइको उच्च मापदण्डमा समर्पित।')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
