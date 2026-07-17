import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Languages } from 'lucide-react';
import NepaliDate from 'nepali-date-converter';
import { useLanguage } from '../context/LanguageContext';

const NEPALI_MONTHS = [
  'बैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'असोज', 'कात्तिक', 'मसिर', 'पुष', 'माघ', 'फागुन', 'चैत'
];

const NEPALI_MONTHS_EN = [
  'Baishakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin', 'Kartik', 'Mangshir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
];

const NEPALI_DAYS = [
  'आइतबार', 'सोमबार', 'मंगलबार', 'बुधबार', 'बिहीबार', 'शुक्रबार', 'शनिबार'
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
  const [currentDate, setCurrentDate] = useState(new NepaliDate());
  const [days, setDays] = useState<any[]>([]);

  useEffect(() => {
    generateCalendar();
  }, [currentDate]);

  const generateCalendar = () => {
    const year = currentDate.getYear();
    const month = currentDate.getMonth();
    
    // Start of the month
    const firstDayOfMonth = new NepaliDate(year, month, 1);
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0-6 (Sun-Sat)
    
    // Total days in month - we can find this by going to next month and subtracting a day
    // or just incrementing until month changes
    const daysInMonth: any[] = [];
    const tempDate = new NepaliDate(year, month, 1);
    
    while (tempDate.getMonth() === month) {
      daysInMonth.push({
        bsDate: tempDate.getDate(),
        adDate: tempDate.toJsDate().getDate(),
        adMonth: tempDate.toJsDate().toLocaleString('default', { month: 'short' }),
        dayOfWeek: tempDate.getDay(),
        fullDate: new NepaliDate(tempDate.getYear(), tempDate.getMonth(), tempDate.getDate())
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

  const currentYearBS = currentDate.getYear();
  const currentMonthBS = currentDate.getMonth();
  const firstDayBS = new NepaliDate(currentYearBS, currentMonthBS, 1);
  const startEmptySlots = firstDayBS.getDay();

  return (
    <div className="bg-light py-12 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex justify-center items-center gap-3">
            <CalendarIcon className="w-10 h-10 text-primary" />
            <span className="np-text">{t('School Calendar', 'विद्यालय क्यालेन्डर')}</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto np-text">
            {t('Dual calendar showing both Nepali (BS) and English (AD) dates.', 'नेपाली (विक्रम संवत) र अंग्रेजी (AD) दुवै मितिहरू देखाउने क्यालेन्डर।')}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-primary text-white">
            <button 
              onClick={prevMonth}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <div className="text-center">
              <h2 className="text-3xl font-bold np-text">
                {language === 'np' 
                  ? `${NEPALI_MONTHS[currentMonthBS]} ${toNepaliNumber(currentYearBS)}` 
                  : `${NEPALI_MONTHS_EN[currentMonthBS]} ${currentYearBS}`}
              </h2>
              <p className="text-sm text-blue-100 mt-1">
                {language === 'np' 
                  ? `${firstDayBS.toJsDate().toLocaleString('ne-NP', { month: 'long', year: 'numeric' })}` 
                  : `${firstDayBS.toJsDate().toLocaleString('en-US', { month: 'long', year: 'numeric' })}`}
              </p>
            </div>
            <button 
              onClick={nextMonth}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>

          <div className="p-4 sm:p-8">
            <div className="grid grid-cols-7 gap-px sm:gap-2 mb-2">
              {(language === 'np' ? NEPALI_DAYS_SHORT : NEPALI_DAYS_EN).map((day, idx) => (
                <div 
                  key={day} 
                  className={`text-center py-3 text-sm font-bold uppercase tracking-wider rounded-lg ${
                    idx === 0 || idx === 6 ? 'text-red-500 bg-red-50' : 'text-gray-500 bg-gray-50'
                  } np-text`}
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-px sm:gap-2">
              {/* Empty slots for month start */}
              {Array.from({ length: startEmptySlots }).map((_, i) => (
                <div key={`empty-${i}`} className="h-20 sm:h-32 bg-gray-50/50 rounded-xl border border-transparent"></div>
              ))}

              {/* Data slots */}
              {days.map((day, idx) => {
                const isHoliday = day.dayOfWeek === 0 || day.dayOfWeek === 6;
                const isToday = new NepaliDate().format('YYYY-MM-DD') === day.fullDate.format('YYYY-MM-DD');

                return (
                  <div 
                    key={idx} 
                    className={`h-22 sm:h-32 p-1 sm:p-3 rounded-xl border transition-all flex flex-col justify-between items-center sm:items-end ${
                      isToday 
                        ? 'border-primary bg-blue-50 shadow-inner' 
                        : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50 shadow-sm'
                    }`}
                  >
                    <div className={`text-2xl sm:text-4xl font-black ${
                      isHoliday ? 'text-red-600' : 'text-gray-900'
                    } np-text`}>
                      {language === 'np' ? toNepaliNumber(day.bsDate) : day.bsDate}
                    </div>
                    <div className="text-[10px] sm:text-xs font-semibold text-gray-400 border-t pt-1 w-full text-center sm:text-right">
                      {day.adDate} {language === 'np' ? '' : day.adMonth}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
               <div>
                 <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-red-500"></div>
                   <span className="np-text">{t('Week-off Days', 'साप्ताहिक बिदाका दिनहरू')}</span>
                 </h4>
                 <p className="text-sm text-gray-600 np-text">
                   {t('Saturday and Sunday are marked as weekly holidays.', 'शनिबार र आइतबारलाई साप्ताहिक बिदाको रूपमा चिन्ह लगाइएको छ।')}
                 </p>
               </div>
               <div>
                 <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                   <Languages className="w-4 h-4 text-blue-500" />
                   <span className="np-text">{t('Calendar Translation', 'क्यालेन्डर अनुवाद')}</span>
                 </h4>
                 <p className="text-sm text-gray-600 np-text">
                   {t('Use the language switcher in the header to change calendar language.', 'हेडरमा रहेको भाषा स्विच प्रयोग गरी क्यालेन्डरको भाषा परिवर्तन गर्नुहोस्।')}
                 </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
