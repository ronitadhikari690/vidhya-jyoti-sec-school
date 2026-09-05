import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, Bell, Users, FileWarning, ArrowRight, BookOpen, Trophy, 
  FolderDown, ShieldCheck, Download, Award, GraduationCap, CheckCircle2, 
  ChevronRight, MapPin, Phone, Mail, Clock, Sparkles, Image as ImageIcon, 
  Heart, ExternalLink, FileText, UserCheck, School
} from 'lucide-react';
import { format } from 'date-fns';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import { InlineEdit } from '../components/InlineEdit';
import { InlineImageEdit } from '../components/InlineImageEdit';
import { HeroMedia } from '../components/HeroMedia';
import { motion } from 'motion/react';
// @ts-ignore
import heroBgImage from '../assets/images/regenerated_image_1777723287199.jpg';

export default function Home() {
  const currentDate = format(new Date(), 'EEEE, MMMM do, yyyy');
  const { t, language } = useLanguage();
  const { settings } = useSettings();

  // Dynamic preview state from Firestore
  const [latestNotices, setLatestNotices] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [featuredDownloads, setFeaturedDownloads] = useState<any[]>([]);
  const [spotlightStaff, setSpotlightStaff] = useState<any[]>([]);
  const [galleryPhotos, setGalleryPhotos] = useState<any[]>([]);
  const [loadingFeeds, setLoadingFeeds] = useState(true);

  useEffect(() => {
    async function loadHomepageFeeds() {
      try {
        // 1. Fetch Latest Notices from Firestore
        const noticesQ = query(collection(db, 'notices'), orderBy('date', 'desc'), limit(3));
        const noticesSnap = await getDocs(noticesQ);
        if (!noticesSnap.empty) {
          setLatestNotices(noticesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        } else {
          setLatestNotices([]);
        }

        // 2. Fetch Calendar Events & Pre-Notices from Firestore
        const eventsQ = query(collection(db, 'calendar_events'), orderBy('adDate', 'asc'), limit(3));
        const eventsSnap = await getDocs(eventsQ);
        if (!eventsSnap.empty) {
          setUpcomingEvents(eventsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        } else {
          setUpcomingEvents([]);
        }

        // 3. Fetch Featured Downloads from Firestore
        const dlQ = query(collection(db, 'downloads'), orderBy('publishDate', 'desc'), limit(3));
        const dlSnap = await getDocs(dlQ);
        if (!dlSnap.empty) {
          setFeaturedDownloads(dlSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        } else {
          setFeaturedDownloads([]);
        }

        // 4. Fetch Staff Spotlight from Firestore
        const staffQ = query(collection(db, 'staff'), limit(4));
        const staffSnap = await getDocs(staffQ);
        if (!staffSnap.empty) {
          setSpotlightStaff(staffSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        } else {
          setSpotlightStaff([]);
        }

        // 5. Fetch Real Gallery Photos from Firestore
        const galleryQ = query(collection(db, 'gallery'), limit(8));
        const gallerySnap = await getDocs(galleryQ);
        if (!gallerySnap.empty) {
          setGalleryPhotos(gallerySnap.docs.map(d => ({ id: d.id, ...d.data() })));
        } else {
          setGalleryPhotos([]);
        }
      } catch (err) {
        console.error('Error loading feeds for homepage:', err);
      } finally {
        setLoadingFeeds(false);
      }
    }

    loadHomepageFeeds();
  }, []);

  const cardVariants = {
    hover: {
      y: -6,
      scale: 1.02,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 15
      }
    }
  };

  return (
    <div className="bg-slate-50 overflow-hidden">
      {/* Announcement Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white py-2.5 px-4 text-sm font-medium text-center shadow-inner flex items-center justify-center gap-2 np-text">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
        </span>
        <InlineEdit 
          settingKey="announcementText"
          fallback={t('Welcome to Vidhya Jyoti! Admissions open for academic year 2082.', 'विद्या ज्योति माध्यमिक विद्यालयमा स्वागत छ! नयाँ शैक्षिक सत्र २०८२ को लागि भर्ना खुल्यो।')}
        />
      </div>

      {/* Hero Section */}
      <section className="relative bg-gray-950 overflow-hidden">
        <HeroMedia fallbackUrl={heroBgImage} />
        
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 my-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>{currentDate}</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-xl tracking-tight leading-tight np-text">
              <InlineEdit
                settingKey="heroTitle"
                fallback={t('Vidhya Jyoti Secondary School', 'विद्या ज्योति माध्यमिक विद्यालय')}
              />
            </h1>
            
            <p className="text-lg sm:text-2xl text-blue-100 mb-3 font-medium np-text flex items-center justify-center gap-2">
              <MapPin className="w-5 h-5 text-accent flex-shrink-0" />
              <InlineEdit
                settingKey="address"
                fallback={t('Khahare, Lamjung, Gandaki Province, Nepal', 'खहरे, लमजुङ, गण्डकी प्रदेश, नेपाल')}
              />
            </p>
            
            <p className="text-xl sm:text-2xl text-accent font-semibold mb-10 italic max-w-2xl mx-auto np-text">
              <InlineEdit
                settingKey="heroSubtitle"
                fallback={t('Nurturing Character, Inspiring Minds, Empowering Future Leaders', 'चरित्र निर्माण, प्रखर ज्ञान, र उज्ज्वल भविष्यको आधार')}
              />
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/about" className="px-7 py-3.5 bg-white text-primary font-bold rounded-2xl shadow-xl hover:bg-blue-50 hover:shadow-2xl transition-all flex items-center gap-2 np-text">
                <School className="w-5 h-5 text-primary" />
                <span>{t('Discover Our School', 'हाम्रो विद्यालयको बारेमा')}</span>
              </Link>
              <Link to="/downloads" className="px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center gap-2 np-text">
                <FolderDown className="w-5 h-5" />
                <span>{t('Download Routines & Forms', 'डाउनलोड केन्द्र')}</span>
              </Link>
              <Link to="/contact" className="px-7 py-3.5 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold rounded-2xl backdrop-blur-md transition-all flex items-center gap-2 np-text">
                <Phone className="w-4 h-4" />
                <span>{t('Contact Desk', 'सम्पर्क गर्नुहोस्')}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Floating Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          
          <motion.div whileHover="hover" variants={cardVariants}>
            <Link to="/calendar" className="bg-white rounded-2xl shadow-md p-4 sm:p-5 flex flex-col items-center text-center hover:shadow-xl transition-all group h-full border border-slate-200/80">
              <div className="bg-blue-50 p-3 rounded-2xl mb-2 group-hover:bg-primary group-hover:text-white transition-colors text-primary shadow-sm">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 np-text">{t('Calendar', 'क्यालेन्डर')}</h3>
              <p className="text-[11px] text-slate-400 mt-1 np-text">{t('Events & holidays', 'कार्यक्रम र बिदा')}</p>
            </Link>
          </motion.div>

          <motion.div whileHover="hover" variants={cardVariants}>
            <Link to="/downloads" className="bg-white rounded-2xl shadow-md p-4 sm:p-5 flex flex-col items-center text-center hover:shadow-xl transition-all group h-full border border-slate-200/80">
              <div className="bg-emerald-50 p-3 rounded-2xl mb-2 group-hover:bg-emerald-600 group-hover:text-white transition-colors text-emerald-600 shadow-sm">
                <FolderDown className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 np-text">{t('Downloads', 'डाउनलोड')}</h3>
              <p className="text-[11px] text-slate-400 mt-1 np-text">{t('Routines & forms', 'रुटिन र फारम')}</p>
            </Link>
          </motion.div>
          
          <motion.div whileHover="hover" variants={cardVariants}>
            <Link to="/news" className="bg-white rounded-2xl shadow-md p-4 sm:p-5 flex flex-col items-center text-center hover:shadow-xl transition-all group h-full border border-slate-200/80">
              <div className="bg-indigo-50 p-3 rounded-2xl mb-2 group-hover:bg-indigo-600 group-hover:text-white transition-colors text-indigo-600 shadow-sm">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 np-text">{t('Notices', 'सूचना')}</h3>
              <p className="text-[11px] text-slate-400 mt-1 np-text">{t('Latest updates', 'पछिल्ला सूचनाहरू')}</p>
            </Link>
          </motion.div>

          <motion.div whileHover="hover" variants={cardVariants}>
            <Link to="/charter" className="bg-white rounded-2xl shadow-md p-4 sm:p-5 flex flex-col items-center text-center hover:shadow-xl transition-all group h-full border border-slate-200/80">
              <div className="bg-purple-50 p-3 rounded-2xl mb-2 group-hover:bg-purple-600 group-hover:text-white transition-colors text-purple-600 shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 np-text">{t('Charter', 'बडापत्र')}</h3>
              <p className="text-[11px] text-slate-400 mt-1 np-text">{t('Citizen services', 'नागरिक बडापत्र')}</p>
            </Link>
          </motion.div>
          
          <motion.div whileHover="hover" variants={cardVariants}>
            <Link to="/staff" className="bg-white rounded-2xl shadow-md p-4 sm:p-5 flex flex-col items-center text-center hover:shadow-xl transition-all group h-full border border-slate-200/80">
              <div className="bg-amber-50 p-3 rounded-2xl mb-2 group-hover:bg-amber-600 group-hover:text-white transition-colors text-amber-600 shadow-sm">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 np-text">{t('Staff Team', 'शिक्षक टोली')}</h3>
              <p className="text-[11px] text-slate-400 mt-1 np-text">{t('Faculty directory', 'कर्मचारी विवरण')}</p>
            </Link>
          </motion.div>
          
          <motion.div whileHover="hover" variants={cardVariants}>
            <Link to="/contact" className="bg-white rounded-2xl shadow-md p-4 sm:p-5 flex flex-col items-center text-center hover:shadow-xl transition-all group h-full border-b-4 border-accent border-slate-200/80">
              <div className="bg-rose-50 p-3 rounded-2xl mb-2 group-hover:bg-accent group-hover:text-white transition-colors text-accent shadow-sm">
                <FileWarning className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 np-text">{t('Absence', 'अनुपस्थिति')}</h3>
              <p className="text-[11px] text-slate-400 mt-1 np-text">{t('Report leave', 'बिदा जानकारी')}</p>
            </Link>
          </motion.div>
          
        </div>
      </section>

      {/* 1. SUBPAGE PREVIEW: About & Principal Message (/about) */}
      <section className="py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold uppercase tracking-wider mb-4">
                <School className="w-3.5 h-3.5 text-blue-600" />
                <span>{t('About Vidhya Jyoti Secondary School', 'हाम्रो विद्यालयको परिचय')}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-6 leading-tight np-text">
                <InlineEdit
                  settingKey="welcomeTitle"
                  fallback={t('Building Strong Foundations for Lifelong Success', 'गुणस्तरीय शिक्षा, प्रखर संस्कार र उज्ज्वल भविष्य')}
                />
              </h2>
              <div className="space-y-4 text-slate-600 text-base sm:text-lg leading-relaxed np-text">
                <InlineEdit
                  settingKey="aboutText"
                  multiline={true}
                  fallback={t(
                    'Located in the scenic landscape of Khahare, Lamjung, Vidhya Jyoti Secondary School is dedicated to holistic education. Combining rigorous academics with sports, digital literacy, and moral character, we empower students to lead with integrity in an ever-changing world.\n\nOur campus boasts modern science labs, computer equipment, qualified educators, and active community partnership to ensure every child thrives.',
                    'खहरे, लमजुङको प्राकृतिक तथा शान्त वातावरणमा अवस्थित विद्या ज्योति माध्यमिक विद्यालय गुणस्तरीय र व्यावहारिक शिक्षाको केन्द्र हो। हामी विद्यार्थीहरूलाई केवल किताबी ज्ञानमा मात्र सीमित नराखी चरित्र निर्माण, सिर्जनशीलता र प्राविधिक सीपमा समेत अब्बल बनाउन प्रतिबद्ध छौं।'
                  )}
                  as="p"
                  className="whitespace-pre-line block"
                />
              </div>

              {/* Core Pillars */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-100">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="font-bold text-slate-900 text-lg">100%</div>
                  <div className="text-xs text-slate-500 mt-0.5">{t('SEE Success Track', 'एसईई उत्कृष्ट नतिजा')}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="font-bold text-slate-900 text-lg">25+</div>
                  <div className="text-xs text-slate-500 mt-0.5">{t('Expert Teachers', 'अनुभवी शिक्षक टोली')}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="font-bold text-slate-900 text-lg">500+</div>
                  <div className="text-xs text-slate-500 mt-0.5">{t('Happy Students', 'सक्रिय विद्यार्थीहरू')}</div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-4 items-center">
                <Link to="/about" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-light transition-all shadow-md np-text">
                  <span>{t('Read School History & Vision', 'विस्तृत विवरण तथा इतिहास')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/responsibilities" className="text-sm font-semibold text-slate-600 hover:text-primary flex items-center gap-1.5 transition">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>{t('Teacher Roles & Committees', 'शिक्षक जिम्मेवारी विवरण')}</span>
                </Link>
              </div>
            </div>

            {/* Visual Collage & Principal Quote */}
            <div className="lg:col-span-6 space-y-4">
              <div className="relative">
                <InlineImageEdit
                  settingKey="homeImage3"
                  fallbackUrl="/src/assets/images/regenerated_image_1777713454789.jpg"
                  className="rounded-3xl shadow-xl w-full aspect-[16/10] object-cover"
                  alt="Vidhya Jyoti School Group"
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-5 rounded-2xl shadow-xl border border-slate-100 max-w-sm hidden sm:block">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold text-xl flex-shrink-0">
                      ★
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">"Empower Every Child"</div>
                      <div className="text-xs text-slate-500">Committed to educational equity in Lamjung</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <InlineImageEdit
                  settingKey="homeImage1"
                  fallbackUrl="https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                  className="rounded-2xl shadow-md w-full h-40 object-cover"
                />
                <InlineImageEdit
                  settingKey="homeImage2"
                  fallbackUrl="https://images.unsplash.com/photo-1610484826967-09c5720778c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                  className="rounded-2xl shadow-md w-full h-40 object-cover"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. SUBPAGE PREVIEW: Academics & Learning Streams (/academics) */}
      <section className="py-20 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-2">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>{t('Academic Programs & Curriculum', 'शैक्षिक कार्यक्रम तथा तहहरू')}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 np-text">
                {t('Comprehensive Learning From PG to Grade 10', 'नर्सरीदेखि माध्यमिक तहसम्मको गुणस्तरीय शिक्षा')}
              </h2>
            </div>
            <Link
              to="/academics"
              className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:underline"
            >
              <span>{t('View Full Curriculum Details', 'सम्पूर्ण पाठ्यक्रम हेर्नुहोस्')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Box 1: Basic */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/80 hover:shadow-xl hover:border-blue-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                  <Award className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Foundation Level</span>
                <h3 className="text-2xl font-bold text-slate-900 mt-1 mb-3 np-text">
                  {t('Primary Education (Grades 1-5)', 'आधारभूत तह (कक्षा १ - ५)')}
                </h3>
                <p className="text-slate-600 text-sm mb-6 leading-relaxed np-text">
                  {t(
                    'Building core literacy, numeracy, creative expression, and curiosity through playful, child-centered activity learning.',
                    'बालकेन्द्रित सिकाइ, आधारभूत भाषा तथा गणितीय क्षमता विकास एवं सिर्जनशीलता अभिवृद्धि।'
                  )}
                </p>
                <ul className="space-y-2.5 text-sm text-slate-700">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Nepali & English Language Mastery</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Interactive Math & Science Basics</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Art, Moral Education & Physical Play</li>
                </ul>
              </div>
              <Link to="/academics" className="mt-8 pt-4 border-t border-slate-100 text-xs font-bold text-blue-600 flex items-center gap-1 hover:gap-2 transition-all">
                <span>Learn More</span> <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Box 2: Lower Secondary */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/80 hover:shadow-xl hover:border-blue-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                  <BookOpen className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Intermediate Level</span>
                <h3 className="text-2xl font-bold text-slate-900 mt-1 mb-3 np-text">
                  {t('Lower Secondary (Grades 6-8)', 'नि निम्न माध्यमिक तह (कक्षा ६ - ८)')}
                </h3>
                <p className="text-slate-600 text-sm mb-6 leading-relaxed np-text">
                  {t(
                    'Strengthening analytical mindset, introduction to science laboratories, computer training, and group projects.',
                    'विज्ञान प्रयोगशाला अभ्यास, कम्प्युटर प्रविधि शिक्षा, र विश्लेषणात्मक सिकाइमा जोड।'
                  )}
                </p>
                <ul className="space-y-2.5 text-sm text-slate-700">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Social Studies & Civic Responsibility</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Computer Technology & ICT Labs</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Practical Science Experiments</li>
                </ul>
              </div>
              <Link to="/academics" className="mt-8 pt-4 border-t border-slate-100 text-xs font-bold text-emerald-600 flex items-center gap-1 hover:gap-2 transition-all">
                <span>Learn More</span> <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Box 3: Secondary SEE */}
            <div className="bg-white p-8 rounded-3xl shadow-md border-2 border-primary hover:shadow-2xl transition-all flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                Flagship SEE Track
              </div>
              <div>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Secondary Level</span>
                <h3 className="text-2xl font-bold text-slate-900 mt-1 mb-3 np-text">
                  {t('Secondary Level (Grades 9-10 / SEE)', 'माध्यमिक तह (कक्षा ९ - १० एसईई)')}
                </h3>
                <p className="text-slate-600 text-sm mb-6 leading-relaxed np-text">
                  {t(
                    'Intensive academic coaching, regular model test series, optional mathematics, and counseling for national SEE excellence.',
                    'एसईई परीक्षाको लागि विशेष तयारी, नियमित नमूना परीक्षा, ऐच्छिक गणित, र क्यारियर परामर्श।'
                  )}
                </p>
                <ul className="space-y-2.5 text-sm text-slate-700">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Compulsory Science & Mathematics</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Optional Mathematics & Computer</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Weekly Mock Exams & Counseling</li>
                </ul>
              </div>
              <Link to="/academics" className="mt-8 pt-4 border-t border-slate-100 text-xs font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all">
                <span>Learn More</span> <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 3. SUBPAGE PREVIEW: Latest Notices & Announcements (/news) */}
      <section className="py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-800 text-xs font-bold uppercase tracking-wider mb-2">
                <Bell className="w-3.5 h-3.5 text-indigo-600" />
                <span>{t('School Notice Board', 'विद्यालय सूचना पाटी')}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 np-text">
                {t('Latest News & Official Announcements', 'ताजा समाचार तथा आधिकारिक सूचनाहरू')}
              </h2>
            </div>
            <Link
              to="/news"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-primary transition shadow-sm"
            >
              <span>{t('View All Notices', 'सबै सूचनाहरू हेर्नुहोस्')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {latestNotices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestNotices.map((notice) => (
                <div
                  key={notice.id}
                  className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 hover:bg-white hover:shadow-xl hover:border-indigo-300 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 uppercase tracking-wide">
                        {notice.category || 'Notice'}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        📅 {notice.date}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2 leading-snug np-text">
                      {language === 'np' && notice.titleNp ? notice.titleNp : notice.title}
                    </h3>

                    <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed mb-4 np-text">
                      {notice.excerpt || notice.content || 'Click below to read full official announcement.'}
                    </p>
                  </div>

                  <Link
                    to="/news"
                    className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    <span>{t('Read Notice', 'विस्तृत हेर्नुहोस्')}</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-3xl p-10 text-center text-slate-500 max-w-xl mx-auto">
              <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-800 text-base np-text">{t('No notices published yet', 'हाल कुनै सूचना प्रकाशित गरिएको छैन')}</p>
              <p className="text-xs text-slate-500 mt-1 np-text">{t('Official circulars, exam schedules, and announcements will appear here when published.', 'प्रशासनबाट आधिकारिक सूचनाहरू जारी भएपछि यहाँ प्रदर्शित हुनेछन्।')}</p>
            </div>
          )}

        </div>
      </section>

      {/* 4. SUBPAGE PREVIEW: Upcoming Events & Pre-Notices (/calendar) */}
      <section className="py-20 bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>{t('Calendar & Pre-Notices', 'शैक्षिक क्यालेन्डर तथा पूर्व-सूचना')}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white np-text">
                {t('Upcoming Key Dates & School Schedule', 'आगामी मुख्य कार्यक्रम तथा परीक्षा तालिका')}
              </h2>
            </div>
            <Link
              to="/calendar"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500 transition shadow-lg shadow-blue-600/30"
            >
              <span>{t('Open Full Calendar (BS & AD)', 'नेपाली क्यालेन्डर खोल्नुहोस्')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcomingEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-slate-800/80 p-6 rounded-3xl border border-slate-700/80 hover:border-blue-500 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide ${
                        ev.type === 'Exam' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        ev.type === 'Holiday' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {ev.type}
                      </span>
                      {ev.urgency && (
                        <span className="text-[10px] text-amber-400 font-semibold">
                          ● {ev.urgency}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 leading-snug np-text">
                      {ev.title}
                    </h3>

                    <div className="space-y-1 text-xs text-slate-400 mb-4">
                      <div>AD Date: <strong className="text-slate-200">{ev.adDate}</strong></div>
                      {ev.bsDate && <div>वि.सं. मिति: <strong className="text-slate-200">{ev.bsDate}</strong></div>}
                    </div>
                  </div>

                  <Link
                    to="/calendar"
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <span>{t('View in Calendar', 'क्यालेन्डरमा हेर्नुहोस्')}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-800/60 border border-dashed border-slate-700 rounded-3xl p-10 text-center text-slate-400 max-w-xl mx-auto">
              <Calendar className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <p className="font-bold text-slate-200 text-base np-text">{t('No upcoming events scheduled', 'हाल कुनै आगामी कार्यक्रम तय गरिएको छैन')}</p>
              <p className="text-xs text-slate-400 mt-1 np-text">{t('Calendar events, holidays, and examination milestones will appear here.', 'कार्यक्रम, परीक्षा तथा बिदा सम्बन्धी तालिका यहाँ प्रदर्शित हुनेछ।')}</p>
            </div>
          )}

        </div>
      </section>

      {/* 5. SUBPAGE PREVIEW: Resource & Download Center (/downloads) */}
      <section className="py-20 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
                <FolderDown className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('Official Download Center', 'आधिकारिक डाउनलोड केन्द्र')}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 np-text">
                {t('Routines, Model Questions & Forms', 'परीक्षा तालिका, पाठ्यक्रम र फारमहरू')}
              </h2>
            </div>
            <Link
              to="/downloads"
              className="inline-flex items-center gap-2 text-emerald-700 font-bold text-sm hover:underline"
            >
              <span>{t('Browse All Downloads', 'सबै फाइलहरू हेर्नुहोस्')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {featuredDownloads.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredDownloads.map((dl) => (
                <div
                  key={dl.id}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {dl.fileType || 'PDF'} {dl.fileSize ? `• ${dl.fileSize}` : ''}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mb-2 leading-snug np-text">
                      {language === 'np' && dl.titleNp ? dl.titleNp : dl.title}
                    </h3>
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Official document</span>
                    {dl.fileUrl && dl.fileUrl !== '#' ? (
                      <a
                        href={dl.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{t('Download', 'डाउनलोड')}</span>
                      </a>
                    ) : (
                      <Link
                        to="/downloads"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{t('Download', 'डाउनलोड')}</span>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-10 text-center text-slate-500 max-w-xl mx-auto">
              <FolderDown className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-800 text-base np-text">{t('No downloadable files uploaded yet', 'हाल कुनै डाउनलोड फाइल उपलब्ध छैन')}</p>
              <p className="text-xs text-slate-500 mt-1 np-text">{t('Examination routines, syllabi, and admission forms will appear here once uploaded.', 'परीक्षा तालिका, फारम तथा पाठ्यसामग्री थपिएपछि यहाँ प्रदर्शित हुनेछन्।')}</p>
            </div>
          )}

        </div>
      </section>

      {/* 6. SUBPAGE PREVIEW: Citizen Charter (/charter) */}
      <section className="py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-8 sm:p-12 text-white shadow-2xl">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10 pb-8 border-b border-white/10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider mb-3">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t('Institutional Transparency', 'नागरिक बडापत्र')}</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold mb-3 np-text">
                  {t('Citizen Charter & Public Commitments', 'नागरिक बडापत्र तथा सेवा प्रवाह')}
                </h2>
                <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed np-text">
                  {t(
                    'Clear service delivery turnaround times, zero hidden fees, and transparent procedures for students, parents, and community members.',
                    'विद्यार्थी तथा अभिभावकलाई छिटो, छरितो र पारदर्शी रूपमा सेवा प्रदान गर्न प्रतिबद्ध आधिकारिक डिजिटल बडापत्र।'
                  )}
                </p>
              </div>

              <Link
                to="/charter"
                className="whitespace-nowrap px-6 py-3.5 bg-accent hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-sm transition shadow-lg shadow-amber-500/20"
              >
                {t('View Complete Citizen Charter', 'विस्तृत बडापत्र हेर्नुहोस्')}
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-2">
                  <Clock className="w-4 h-4" />
                  <span>{t('Same Day (1 Hour)', 'सोही दिन (१ घण्टा)')}</span>
                </div>
                <h4 className="font-bold text-white text-base mb-1 np-text">
                  {t('New Student Admission', 'नयाँ विद्यार्थी भर्ना')}
                </h4>
                <p className="text-slate-400 text-xs leading-relaxed np-text">
                  {t('Birth certificate copy, previous grade sheet, parent citizenship.', 'जन्म दर्ता, अघिल्लो कक्षाको नतिजा, अभिभावक नागरिकता प्रतिलिपि।')}
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-sm mb-2">
                  <Clock className="w-4 h-4" />
                  <span>{t('Within 24 Hours', '२४ घण्टा भित्र')}</span>
                </div>
                <h4 className="font-bold text-white text-base mb-1 np-text">
                  {t('Transfer Certificate (TC)', 'स्थानान्तरण प्रमाणपत्र (TC)')}
                </h4>
                <p className="text-slate-400 text-xs leading-relaxed np-text">
                  {t('Parent application, library & dues clearance slip.', 'अभिभावकको निवेदन, पुस्तकालय र लेखा क्लियरेन्स।')}
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-sm mb-2">
                  <Clock className="w-4 h-4" />
                  <span>{t('Within 48 Hours', '४८ घण्टा भित्र')}</span>
                </div>
                <h4 className="font-bold text-white text-base mb-1 np-text">
                  {t('Grievance Redressal', 'गुनासो तथा सुझाव सम्बोधन')}
                </h4>
                <p className="text-slate-400 text-xs leading-relaxed np-text">
                  {t('Direct submission to Grievance Hearing Officer / Principal.', 'गुनासो सुन्ने अधिकारी वा प्र.अ. समक्ष सिधै दर्ता।')}
                </p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 7. SUBPAGE PREVIEW: Faculty & Staff Spotlight (/staff) */}
      <section className="py-20 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
                <Users className="w-3.5 h-3.5 text-amber-700" />
                <span>{t('Faculty & Leadership', 'शिक्षक तथा नेतृत्व')}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 np-text">
                {t('Dedicated Educators & Administrative Staff', 'समर्पित शिक्षक तथा कर्मचारी टोली')}
              </h2>
            </div>
            <Link
              to="/staff"
              className="inline-flex items-center gap-2 text-amber-800 font-bold text-sm hover:underline"
            >
              <span>{t('View Full Staff Directory', 'सबै शिक्षक विवरण हेर्नुहोस्')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {spotlightStaff.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {spotlightStaff.map((staff) => (
                <div
                  key={staff.id}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 hover:shadow-xl transition-all text-center flex flex-col items-center justify-between"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-primary/20 shadow-md">
                      <img
                        src={staff.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}
                        alt={staff.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <h3 className="font-bold text-slate-900 text-base mb-1">{staff.name}</h3>
                    <p className="text-xs text-primary font-semibold mb-2">{staff.role}</p>
                    {staff.subject && <p className="text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg">{staff.subject}</p>}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 w-full text-center">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{staff.category || 'Faculty'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-10 text-center text-slate-500 max-w-xl mx-auto">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-800 text-base np-text">{t('Faculty directory being updated', 'शिक्षक तथा कर्मचारी विवरण अद्यावधिक हुँदैछ')}</p>
              <p className="text-xs text-slate-500 mt-1 np-text">{t('Faculty members added in the Admin panel will be displayed here.', 'एडमिन प्यानलबाट शिक्षक विवरण थपिएपछि यहाँ प्रदर्शित हुनेछ।')}</p>
            </div>
          )}

        </div>
      </section>

      {/* 8. SUBPAGE PREVIEW: Campus Photo Gallery Highlights (/gallery) */}
      <section className="py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-800 text-xs font-bold uppercase tracking-wider mb-2">
                <ImageIcon className="w-3.5 h-3.5 text-rose-600" />
                <span>{t('Campus Life & Events', 'विद्यालयका झलकहरू')}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 np-text">
                {t('Moments of Joy, Learning, and Celebration', 'सिकाइ, खेलकुद तथा सह-क्रियाकलापका क्षणहरू')}
              </h2>
            </div>
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 transition shadow-sm"
            >
              <span>{t('Explore Full Gallery', 'फोटो ग्यालरी हेर्नुहोस्')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {galleryPhotos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {galleryPhotos.map((photo) => (
                <Link
                  key={photo.id}
                  to="/gallery"
                  className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all aspect-[4/3] bg-slate-100 block border border-slate-200"
                >
                  <img
                    src={photo.thumbnailUrl || photo.url}
                    alt={photo.title || 'School Gallery Photo'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                    <p className="text-white text-xs font-bold truncate np-text">{photo.title}</p>
                    {photo.category && (
                      <span className="text-[10px] text-amber-300 font-semibold uppercase">{photo.category}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-3xl p-12 text-center text-slate-500 max-w-xl mx-auto">
              <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-800 text-base np-text">{t('No photos in gallery yet', 'ग्यालरीमा हाल कुनै तस्बिरहरू छैनन्')}</p>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto np-text">
                {t('Official photos and highlights from school celebrations and extracurricular activities will appear here once added in the Admin Panel.', 'विद्यालयका कार्यक्रम, खेलकुद तथा गतिविधिको तस्बिरहरू एडमिनबाट अपलोड भएपछि यहाँ प्रदर्शित हुनेछन्।')}
              </p>
            </div>
          )}

        </div>
      </section>

      {/* 9. Parent Portal & Contact Action Banner (/parents & /contact) */}
      <section className="py-20 bg-gradient-to-r from-blue-900 via-primary to-indigo-950 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-accent text-xs font-bold uppercase tracking-wider mb-4">
                <Heart className="w-3.5 h-3.5" />
                <span>{t('Community & Parent Partnership', 'अभिभावक तथा समुदाय सहकार्य')}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 np-text">
                {t('Ready to Enroll Your Child at Vidhya Jyoti?', 'तपाईंको बालबालिकाको उज्ज्वल भविष्यका लागि आजै जोडिनुहोस्')}
              </h2>
              <p className="text-blue-100 text-base sm:text-lg max-w-2xl leading-relaxed np-text">
                {t(
                  'Admissions are open for the new session. Reach out to our front desk for campus visits, scholarship eligibility, and registration procedures.',
                  'नयाँ शैक्षिक सत्रको भर्ना, छात्रवृत्ति प्रक्रिया, तथा विद्यालय भ्रमणको लागि आजै हाम्रो प्रशासनिक डेस्कमा सम्पर्क गर्नुहोस्।'
                )}
              </p>

              <div className="flex flex-wrap gap-4 mt-8">
                <Link
                  to="/parents"
                  className="px-6 py-3.5 bg-white text-primary font-bold rounded-2xl hover:bg-blue-50 transition shadow-lg np-text"
                >
                  {t('Parent Information Hub', 'अभिभावक सूचना केन्द्र')}
                </Link>
                <Link
                  to="/contact"
                  className="px-6 py-3.5 bg-accent hover:bg-amber-400 text-slate-950 font-bold rounded-2xl transition shadow-lg np-text"
                >
                  {t('Contact School Administration', 'विद्यालय प्रशासनमा सम्पर्क')}
                </Link>
                <Link
                  to="/birthdays"
                  className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-2xl transition np-text"
                >
                  🎂 {t('Birthday Wishes', 'जन्मदिनको शुभकामना')}
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 space-y-4">
              <h3 className="font-bold text-lg text-white border-b border-white/20 pb-3">
                <InlineEdit
                  settingKey="helplineTitle"
                  fallback={t('Quick School Helpline', 'तत्काल सम्पर्क डेस्क')}
                />
              </h3>
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-white">
                    <InlineEdit
                      settingKey="helplineLocation"
                      fallback={settings?.address || 'Khahare, Lamjung, Nepal'}
                    />
                  </div>
                  <div className="text-xs text-blue-200">
                    <InlineEdit
                      settingKey="helplineProvince"
                      fallback={t('Gandaki Province', 'गण्डकी प्रदेश')}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-5 h-5 text-accent flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-semibold text-white">
                    <InlineEdit
                      settingKey="helplinePhone"
                      fallback={settings?.phoneNumbers?.[0] || '+977 066-XXXXXX / 98XXXXXXXX'}
                    />
                  </div>
                  <div className="text-xs text-blue-200">
                    <InlineEdit
                      settingKey="helplineHours"
                      fallback={t('Sunday - Friday: 9:00 AM - 4:30 PM', 'आइतबार - शुक्रबार: बिहान ९:०० - दिउँसो ४:३०')}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-5 h-5 text-accent flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-semibold text-white">
                    <InlineEdit
                      settingKey="helplineEmail"
                      fallback={settings?.email || 'info@vidhyajyoti.edu.np'}
                    />
                  </div>
                  <div className="text-xs text-blue-200">
                    <InlineEdit
                      settingKey="helplineDept"
                      fallback={t('Administrative Office', 'प्रशासनिक शाखा')}
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}

