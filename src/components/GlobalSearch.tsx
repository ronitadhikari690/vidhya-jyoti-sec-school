import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, FileText, User, Newspaper, ArrowRight, BookOpen, Calendar, HelpCircle } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useLanguage } from '../context/LanguageContext';

interface SearchResultItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Page' | 'Notice' | 'Staff' | 'Form';
  path: string;
  icon: any;
}

const STATIC_PAGES: SearchResultItem[] = [
  { id: 'p-home', title: 'Home Page', subtitle: 'Main landing page and school overview', category: 'Page', path: '/', icon: BookOpen },
  { id: 'p-about', title: 'About Us', subtitle: 'School history, principal message, and mission', category: 'Page', path: '/about', icon: BookOpen },
  { id: 'p-academics', title: 'Academics & Courses', subtitle: 'Curriculum, classes, and educational programs', category: 'Page', path: '/academics', icon: BookOpen },
  { id: 'p-calendar', title: 'Academic Calendar', subtitle: 'Holidays, exam schedules, and school events', category: 'Page', path: '/calendar', icon: Calendar },
  { id: 'p-news', title: 'News & Notices', subtitle: 'Latest announcements, result updates, and press', category: 'Page', path: '/news', icon: Newspaper },
  { id: 'p-committees', title: 'Committees & Management', subtitle: 'School management, SMC, and PTA details', category: 'Page', path: '/committees', icon: User },
  { id: 'p-staff', title: 'Staff Directory', subtitle: 'Teachers, administration, and support staff', category: 'Page', path: '/staff', icon: User },
  { id: 'p-responsibilities', title: 'Teacher Responsibilities', subtitle: 'Duty rosters, subject allocation, and roles', category: 'Page', path: '/responsibilities', icon: FileText },
  { id: 'p-parents', title: 'Parents Portal & Forms', subtitle: 'Leave application, admission & scholarship forms', category: 'Page', path: '/parents', icon: FileText },
  { id: 'p-students', title: 'Students Corner', subtitle: 'Student clubs, achievements, and guidelines', category: 'Page', path: '/students', icon: User },
  { id: 'p-birthdays', title: 'Birthday Corner 🎂', subtitle: 'Birthday wishes for students, teachers, and staff', category: 'Page', path: '/birthdays', icon: BookOpen },
  { id: 'p-gallery', title: 'Media & Event Gallery 📸', subtitle: 'Photos and videos of sports week, annual functions, ECA, and exhibitions', category: 'Page', path: '/gallery', icon: BookOpen },
  { id: 'p-contact', title: 'Contact Us', subtitle: 'Phone, location map, and email address', category: 'Page', path: '/contact', icon: HelpCircle },
  { id: 'f-leave', title: 'Leave Application Form', subtitle: 'Online form for student leave request', category: 'Form', path: '/parents', icon: FileText },
  { id: 'f-admission', title: 'Admission Application Form', subtitle: 'New student admission form', category: 'Form', path: '/parents', icon: FileText },
  { id: 'f-scholarship', title: 'Scholarship Form', subtitle: 'Financial aid and fee waiver form', category: 'Form', path: '/parents', icon: FileText },
];

export default function GlobalSearch({ isMobile = false }: { isMobile?: boolean }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [noticesData, setNoticesData] = useState<any[]>([]);
  const [staffData, setStaffData] = useState<any[]>([]);
  const [hasFetched, setHasFetched] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Firestore dynamic items when user opens or focuses search
  const handleFocus = async () => {
    setIsOpen(true);
    if (hasFetched) return;

    try {
      // Fetch notices
      const noticesSnap = await getDocs(collection(db, 'notices'));
      const fetchedNotices = noticesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNoticesData(fetchedNotices);

      // Fetch staff
      const staffSnap = await getDocs(collection(db, 'staff'));
      const fetchedStaff = staffSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStaffData(fetchedStaff);

      setHasFetched(true);
    } catch (err) {
      console.error('Error loading search index:', err);
    }
  };

  // Perform search filter
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase().trim();

    // 1. Filter static pages
    const filteredPages = STATIC_PAGES.filter(
      p => p.title.toLowerCase().includes(q) || (p.subtitle && p.subtitle.toLowerCase().includes(q))
    );

    // 2. Filter notices
    const filteredNotices: SearchResultItem[] = noticesData
      .filter(n => (n.title && n.title.toLowerCase().includes(q)) || (n.excerpt && n.excerpt.toLowerCase().includes(q)))
      .map(n => ({
        id: `notice-${n.id}`,
        title: n.title,
        subtitle: n.excerpt || n.date || 'School Announcement',
        category: 'Notice',
        path: '/news',
        icon: Newspaper
      }));

    // 3. Filter staff
    const filteredStaff: SearchResultItem[] = staffData
      .filter(s => (s.name && s.name.toLowerCase().includes(q)) || (s.role && s.role.toLowerCase().includes(q)) || (s.subject && s.subject.toLowerCase().includes(q)))
      .map(s => ({
        id: `staff-${s.id}`,
        title: s.name,
        subtitle: `${s.role || ''} ${s.subject ? `• ${s.subject}` : ''}`,
        category: 'Staff',
        path: '/staff',
        icon: User
      }));

    setResults([...filteredPages, ...filteredNotices, ...filteredStaff]);
  }, [query, noticesData, staffData]);

  const handleSelectResult = (path: string) => {
    navigate(path);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div ref={containerRef} className={`relative ${isMobile ? 'w-full' : 'w-48 lg:w-64'}`}>
      {/* Search Bar Input */}
      <div 
        className={`flex items-center bg-blue-900/80 hover:bg-blue-900 border border-blue-700/60 rounded-lg px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-white transition-all shadow-inner ${
          isMobile ? 'w-full' : ''
        }`}
      >
        <Search className="w-4 h-4 text-blue-200 flex-shrink-0" />
        <input
          ref={searchInputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          placeholder={t("Search school site...", "खोज्नुहोस्...")}
          className="bg-transparent border-none text-xs sm:text-sm text-white focus:outline-none px-2 w-full placeholder-blue-300/80 np-text"
        />
        {query ? (
          <button 
            onClick={() => setQuery('')}
            className="text-blue-200 hover:text-white p-0.5 rounded-full"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <span className="hidden sm:inline-block text-[10px] bg-blue-800/80 text-blue-200 px-1.5 py-0.5 rounded font-mono border border-blue-700/50">
            ⌘K
          </span>
        )}
      </div>

      {/* Results Dropdown Overlay */}
      {isOpen && (
        <div 
          className={`absolute left-0 ${isMobile ? 'right-0 w-full' : 'right-0 sm:right-auto w-80 sm:w-96'} mt-2 bg-white text-gray-900 rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-in fade-in duration-150`}
        >
          {/* Top Quick Suggestions or Search Status */}
          {!query.trim() ? (
            <div className="p-4 bg-gray-50 border-b border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Quick Shortcuts</p>
              <div className="flex flex-wrap gap-1.5">
                {STATIC_PAGES.slice(0, 6).map((page) => (
                  <button
                    key={page.id}
                    onClick={() => handleSelectResult(page.path)}
                    className="text-xs bg-white hover:bg-blue-50 hover:text-primary text-gray-700 px-2.5 py-1 rounded-md border border-gray-200 transition-colors font-medium flex items-center gap-1 cursor-pointer"
                  >
                    {page.title}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">
                Found {results.length} result{results.length === 1 ? '' : 's'}
              </span>
              <span className="text-[10px] text-gray-400">Esc to close</span>
            </div>
          )}

          {/* Results List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {query.trim() && results.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                No matching results found for "<span className="font-semibold">{query}</span>".
              </div>
            ) : (
              results.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectResult(item.path)}
                    className="p-3 hover:bg-blue-50/80 transition-colors cursor-pointer flex items-start gap-3 group"
                  >
                    <div className={`p-2 rounded-lg mt-0.5 flex-shrink-0 ${
                      item.category === 'Notice' ? 'bg-amber-100 text-amber-800' :
                      item.category === 'Staff' ? 'bg-emerald-100 text-emerald-800' :
                      item.category === 'Form' ? 'bg-purple-100 text-purple-800' :
                      'bg-blue-100 text-primary'
                    }`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-primary truncate">
                          {item.title}
                        </h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider flex-shrink-0 ${
                          item.category === 'Notice' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          item.category === 'Staff' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          item.category === 'Form' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                          'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {item.category}
                        </span>
                      </div>
                      {item.subtitle && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">{item.subtitle}</p>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-transform group-hover:translate-x-0.5 mt-1" />
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
