import { useState, useEffect } from 'react';
import { Bell, ArrowRight } from 'lucide-react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

export default function News() {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotices() {
      try {
        const q = query(collection(db, 'notices'), orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);
        const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setNotices(docs);
      } catch (e) {
        handleFirestoreError(e, OperationType.GET, 'notices');
      } finally {
        setLoading(false);
      }
    }
    loadNotices();
  }, []);

  const categories = ["Academic", "Holiday", "Events", "Committee", "General"];

  if (loading) {
    return (
      <div className="bg-light py-12 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-light py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex justify-center items-center gap-3">
            <Bell className="w-10 h-10 text-primary" />
            News & Notices
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay informed with the latest announcements and updates from Vidhya Jyoti Secondary School.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Main List */}
          <div className="md:col-span-8 space-y-6">
            {notices.length === 0 ? (
               <div className="bg-white rounded-2xl p-8 text-center text-gray-500 shadow-sm border border-gray-100">
                 No notices available at the moment. Please check back later.
               </div>
            ) : (
              notices.map(notice => (
              <div key={notice.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                <div className="flex gap-4">
                  <div className="hidden sm:block">
                    <div className="bg-blue-50 text-primary font-bold text-center p-3 rounded-xl min-w-[80px]">
                      <div className="text-xs uppercase">{new Date(notice.date).toLocaleString('default', { month: 'short' })}</div>
                      <div className="text-2xl">{new Date(notice.date).getDate()}</div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-xs font-semibold uppercase tracking-wider text-accent bg-amber-50 px-2 py-1 rounded-md">
                         {notice.category}
                       </span>
                       <span className="text-sm text-gray-500 sm:hidden">
                         • {new Date(notice.date).toLocaleDateString()}
                       </span>
                    </div>
                    <div className="flex flex-col md:flex-row gap-6">
                      {notice.imageUrl && (
                        <div className="md:w-32 h-32 shrink-0 overflow-hidden rounded-lg mb-3 md:mb-0">
                          <img src={notice.imageUrl} alt={notice.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors np-text">{notice.title}</h3>
                        <p className="text-gray-600 mb-4">{notice.excerpt}</p>
                      </div>
                    </div>
                    <button className="text-primary font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                      Read more <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )))}
            
            {/* Pagination Placeholder */}
            <div className="flex justify-center mt-10">
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                  <span className="sr-only">Previous</span>
                  &larr;
                </button>
                <button className="relative z-10 inline-flex items-center bg-primary px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">1</button>
                <button className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">2</button>
                <button className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">3</button>
                <button className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                  <span className="sr-only">Next</span>
                  &rarr;
                </button>
              </nav>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="md:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Categories</h3>
              <ul className="space-y-3">
                {categories.map(cat => (
                  <li key={cat} className="flex justify-between items-center text-gray-600 hover:text-primary cursor-pointer">
                    <span>{cat}</span>
                    <span className="bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                      {notices.filter(n => n.category === cat).length}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
