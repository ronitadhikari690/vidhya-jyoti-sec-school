import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      
      if (scrollY > 220) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      if (scrollHeight > 0) {
        const progress = Math.min(100, Math.max(0, (scrollY / scrollHeight) * 100));
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    try {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } catch {
      window.scrollTo(0, 0);
    }
  };

  // Calculate circular SVG progress stroke
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          id="scroll-to-top-button"
          initial={{ opacity: 0, scale: 0.6, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 16 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          onClick={scrollToTop}
          aria-label="Scroll to top of page"
          title="Scroll to top"
          className="fixed bottom-6 right-5 sm:bottom-8 sm:right-8 z-50 w-12 h-12 rounded-full bg-primary/95 hover:bg-primary text-white shadow-xl hover:shadow-2xl active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all flex items-center justify-center group cursor-pointer backdrop-blur-sm"
        >
          {/* Circular Progress Ring */}
          <svg
            className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-0.5"
            viewBox="0 0 48 48"
          >
            <circle
              cx="24"
              cy="24"
              r={radius}
              className="text-white/20"
              strokeWidth="2.5"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="24"
              cy="24"
              r={radius}
              className="text-accent transition-all duration-150"
              strokeWidth="2.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          {/* Icon */}
          <ArrowUp className="w-5 h-5 text-white transition-transform duration-200 group-hover:-translate-y-1 group-active:translate-y-0 relative z-10" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

