import React, { useState, useEffect } from 'react';
import { Gift, Calendar, Sparkles, User, Heart, MessageCircle, Plus, Search, Cake, PartyPopper, Award, Send } from 'lucide-react';
import { collection, getDocs, addDoc, doc, updateDoc, increment, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export interface BirthdayItem {
  id: string;
  name: string;
  category: 'Student (Boy)' | 'Student (Girl)' | 'Teacher' | 'Staff';
  gradeOrRole: string; // e.g. "Grade 9-A" or "Mathematics Teacher"
  birthdayDate: string; // e.g. "2008-08-15" or "08-15" or "Bhadra 12"
  photoUrl?: string;
  wishMessage?: string;
  wishesCount?: number;
  comments?: Array<{ name: string; text: string; date: string }>;
}

const DEFAULT_BIRTHDAYS: BirthdayItem[] = [];

export default function Birthdays() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [birthdays, setBirthdays] = useState<BirthdayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'All' | 'Today' | 'Student' | 'Teacher/Staff'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Track liked / wished IDs locally
  const [wishedIds, setWishedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('wished_birthday_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Comment modal state
  const [selectedItemForWish, setSelectedItemForWish] = useState<BirthdayItem | null>(null);
  const [senderName, setSenderName] = useState('');
  const [wishText, setWishText] = useState('');
  const [sendingWish, setSendingWish] = useState(false);

  useEffect(() => {
    async function fetchBirthdays() {
      try {
        const querySnapshot = await getDocs(collection(db, 'birthdays'));
        const docs = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as BirthdayItem));
        setBirthdays(docs);
      } catch (err) {
        console.error("Error fetching birthdays:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBirthdays();
  }, []);

  const todayFullStr = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  const todayMonthDay = todayFullStr.slice(5); // "MM-DD"

  // Check if birthday has passed/expired
  const isExpired = (bDate: string) => {
    if (!bDate) return false;
    if (bDate.length === 10) {
      return bDate < todayFullStr;
    }
    if (bDate.length === 5) {
      return bDate < todayMonthDay;
    }
    return false;
  };

  const filteredBirthdays = birthdays.filter(item => {
    // 1. Hide expired birthdays automatically
    if (isExpired(item.birthdayDate)) {
      return false;
    }

    // 2. Search query match
    const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.gradeOrRole.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesQuery) return false;

    if (activeTab === 'Today') {
      return item.birthdayDate.includes(todayMonthDay) || item.birthdayDate === todayFullStr;
    }
    if (activeTab === 'Student') {
      return item.category.includes('Student');
    }
    if (activeTab === 'Teacher/Staff') {
      return item.category === 'Teacher' || item.category === 'Staff';
    }

    return true;
  });

  // Toggle Like / Wish button
  const handleToggleWish = async (item: BirthdayItem) => {
    const isWished = wishedIds.includes(item.id);
    const newWishedIds = isWished
      ? wishedIds.filter(id => id !== item.id)
      : [...wishedIds, item.id];

    setWishedIds(newWishedIds);
    try {
      localStorage.setItem('wished_birthday_ids', JSON.stringify(newWishedIds));
    } catch (e) {
      console.error(e);
    }

    const newCount = Math.max(0, (item.wishesCount || 0) + (isWished ? -1 : 1));

    // Optimistically update state
    setBirthdays(prev => prev.map(b => b.id === item.id ? { ...b, wishesCount: newCount } : b));

    // Update Firestore
    try {
      const docRef = doc(db, 'birthdays', item.id);
      await updateDoc(docRef, { wishesCount: increment(isWished ? -1 : 1) });
    } catch (err) {
      console.error('Error updating wish count:', err);
    }
  };

  const handleSendWishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForWish || !wishText.trim() || !senderName.trim()) return;

    setSendingWish(true);
    try {
      const existingComments = selectedItemForWish.comments || [];
      const newComment = {
        name: senderName.trim(),
        text: wishText.trim(),
        date: new Date().toLocaleDateString('ne-NP', { month: 'short', day: 'numeric' })
      };
      const updatedComments = [newComment, ...existingComments];
      const newCount = (selectedItemForWish.wishesCount || 0) + 1;

      // Update in local state
      setBirthdays(prev => prev.map(b => b.id === selectedItemForWish.id ? {
        ...b,
        wishesCount: newCount,
        comments: updatedComments
      } : b));

      // Try updating Firestore doc if real
      if (!selectedItemForWish.id.startsWith('b')) {
        const docRef = doc(db, 'birthdays', selectedItemForWish.id);
        await updateDoc(docRef, {
          wishesCount: increment(1),
          comments: updatedComments
        });
      }

      setWishText('');
      setSenderName('');
      setSelectedItemForWish(null);
      alert(t('Your birthday wish has been posted successfully! 🎉', 'तपाईंको जन्मदिनको शुभकामना सफलतापूर्वक पठाउनुभयो! 🎉'));
    } catch (err) {
      console.error('Error posting wish:', err);
    } finally {
      setSendingWish(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-amber-50/50 via-white to-blue-50/30 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Festive Banner Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-700 via-pink-600 to-amber-500 text-white p-8 sm:p-12 shadow-xl mb-10">
          <div className="absolute -right-10 -bottom-10 opacity-20 pointer-events-none">
            <Cake className="w-80 h-80 text-white" />
          </div>
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide uppercase mb-4 border border-white/30">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>{t('Celebrations & Wishes', 'उत्सव तथा शुभ-कामना')}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4 flex items-center gap-3">
              <span>{t('Birthday Corner', 'जन्मदिनको शुभकामना दिने ठाउँ')}</span>
              <PartyPopper className="w-8 h-8 sm:w-12 sm:h-12 text-amber-300 flex-shrink-0 animate-bounce" />
            </h1>
            <p className="text-pink-100 text-sm sm:text-base leading-relaxed mb-6">
              {t(
                'Wishing a very Happy Birthday to our beloved students, teachers, and staff members! Send your warm greetings and blessings.',
                'हाम्रा प्यारा विद्यार्थीहरू, शिक्षकहरू र कर्मचारी साथीहरूलाई जन्मदिनको हार्दिक शुभकामना व्यक्त गर्दछौं!'
              )}
            </p>
            
            {user && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 bg-white text-purple-900 hover:bg-amber-100 font-bold px-5 py-2.5 rounded-xl transition-all shadow-md hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                <span>{t('Add New Birthday Entry in Admin', 'एडमिनबाट जन्मदिन थप्नुहोस्')}</span>
              </Link>
            )}
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('All')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'All'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Cake className="w-4 h-4" />
              <span>{t('All Wishes', 'सबै')}</span>
            </button>
            <button
              onClick={() => setActiveTab('Today')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'Today'
                  ? 'bg-amber-500 text-white shadow-md animate-bounce'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{t("Today's Special 🎉", 'आजका जन्मदिन 🎉')}</span>
            </button>
            <button
              onClick={() => setActiveTab('Student')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'Student'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <User className="w-4 h-4" />
              <span>{t('Students (Boys & Girls)', 'विद्यार्थीहरू')}</span>
            </button>
            <button
              onClick={() => setActiveTab('Teacher/Staff')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'Teacher/Staff'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>{t('Teachers & Staff', 'शिक्षक तथा कर्मचारी')}</span>
            </button>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('Search by name or grade...', 'नाम वा कक्षाबाट खोज्नुहोस्...')}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Birthday Cards Grid */}
        {filteredBirthdays.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-amber-200/80 shadow-md max-w-xl mx-auto relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500"></div>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100/80 rounded-full mb-4 text-3xl shadow-inner animate-bounce">
              🎂
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">
              {t('No Birthdays Today', 'आज कुनै विशेष जन्मदिन छैन')}
            </h3>
            <div className="inline-block bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-black text-sm sm:text-base px-5 py-2.5 rounded-full shadow-lg mb-4 tracking-wide">
              {t("Today's Birthday Corner 🎉", "आजको जन्मदिन विशेष 🎉")}
            </div>
            <p className="text-gray-500 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
              {t(
                'No birthdays registered in the directory for today. Check back tomorrow or add student/teacher birthdays through the Admin Panel!',
                'आज कुनै विद्यार्थी वा शिक्षकको जन्मदिन परेको छैन। एडमिन प्यानलबाट नयाँ जन्ममितिको नामावली थप्न सक्नुहुन्छ!'
              )}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBirthdays.map((item) => {
              const isToday = item.birthdayDate.includes(todayMonthDay) || item.birthdayDate === todayFullStr;

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-3xl overflow-hidden border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between relative group ${
                    isToday ? 'border-amber-400 ring-2 ring-amber-300/50' : 'border-gray-100 shadow-sm'
                  }`}
                >
                  {/* Today Badge Banner */}
                  {isToday && (
                    <div className="bg-gradient-to-r from-amber-500 to-pink-500 text-white text-[11px] font-black uppercase tracking-wider text-center py-1.5 flex items-center justify-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{t('Celebrates Today! 🎂', 'आज जन्मदिन उत्सव! 🎂')}</span>
                    </div>
                  )}

                  <div className="p-6">
                    {/* Top Row: Category Badge & Date */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                        item.category.includes('Boy') ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        item.category.includes('Girl') ? 'bg-pink-100 text-pink-800 border border-pink-200' :
                        item.category === 'Teacher' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        'bg-purple-100 text-purple-800 border border-purple-200'
                      }`}>
                        {item.category}
                      </span>
                      <span className="text-xs font-semibold text-gray-500 flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        <span>{item.birthdayDate}</span>
                      </span>
                    </div>

                    {/* Person Photo & Details */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative">
                        <img
                          src={item.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
                          alt={item.name}
                          className="w-20 h-20 rounded-2xl object-cover shadow-md border-2 border-white ring-2 ring-primary/20 flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).setAttribute('src', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300');
                          }}
                        />
                        {isToday && (
                          <div className="absolute -bottom-2 -right-2 bg-amber-400 text-white p-1 rounded-full shadow">
                            <Cake className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-primary transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-xs font-medium text-gray-500 truncate mt-0.5">
                          {item.gradeOrRole}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-amber-600 font-bold mt-1.5">
                          <Heart className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{item.wishesCount || 0} {t('wishes received', 'शुभकामनाहरू')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Wish Message Quote */}
                    {item.wishMessage && (
                      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-900 italic leading-relaxed mb-4 relative">
                        "{item.wishMessage}"
                      </div>
                    )}

                    {/* Community Comments preview */}
                    {item.comments && item.comments.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 max-h-28 overflow-y-auto">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          {t('Recent Wishes:', 'भर्खरका शुभकामनाहरू:')}
                        </p>
                        {item.comments.slice(0, 2).map((c, idx) => (
                          <div key={idx} className="bg-gray-50 p-2 rounded-xl text-xs">
                            <span className="font-bold text-gray-800">{c.name}: </span>
                            <span className="text-gray-600">{c.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Action Footer */}
                  <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex items-center gap-2">
                    {/* Social Like / Heart Wish Button */}
                    <button
                      onClick={() => handleToggleWish(item)}
                      className={`flex-1 font-bold py-2.5 px-3 rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 border ${
                        wishedIds.includes(item.id)
                          ? 'bg-pink-500 text-white border-pink-500 shadow-md scale-105'
                          : 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100'
                      }`}
                      title={wishedIds.includes(item.id) ? 'Click to undo wish' : 'Click to send 1-click wish!'}
                    >
                      <Heart
                        className={`w-4 h-4 transition-transform ${
                          wishedIds.includes(item.id) ? 'fill-white text-white scale-125 animate-bounce' : 'text-pink-500'
                        }`}
                      />
                      <span>
                        {wishedIds.includes(item.id) ? t('Wished!', 'शुभकामना दिइयो!') : t('Wish', 'शुभकामना')} ({item.wishesCount || 0})
                      </span>
                    </button>

                    {/* Write Comment Wish Button */}
                    <button
                      onClick={() => setSelectedItemForWish(item)}
                      className="bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-3 rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      title="Write a custom birthday message"
                    >
                      <MessageCircle className="w-4 h-4 text-amber-300" />
                      <span className="hidden sm:inline">{t('Comment', 'सन्देश')}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Send Wish Modal */}
        {selectedItemForWish && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-pink-100 text-pink-600 rounded-xl">
                    <PartyPopper className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      {t('Send Birthday Wish to', 'शुभकामना पठाउनुहोस्')}
                    </h3>
                    <p className="text-xs text-primary font-semibold">{selectedItemForWish.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedItemForWish(null)}
                  className="text-gray-400 hover:text-gray-600 text-sm font-bold p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSendWishSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {t('Your Name / नामावली', 'तपाईंको नाम')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="e.g. Principal / Student Ramesh"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {t('Birthday Wish / शुभकामना सन्देश', 'शुभकामना सन्देश')} *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={wishText}
                    onChange={(e) => setWishText(e.target.value)}
                    placeholder="e.g. Wishing you a wonderful birthday filled with joy and success! 🎉🎂"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedItemForWish(null)}
                    className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-xs sm:text-sm transition-colors"
                  >
                    {t('Cancel', 'रद्द गर्नुहोस्')}
                  </button>
                  <button
                    type="submit"
                    disabled={sendingWish}
                    className="w-1/2 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                    <span>{sendingWish ? t('Sending...', 'पठाउँदैछ...') : t('Post Wish', 'पठाउनुहोस्')}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
