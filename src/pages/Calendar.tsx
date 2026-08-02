import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Languages, AlertCircle, Plus, Sparkles, Filter, Bell, Flag, PartyPopper, BookOpen, X, Trash2, CheckCircle2 } from 'lucide-react';
import NepaliDate from 'nepali-date-converter';
import { collection, getDocs, addDoc, doc, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export interface CalendarEvent {
  id: string;
  title: string;
  type: 'Pre-Notice' | 'Holiday' | 'Event' | 'Exam' | 'Academic Term';
  adDate: string; // YYYY-MM-DD
  bsDate?: string; // e.g. "2083-05-15"
  description?: string;
  urgency?: 'Normal' | 'Important' | 'High Alert';
}

const DEFAULT_CALENDAR_EVENTS: CalendarEvent[] = [];

const NEPALI_MONTHS = [
  'बैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'असोज', 'कात्तिक', 'मसिर', 'पुष', 'माघ', 'फागुन', 'चैत'
];

const NEPALI_MONTHS_EN = [
  'Baishakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin', 'Kartik', 'Mangshir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
];

const NEPALI_DAYS_SHORT = [
  'आइत', 'सोम', 'मंगल', 'बुध', 'बिही', 'शुक्र', 'शनि'
];

const NEPALI_DAYS_EN = [
  'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
];

const NEPALI_NUMBERS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

function toNepaliNumber(num: number): string {
  return num.toString().split('').map(digit => NEPALI_NUMBERS[parseInt(digit)] || digit).join('');
}

export default function Calendar() {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new NepaliDate());
  const [days, setDays] = useState<any[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  
  // Filter state
  const [filterType, setFilterType] = useState<'All' | 'Pre-Notice' | 'Holiday' | 'Event' | 'Exam'>('All');
  
  // Quick Add Event Modal (for admin direct calendar insertion)
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'Pre-Notice' | 'Holiday' | 'Event' | 'Exam' | 'Academic Term'>('Pre-Notice');
  const [newAdDate, setNewAdDate] = useState(new Date().toISOString().slice(0, 10));
  const [newDescription, setNewDescription] = useState('');
  const [newUrgency, setNewUrgency] = useState<'Normal' | 'Important' | 'High Alert'>('Important');
  const [submitting, setSubmitting] = useState(false);

  // Selected Day Detail Modal
  const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[] | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const qSnapshot = await getDocs(collection(db, 'calendar_events'));
      const docs = qSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as CalendarEvent));
      setEvents(docs);
    } catch (e) {
      console.error('Error loading calendar events:', e);
    } finally {
      setLoadingEvents(false);
    }
  }

  useEffect(() => {
    generateCalendar();
  }, [currentDate]);

  const generateCalendar = () => {
    const year = currentDate.getYear();
    const month = currentDate.getMonth();
    
    const daysInMonth: any[] = [];
    const tempDate = new NepaliDate(year, month, 1);
    
    while (tempDate.getMonth() === month) {
      const jsDateStr = tempDate.toJsDate().toISOString().slice(0, 10);
      daysInMonth.push({
        bsDate: tempDate.getDate(),
        adDate: tempDate.toJsDate().getDate(),
        adMonth: tempDate.toJsDate().toLocaleString('default', { month: 'short' }),
        adFullDate: jsDateStr,
        dayOfWeek: tempDate.getDay(),
        fullNepaliStr: `${tempDate.getYear()}-${String(tempDate.getMonth() + 1).padStart(2, '0')}-${String(tempDate.getDate()).padStart(2, '0')}`
      });
      tempDate.setDate(tempDate.getDate() + 1);
    }

    setDays(daysInMonth);
  };

  const prevMonth = () => {
    const newDate = new NepaliDate(currentDate.getYear(), currentDate.getMonth(), currentDate.getDate());
    newDate.setMonth(currentDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const nextMonth = () => {
    const newDate = new NepaliDate(currentDate.getYear(), currentDate.getMonth(), currentDate.getDate());
    newDate.setMonth(currentDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const handleCreateCalendarEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAdDate) return;

    setSubmitting(true);
    try {
      const payload: Omit<CalendarEvent, 'id'> = {
        title: newTitle.trim(),
        type: newType,
        adDate: newAdDate,
        description: newDescription.trim(),
        urgency: newUrgency
      };

      const docRef = await addDoc(collection(db, 'calendar_events'), {
        ...payload,
        createdAt: serverTimestamp()
      });

      const addedItem: CalendarEvent = { id: docRef.id, ...payload };
      setEvents(prev => [...prev, addedItem]);

      setNewTitle('');
      setNewDescription('');
      setShowAddModal(false);
      alert(t('Calendar Event / Pre-Notice added directly! 🎉', 'क्यालेन्डर सूचना/प्रि-नोटिस थपियो! 🎉'));
    } catch (err) {
      console.error('Error adding calendar event:', err);
      handleFirestoreError(err, OperationType.WRITE, 'calendar_events');
    } finally {
      setSubmitting(false);
    }
  };

  const currentYearBS = currentDate.getYear();
  const currentMonthBS = currentDate.getMonth();
  const firstDayBS = new NepaliDate(currentYearBS, currentMonthBS, 1);
  const startEmptySlots = firstDayBS.getDay();

  // Active Pre-Notices list
  const preNotices = events.filter(e => e.type === 'Pre-Notice');
  
  // Filtered events
  const filteredEvents = events.filter(e => filterType === 'All' || e.type === filterType);

  return (
    <div className="bg-gradient-to-b from-blue-50/30 via-white to-gray-50 py-8 sm:py-12 min-h-screen">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>{t('Interactive Dual Calendar', 'दोहोरो विक्रम संवत र AD क्यालेन्डर')}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-gray-900 flex items-center gap-3">
              <CalendarIcon className="w-8 h-8 sm:w-10 sm:h-10 text-primary shrink-0" />
              <span>{t('Academic Calendar & Pre-Notices', 'शैक्षिक क्यालेन्डर र पूर्व-सूचना')}</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {t('View upcoming pre-notices, holidays, exams, and extracurricular events directly.', 'आगामी प्रि-नोटिस, बिदा, परीक्षा र कार्यक्रमहरू सीधा हेर्नुहोस्।')}
            </p>
          </div>

          {user && (
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full md:w-auto bg-gradient-to-r from-primary to-blue-700 hover:from-primary-dark hover:to-blue-900 text-white font-extrabold px-5 py-3 rounded-2xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 hover:scale-105"
            >
              <Plus className="w-5 h-5 text-amber-300" />
              <span>{t('+ Put Pre-Notice / Event in Calendar', '+ क्यालेन्डरमा नयाँ पूर्व-सूचना/बिदा थप्नुहोस्')}</span>
            </button>
          )}
        </div>

        {/* Pre-Notices Alert Ticker Box */}
        {preNotices.length > 0 && (
          <div className="mb-8 bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 p-0.5 rounded-3xl shadow-lg">
            <div className="bg-amber-50 rounded-[23px] p-5 sm:p-6">
              <div className="flex items-center gap-2 text-amber-900 font-black text-sm sm:text-base uppercase tracking-wide mb-3">
                <Bell className="w-5 h-5 text-amber-600 animate-bounce" />
                <span>{t('⚡ Upcoming Pre-Notices & Early Alerts', '⚡ आगामी पूर्व-सूचना र अग्रिम अलर्टहरू')}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {preNotices.map((pn) => (
                  <div key={pn.id} className="bg-white p-3.5 rounded-2xl border border-amber-200/80 shadow-sm flex items-start gap-3">
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase shrink-0 mt-0.5">
                      {pn.urgency || 'Alert'}
                    </span>
                    <div className="min-w-0">
                      <h4 className="font-bold text-gray-900 text-xs sm:text-sm leading-snug">{pn.title}</h4>
                      {pn.description && <p className="text-gray-600 text-xs mt-0.5 line-clamp-2">{pn.description}</p>}
                      <span className="text-[11px] font-semibold text-primary block mt-1">📅 Date: {pn.adDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Calendar Category Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 mb-6 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>{t('Filter:', 'फिल्टर:')}</span>
          </span>
          <button
            onClick={() => setFilterType('All')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'All' ? 'bg-primary text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t('All', 'सबै')}
          </button>
          <button
            onClick={() => setFilterType('Pre-Notice')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'Pre-Notice' ? 'bg-amber-500 text-white shadow' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            {t('⚡ Pre-Notices', '⚡ पूर्व-सूचना')}
          </button>
          <button
            onClick={() => setFilterType('Holiday')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'Holiday' ? 'bg-red-500 text-white shadow' : 'bg-red-50 text-red-800 hover:bg-red-100'
            }`}
          >
            {t('🏖️ Holidays', '🏖️ बिदा')}
          </button>
          <button
            onClick={() => setFilterType('Event')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'Event' ? 'bg-emerald-600 text-white shadow' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            {t('🎉 Events & Sports', '🎉 कार्यक्रम र खेलकुद')}
          </button>
          <button
            onClick={() => setFilterType('Exam')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'Exam' ? 'bg-purple-600 text-white shadow' : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
            }`}
          >
            {t('📝 Exams', '📝 परीक्षा')}
          </button>
        </div>

        {/* Main Calendar Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-10">
          
          {/* Top Month Navigation */}
          <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-primary to-blue-800 text-white">
            <button 
              onClick={prevMonth}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors active:scale-95"
              title="Previous Month"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-black tracking-wide">
                {language === 'np' 
                  ? `${NEPALI_MONTHS[currentMonthBS]} ${toNepaliNumber(currentYearBS)}` 
                  : `${NEPALI_MONTHS_EN[currentMonthBS]} ${currentYearBS}`}
              </h2>
              <p className="text-xs sm:text-sm text-blue-200 mt-0.5">
                {language === 'np' 
                  ? `${firstDayBS.toJsDate().toLocaleString('ne-NP', { month: 'long', year: 'numeric' })}` 
                  : `${firstDayBS.toJsDate().toLocaleString('en-US', { month: 'long', year: 'numeric' })}`}
              </p>
            </div>
            <button 
              onClick={nextMonth}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors active:scale-95"
              title="Next Month"
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          </div>

          <div className="p-3 sm:p-6">
            {/* Days Header */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
              {(language === 'np' ? NEPALI_DAYS_SHORT : NEPALI_DAYS_EN).map((day, idx) => (
                <div 
                  key={day} 
                  className={`text-center py-2 text-xs sm:text-sm font-extrabold uppercase tracking-wider rounded-lg ${
                    idx === 0 || idx === 6 ? 'text-red-600 bg-red-50/80' : 'text-gray-600 bg-gray-100/70'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {Array.from({ length: startEmptySlots }).map((_, i) => (
                <div key={`empty-${i}`} className="h-16 sm:h-28 bg-gray-50/40 rounded-xl border border-transparent"></div>
              ))}

              {days.map((day, idx) => {
                const isHolidayDay = day.dayOfWeek === 0 || day.dayOfWeek === 6;
                const isToday = new NepaliDate().format('YYYY-MM-DD') === day.fullNepaliStr;

                // Find matching events for this day
                const dayEvts = filteredEvents.filter(e => e.adDate === day.adFullDate);

                return (
                  <div 
                    key={idx} 
                    onClick={() => dayEvts.length > 0 && setSelectedDayEvents(dayEvts)}
                    className={`h-16 sm:h-28 p-1 sm:p-2 rounded-xl border transition-all flex flex-col justify-between relative cursor-pointer group ${
                      isToday 
                        ? 'border-primary ring-2 ring-primary/30 bg-blue-50/80 shadow-sm' 
                        : isHolidayDay
                        ? 'border-red-100 bg-red-50/30 hover:bg-red-50'
                        : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50/80'
                    }`}
                  >
                    {/* Top Row: BS Date */}
                    <div className="flex items-center justify-between">
                      <span className={`text-sm sm:text-2xl font-black ${
                        isHolidayDay ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {language === 'np' ? toNepaliNumber(day.bsDate) : day.bsDate}
                      </span>

                      {/* Event Dot Indicators */}
                      {dayEvts.length > 0 && (
                        <div className="flex items-center gap-0.5">
                          {dayEvts.slice(0, 2).map((ev, i) => (
                            <span key={i} className={`w-2 h-2 rounded-full ${
                              ev.type === 'Pre-Notice' ? 'bg-amber-500 animate-pulse' :
                              ev.type === 'Holiday' ? 'bg-red-500' :
                              ev.type === 'Exam' ? 'bg-purple-600' : 'bg-emerald-500'
                            }`} />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Event Title Badge snippet */}
                    {dayEvts.length > 0 && (
                      <div className="hidden sm:block my-0.5">
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded truncate block ${
                          dayEvts[0].type === 'Pre-Notice' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                          dayEvts[0].type === 'Holiday' ? 'bg-red-100 text-red-900 border border-red-200' :
                          dayEvts[0].type === 'Exam' ? 'bg-purple-100 text-purple-900' : 'bg-emerald-100 text-emerald-900'
                        }`}>
                          {dayEvts[0].title}
                        </span>
                      </div>
                    )}

                    {/* Bottom Row: AD Date */}
                    <div className="text-[9px] sm:text-xs font-bold text-gray-400 text-right">
                      {day.adDate} {language === 'np' ? '' : day.adMonth}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal: Direct Put Pre-Notice / Calendar Event */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      {t('Add Calendar Event / Pre-Notice', 'क्यालेन्डरमा नयाँ सूचना/प्रि-नोटिस थप्नुहोस्')}
                    </h3>
                    <p className="text-xs text-gray-500">{t('Directly updates the school calendar', 'विद्यालय क्यालेन्डरमा तुरुन्त देखा पर्नेछ')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-sm font-bold p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCalendarEvent} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {t('Notice / Event Title', 'सूचना वा कार्यक्रमको शीर्षक')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Pre-Notice: First Term Exam starts in 10 days!"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {t('Category / Type', 'प्रकार')} *
                    </label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as any)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="Pre-Notice">⚡ Pre-Notice (अग्रिम सूचना)</option>
                      <option value="Holiday">🏖️ Holiday (बिदा)</option>
                      <option value="Event">🎉 Event / Sports (कार्यक्रम)</option>
                      <option value="Exam">📝 Exam (परीक्षा)</option>
                      <option value="Academic Term">📚 Academic Term (सत्र)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {t('Date (AD)', 'मिति')} *
                    </label>
                    <input
                      type="date"
                      required
                      value={newAdDate}
                      onChange={(e) => setNewAdDate(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                {newType === 'Pre-Notice' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {t('Alert Urgency Level', 'सावधानी स्तर')}
                    </label>
                    <select
                      value={newUrgency}
                      onChange={(e) => setNewUrgency(e.target.value as any)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="Normal">Normal Alert</option>
                      <option value="Important">Important Pre-Notice</option>
                      <option value="High Alert">🚨 High Alert Deadline</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {t('Description / Details', 'विवरण')}
                  </label>
                  <textarea
                    rows={3}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Enter additional details regarding this notice or event..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-xs sm:text-sm transition-colors"
                  >
                    {t('Cancel', 'रद्द')}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-1/2 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{submitting ? t('Saving...', 'बचत गर्दैछ...') : t('Publish to Calendar', 'प्रकाशित गर्नुहोस्')}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Selected Day Event Modal */}
        {selectedDayEvents && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900">{t('Calendar Events for Selected Day', 'छनोट गरिएको दिनको सूचनाहरू')}</h3>
                <button onClick={() => setSelectedDayEvents(null)} className="text-gray-400 hover:text-gray-600 font-bold">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {selectedDayEvents.map(e => (
                  <div key={e.id} className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-primary/10 text-primary inline-block mb-1">
                      {e.type}
                    </span>
                    <h4 className="font-bold text-gray-900 text-sm mb-1">{e.title}</h4>
                    {e.description && <p className="text-xs text-gray-600 leading-relaxed">{e.description}</p>}
                    <span className="text-[11px] text-gray-400 block mt-2 font-medium">📅 Date: {e.adDate}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
