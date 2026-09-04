import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, Phone, MapPin, Youtube } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { InlineEdit } from '../components/InlineEdit';

export default function Footer() {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const { settings } = useSettings();

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-8">
          
          {/* School Info */}
          <div>
            <h2 className="text-white text-xl font-bold mb-4 np-text">
              <InlineEdit
                settingKey="heroTitle"
                fallback={t('Vidhya Jyoti Secondary School', 'विद्या ज्योति मा.वि.')}
              />
            </h2>
            <p className="text-gray-400 mb-6 max-w-sm np-text">
              <InlineEdit
                settingKey="heroSubtitle"
                fallback={t(
                  'Empowering Students for a Bright Future. Providing quality education in Lamjung since our founding.',
                  'उज्ज्वल भविष्यको लागि विद्यार्थीहरूलाई सशक्त बनाउँदै। स्थापनाकालदेखि लमजुङमा गुणस्तरीय शिक्षा प्रदान गर्दै।'
                )}
                multiline={true}
                as="span"
              />
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-gray-400">
                <MapPin className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                <span className="np-text">
                  <InlineEdit
                    settingKey="address"
                    fallback={t('Khahare, Lamjung, Gandaki Province, Nepal', 'खहरे, लमजुङ, गण्डकी प्रदेश, नेपाल')}
                  />
                </span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Phone className="w-5 h-5 text-accent flex-shrink-0" />
                <span>
                  <InlineEdit
                    settingKey="phoneNumber"
                    fallback="+977"
                  />
                </span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Mail className="w-5 h-5 text-accent flex-shrink-0" />
                <a href={`mailto:${settings?.email || 'info@vidhyajyoti.edu.np'}`} className="hover:text-white transition-colors">
                  <InlineEdit
                    settingKey="email"
                    fallback="info@vidhyajyoti.edu.np"
                    as="span"
                  />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4 np-text">{t('Quick Links', 'द्रुत लिङ्कहरू')}</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-accent transition-colors np-text">{t('About Us', 'हाम्रो बारेमा')}</Link></li>
              <li><Link to="/academics" className="hover:text-accent transition-colors np-text">{t('Academics', 'शैक्षिक')}</Link></li>
              <li><Link to="/calendar" className="hover:text-accent transition-colors np-text">{t('School Calendar', 'विद्यालय क्यालेन्डर')}</Link></li>
              <li><Link to="/downloads" className="hover:text-accent transition-colors np-text">{t('Download Center', 'डाउनलोड केन्द्र')}</Link></li>
              <li><Link to="/charter" className="hover:text-accent transition-colors np-text">{t('Citizen Charter', 'नागरिक बडापत्र')}</Link></li>
              <li><Link to="/staff" className="hover:text-accent transition-colors np-text">{t('Staff Directory', 'कर्मचारी विवरण')}</Link></li>
              <li><Link to="/committees" className="hover:text-accent transition-colors np-text">{t('Committees', 'समितिहरु')}</Link></li>
              <li><Link to="/news" className="hover:text-accent transition-colors np-text">{t('News & Notices', 'समाचार र सूचना')}</Link></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4 np-text">{t('Connect With Us', 'हामीसँग जोडिनुहोस्')}</h3>
            <p className="text-gray-400 mb-4 np-text">{t('Follow us on social media for the latest updates and events.', 'पछिल्ला अद्यावधिकहरू र कार्यक्रमहरूको लागि सामाजिक सञ्जालमा हामीलाई पछ्याउनुहोस्।')}</p>
            <div className="flex gap-4">
              <a 
                href={settings?.facebookUrl || "https://www.facebook.com/profile.php?id=100025405050419"}
                target="_blank" 
                rel="noreferrer"
                className="bg-blue-600 p-3 rounded-full text-white hover:bg-blue-500 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href={settings?.instagramUrl || "https://www.instagram.com/vjsschool07"}
                target="_blank" 
                rel="noreferrer"
                className="bg-pink-600 p-3 rounded-full text-white hover:bg-pink-500 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              {settings?.youtubeUrl && (
                <a 
                  href={settings.youtubeUrl}
                  target="_blank" 
                  rel="noreferrer"
                  className="bg-red-600 p-3 rounded-full text-white hover:bg-red-500 transition-colors"
                  aria-label="Youtube"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              )}
            </div>
            
            <div className="mt-8">
              <h4 className="text-white text-sm font-semibold mb-2 np-text">{t('School Hours', 'विद्यालय समय')}</h4>
              <p className="text-sm text-gray-400 np-text">{t('Sunday - Friday: 10:00 AM – 4:00 PM', 'आइतबार - शुक्रबार: बिहान १०:०० - दिउँसो ४:००')}</p>
              <p className="text-sm text-gray-400 np-text">{t('Saturday: Closed', 'शनिबार: बिदा')}</p>
            </div>
          </div>

        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p className="np-text">&copy; {new Date().getFullYear()} {t('Vidhya Jyoti Secondary School. All rights reserved.', 'विद्या ज्योति माध्यमिक विद्यालय। सबै अधिकार सुरक्षित।')}</p>
          <div className="mt-4 md:mt-0 space-x-4">
            <Link to="/contact" className="hover:text-white transition-colors np-text">{t('Contact', 'सम्पर्क')}</Link>
            <Link to="/admin" className="hover:text-white transition-colors np-text">{isAdmin ? t('Admin Dashboard', 'एडमिन ड्यासबोर्ड') : t('Admin Login', 'एडमिन लगइन')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
