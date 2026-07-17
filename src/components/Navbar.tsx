import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, GraduationCap, Globe } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { language, toggleLanguage, t } = useLanguage();

  const navLinks = [
    { name: t('Home', 'गृहपृष्ठ'), path: '/' },
    { name: t('About', 'हाम्रो बारेमा'), path: '/about' },
    { name: t('Academics', 'शैक्षिक'), path: '/academics' },
    { name: t('Calendar', 'क्यालेन्डर'), path: '/calendar' },
    { name: t('News & Notices', 'समाचार र सूचना'), path: '/news' },
    { name: t('Committees', 'समितिहरु'), path: '/committees' },
    { name: t('Staff Directory', 'कर्मचारी विवरण'), path: '/staff' },
    { name: t('Responsibilities', 'जिम्मेवारी'), path: '/responsibilities' },
    { name: t('Parents', 'अभिभावक'), path: '/parents' },
    { name: t('Students', 'विद्यार्थी'), path: '/students' },
    { name: t('Contact', 'सम्पर्क'), path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-primary text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo & School Name */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="bg-white p-2 rounded-full hidden sm:block">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold leading-tight flex items-center gap-2">
                {t('Vidhya Jyoti Sec. School', 'विद्या ज्योति मा.वि.')}
              </h1>
              <p className="text-xs sm:text-sm text-blue-200">
                {t('Khahare, Lamjung', 'खहरे, लमजुङ')}
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden xl:flex items-center space-x-1">
            {navLinks.slice(0, 5).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.path) ? 'bg-primary-light text-white' : 'hover:bg-blue-800 text-gray-100'
                } np-text`}
              >
                {link.name}
              </Link>
            ))}
            
            {/* More dropdown for desktop to save space, or just show all if screen is wide enough.
                Using a simple layout for now. Let's show everything on xl screens, but hide on lg. */}
            <div className="relative group">
              <button className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800 text-gray-100 flex items-center np-text">
                {t('More', 'थप')}
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {navLinks.slice(5).map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="block px-4 py-2 text-sm hover:bg-gray-100 hover:text-primary np-text"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Layout Toggle */}
            <button
              onClick={toggleLanguage}
              className="ml-2 flex items-center gap-2 bg-blue-800 hover:bg-blue-700 rounded-md px-3 py-2 transition-colors border border-blue-700"
              title="Change Language"
            >
              <Globe className="w-4 h-4 text-accent" />
              <span className="text-sm font-bold uppercase w-6 text-center">
                {language === 'en' ? 'EN' : 'NP'}
              </span>
            </button>

            {/* Search */}
            <div className="ml-2 flex items-center bg-blue-800 rounded-md px-2 py-1.5 focus-within:ring-2 ring-white">
              <Search className="w-4 h-4 text-gray-300" />
              <input
                type="text"
                placeholder={t("Search...", "खोज्नुहोस्...")}
                className="bg-transparent border-none text-sm text-white focus:outline-none px-2 w-24 placeholder-gray-400 np-text"
              />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="xl:hidden flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 bg-blue-800 rounded-md px-3 py-2 transition-colors border border-blue-700"
              title="Change Language"
            >
              <Globe className="w-4 h-4 text-accent" />
              <span className="text-sm font-bold uppercase w-6 text-center">
                {language === 'en' ? 'EN' : 'NP'}
              </span>
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-100 hover:text-white focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="xl:hidden bg-blue-900 shadow-xl border-t border-blue-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-3 rounded-md text-base font-medium np-text ${
                  isActive(link.path) ? 'bg-primary-light text-white' : 'text-gray-100 hover:bg-blue-800 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="p-3">
              <div className="flex items-center bg-blue-800 rounded-md px-3 py-2">
                <Search className="w-5 h-5 text-gray-300" />
                <input
                  type="text"
                  placeholder={t("Search...", "खोज्नुहोस्...")}
                  className="bg-transparent border-none text-base text-white focus:outline-none px-2 w-full placeholder-gray-400 np-text"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
