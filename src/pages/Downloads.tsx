import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Download, FileText, Search, FolderDown, Calendar, 
  ExternalLink, CheckCircle2, BookOpen, AlertCircle 
} from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export interface DownloadItem {
  id: string;
  title: string;
  titleNp?: string;
  category: 'routines' | 'syllabus' | 'forms' | 'reports' | 'general';
  fileUrl: string;
  fileType: string;
  fileSize?: string;
  publishDate: string;
  description?: string;
  descriptionNp?: string;
}

export default function Downloads() {
  const { t, language } = useLanguage();
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchDownloads() {
      try {
        const q = query(collection(db, 'downloads'), orderBy('publishDate', 'desc'));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as DownloadItem[];
          setDownloads(list);
        } else {
          setDownloads([]);
        }
      } catch (err) {
        console.error('Error loading downloads:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDownloads();
  }, []);

  const categories = [
    { id: 'all', labelEn: 'All Documents', labelNp: 'सबै दस्तावेजहरू' },
    { id: 'routines', labelEn: 'Exam Routines', labelNp: 'परीक्षा तालिकाहरू' },
    { id: 'syllabus', labelEn: 'Syllabus & Questions', labelNp: 'पाठ्यक्रम तथा प्रश्नपत्र' },
    { id: 'forms', labelEn: 'Application Forms', labelNp: 'आवेदन फारमहरू' },
    { id: 'reports', labelEn: 'Calendar & Reports', labelNp: 'क्यालेन्डर तथा प्रतिवेदन' },
    { id: 'general', labelEn: 'Guidelines & Rules', labelNp: 'आचारसंहिता र निर्देशिका' },
  ];

  const filteredItems = downloads.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const title = (language === 'np' && item.titleNp ? item.titleNp : item.title).toLowerCase();
    const desc = (language === 'np' && item.descriptionNp ? item.descriptionNp : (item.description || '')).toLowerCase();
    const matchesSearch = title.includes(q) || desc.includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-800/60 border border-blue-700 text-accent text-xs font-semibold uppercase tracking-wider mb-4">
              <FolderDown className="w-4 h-4" />
              <span>{t('Digital Resources Hub', 'डिजिटल स्रोत केन्द्र')}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 np-text">
              {t('Download Center', 'डाउनलोड केन्द्र')}
            </h1>
            <p className="text-blue-200 text-base sm:text-lg leading-relaxed np-text">
              {t(
                'Access official exam schedules, curriculum syllabi, printable admission forms, academic calendars, and school directives in one verified place.',
                'विद्यालयको आधिकारिक परीक्षा तालिका, पाठ्यक्रम, भर्ना फारम, शैक्षिक क्यालेन्डर तथा आवश्यक निर्देशिकाहरू यहाँबाट सिधै डाउनलोड गर्नुहोस्।'
              )}
            </p>
          </div>
        </div>

        {/* Search & Category Filter Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-8">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
            
            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('Search documents, forms, routines...', 'दस्तावेज, फारम, रुटिन खोज्नुहोस्...')}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick stats */}
            <div className="text-xs text-slate-500 flex items-center gap-2 self-end md:self-center">
              <span className="font-medium text-slate-700">{filteredItems.length}</span>
              <span>{t('files available', 'फाइलहरू उपलब्ध')}</span>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-slate-100">
            {categories.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
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

        {/* Downloads Grid / List */}
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 mb-1 np-text">
              {t('No documents found', 'कुनै दस्तावेज भेटिएन')}
            </h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto np-text">
              {t('Try searching with different keywords or switch the active category filter.', 'कृपया अन्य शब्द प्रयोग गरेर खोज्नुहोस् वा अन्य श्रेणी छान्नुहोस्।')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredItems.map((item) => {
              const title = language === 'np' && item.titleNp ? item.titleNp : item.title;
              const desc = language === 'np' && item.descriptionNp ? item.descriptionNp : item.description;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md border border-slate-200/80 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg uppercase">
                          {item.fileType || 'PDF'}
                        </span>
                        {item.fileSize && (
                          <span className="text-xs text-slate-400 font-medium">
                            {item.fileSize}
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2 leading-snug np-text">
                      {title}
                    </h3>

                    {desc && (
                      <p className="text-slate-600 text-sm mb-4 line-clamp-2 leading-relaxed np-text">
                        {desc}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{item.publishDate}</span>
                    </div>

                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>{t('Download', 'डाउनलोड')}</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Direct Link to Citizen Charter */}
        <div className="mt-12 bg-amber-50 border border-amber-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500 text-white rounded-2xl">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-amber-900 np-text">
                {t('Looking for the Citizen Charter (नागरिक बडापत्र)?', 'नागरिक बडापत्र खोज्दै हुनुहुन्छ?')}
              </h4>
              <p className="text-amber-700 text-sm np-text">
                {t(
                  'View official service turnaround times, fee regulations, and responsible departments.',
                  'विद्यालयको सम्पूर्ण सेवा, लाग्ने समय र प्रक्रिया सम्बन्धी डिजिटल बडापत्र हेर्नुहोस्।'
                )}
              </p>
            </div>
          </div>
          <a
            href="/charter"
            className="whitespace-nowrap px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm transition shadow-sm"
          >
            {t('View Citizen Charter', 'नागरिक बडापत्र हेर्नुहोस्')}
          </a>
        </div>

      </div>
    </div>
  );
}
