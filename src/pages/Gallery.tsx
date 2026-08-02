import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Film, Play, Sparkles, Search, X, Plus, Calendar, ChevronRight, ZoomIn, ZoomOut, RotateCcw, Move } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  category: 'Annual Function' | 'Sports Week' | 'Friday ECA' | 'Science Exhibition' | 'General';
  mediaType: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  eventDate?: string;
}

export default function Gallery() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'All' | 'Annual Function' | 'Sports Week' | 'Friday ECA' | 'Science Exhibition' | 'Videos'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Lightbox Modal state
  const [selectedMedia, setSelectedMedia] = useState<GalleryItem | null>(null);

  // Zoom and Pan states for image lightbox
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [panPosition, setPanPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    async function loadGallery() {
      try {
        const querySnapshot = await getDocs(collection(db, 'gallery'));
        const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryItem));
        setItems(docs);
      } catch (err) {
        console.error("Error fetching gallery:", err);
      } finally {
        setLoading(false);
      }
    }
    loadGallery();
  }, []);

  // Reset zoom & pan whenever selected media changes
  useEffect(() => {
    setZoomScale(1);
    setPanPosition({ x: 0, y: 0 });
    setIsDragging(false);
  }, [selectedMedia]);

  // Zoom handlers
  const handleZoomIn = () => {
    setZoomScale(prev => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setZoomScale(prev => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPanPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomScale(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const handleToggleZoom = () => {
    if (zoomScale > 1) {
      handleResetZoom();
    } else {
      setZoomScale(2.5);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (selectedMedia?.mediaType !== 'image') return;
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoomScale(prev => Math.min(prev + 0.25, 4));
    } else {
      setZoomScale(prev => {
        const next = Math.max(prev - 0.25, 1);
        if (next === 1) setPanPosition({ x: 0, y: 0 });
        return next;
      });
    }
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomScale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomScale <= 1) return;
    setPanPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && zoomScale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - panPosition.x,
        y: e.touches[0].clientY - panPosition.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1 && zoomScale > 1) {
      setPanPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;

    if (activeTab === 'Videos') {
      return item.mediaType === 'video';
    }
    if (activeTab !== 'All') {
      return item.category === activeTab;
    }
    return true;
  });

  return (
    <div className="bg-gradient-to-b from-blue-50/40 via-white to-gray-50 min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-primary via-blue-800 to-indigo-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl mb-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none p-4">
            <ImageIcon className="w-96 h-96 text-white" />
          </div>
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{t('School Life & Media Gallery', 'विद्यालय जीवन र सञ्चार ग्यालरी')}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight mb-3">
              {t('Photo & Video Gallery', 'फोटो तथा भिडियो ग्यालरी')}
            </h1>
            <p className="text-blue-100 text-xs sm:text-base leading-relaxed mb-5">
              {t(
                'View authentic event photos, ECA achievements, and videos uploaded directly from our school admin panel. Click any photo to zoom and move it around!',
                'हाम्रो विद्यालयको वास्तविक फोटो र भिडियोहरू हेर्नुहोस्। जुम गर्न र सार्न कुनै पनि तस्बिरमा क्लिक गर्नुहोस्!'
              )}
            </p>
            {user && (
              <Link
                to="/admin/gallery"
                className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-gray-900 font-extrabold px-4 py-2 rounded-xl text-xs sm:text-sm transition-all shadow-md hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>{t('Manage & Add Gallery Items in Admin', 'एडमिनबाट ग्यालरी व्यवस्थापन गर्नुहोस्')}</span>
              </Link>
            )}
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-5 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setActiveTab('All')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'All' ? 'bg-primary text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t('All Media', 'सबै')}
            </button>
            <button
              onClick={() => setActiveTab('Annual Function')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'Annual Function' ? 'bg-purple-600 text-white shadow-sm' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
              }`}
            >
              {t('Annual Functions', 'वार्षिक उत्सव')}
            </button>
            <button
              onClick={() => setActiveTab('Sports Week')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'Sports Week' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              {t('Sports Week', 'खेलकुद सप्ताह')}
            </button>
            <button
              onClick={() => setActiveTab('Friday ECA')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'Friday ECA' ? 'bg-amber-600 text-white shadow-sm' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              {t('Friday ECA', 'शुक्रबारीय ECA')}
            </button>
            <button
              onClick={() => setActiveTab('Science Exhibition')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'Science Exhibition' ? 'bg-blue-600 text-white shadow-sm' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              {t('Science Exhibition', 'विज्ञान प्रदर्शनी')}
            </button>
            <button
              onClick={() => setActiveTab('Videos')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'Videos' ? 'bg-red-600 text-white shadow-sm' : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>{t('Videos 🎥', 'भिडियोहरू 🎥')}</span>
            </button>
          </div>

          <div className="relative w-full md:w-60 shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('Search gallery...', 'खोज्नुहोस्...')}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-500 text-sm font-medium">Loading gallery items...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-md mx-auto">
            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base sm:text-lg font-black text-gray-800 mb-1">
              You are viewing Mbappe special
            </h3>
            <p className="text-gray-500 text-xs">
              {t('No photos or videos match your selection. You can upload custom media anytime in the Admin Panel.', 'कुनै तस्बिर वा भिडियो भेटिएन। एडमिन प्यानलबाट थप्न सकिन्छ।')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedMedia(item)}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col justify-between"
              >
                {/* Thumbnail / Video Preview */}
                <div className="relative aspect-video bg-gray-900 overflow-hidden">
                  <img
                    src={item.thumbnailUrl || item.url}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLElement).setAttribute('src', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800');
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                  
                  {/* Category Tag */}
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-gray-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                    {item.category}
                  </span>

                  {/* Zoom Hint Icon for Photos */}
                  {item.mediaType === 'image' && (
                    <div className="absolute top-3 right-3 bg-black/60 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] font-bold">
                      <ZoomIn className="w-3.5 h-3.5" />
                      <span>Zoom & Move</span>
                    </div>
                  )}

                  {/* Video Icon Play Badge */}
                  {item.mediaType === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-red-600/90 text-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 fill-white ml-0.5" />
                      </div>
                    </div>
                  )}

                  {/* Date badge */}
                  {item.eventDate && (
                    <span className="absolute bottom-3 right-3 text-white/90 text-[11px] font-semibold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{item.eventDate}</span>
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-snug group-hover:text-primary transition-colors line-clamp-2 mb-1.5">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-primary">
                    <span>
                      {item.mediaType === 'video' 
                        ? t('Watch Video', 'भिडियो हेर्नुहोस्') 
                        : t('Click to Open & Zoom', 'जुम तथा सार्न क्लिक गर्नुहोस्')}
                    </span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lightbox Modal with Zoom & Pan Move Controls */}
        {selectedMedia && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-6 select-none animate-in fade-in duration-200">
            <div className="relative bg-gray-950 text-white rounded-3xl max-w-5xl w-full h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-gray-800">
              
              {/* Top Modal Navigation Header */}
              <div className="p-4 bg-gray-900/90 border-b border-gray-800 flex items-center justify-between shrink-0 z-20">
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span className="bg-primary/30 text-blue-300 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
                    {selectedMedia.category}
                  </span>
                  <h3 className="text-xs sm:text-base font-bold text-white truncate">{selectedMedia.title}</h3>
                </div>

                {/* Lightbox Controls Toolbar */}
                <div className="flex items-center gap-2 shrink-0">
                  {selectedMedia.mediaType === 'image' && (
                    <div className="flex items-center gap-1 bg-gray-800 p-1 rounded-xl border border-gray-700">
                      <button
                        onClick={handleZoomOut}
                        disabled={zoomScale <= 1}
                        className="p-1.5 hover:bg-gray-700 text-gray-200 disabled:opacity-30 rounded-lg transition-colors"
                        title="Zoom Out (-)"
                      >
                        <ZoomOut className="w-4 h-4" />
                      </button>
                      
                      <span className="text-[11px] font-bold px-2 text-amber-300 min-w-[42px] text-center">
                        {Math.round(zoomScale * 100)}%
                      </span>

                      <button
                        onClick={handleZoomIn}
                        disabled={zoomScale >= 4}
                        className="p-1.5 hover:bg-gray-700 text-gray-200 disabled:opacity-30 rounded-lg transition-colors"
                        title="Zoom In (+)"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>

                      <button
                        onClick={handleResetZoom}
                        disabled={zoomScale === 1 && panPosition.x === 0 && panPosition.y === 0}
                        className="p-1.5 hover:bg-gray-700 text-gray-200 disabled:opacity-30 rounded-lg transition-colors border-l border-gray-700"
                        title="Reset Zoom & Move"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedMedia(null)}
                    className="bg-gray-800 hover:bg-red-600 text-white p-2 rounded-xl transition-colors ml-1"
                    title="Close Modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Main Media Canvas Area */}
              <div
                className="flex-1 bg-black relative overflow-hidden flex items-center justify-center p-2 cursor-grab active:cursor-grabbing"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {selectedMedia.mediaType === 'video' ? (
                  selectedMedia.url.includes('youtube') || selectedMedia.url.includes('embed') ? (
                    <iframe
                      src={selectedMedia.url}
                      title={selectedMedia.title}
                      className="w-full h-full rounded-2xl max-h-[75vh]"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <video controls autoPlay className="w-full max-h-[75vh] rounded-2xl">
                      <source src={selectedMedia.url} />
                      Your browser does not support video playback.
                    </video>
                  )
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                    <img
                      src={selectedMedia.url}
                      alt={selectedMedia.title}
                      onDoubleClick={handleToggleZoom}
                      style={{
                        transform: `scale(${zoomScale}) translate(${panPosition.x / zoomScale}px, ${panPosition.y / zoomScale}px)`,
                        transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                        maxHeight: '75vh',
                        maxWidth: '95%',
                        objectFit: 'contain'
                      }}
                      className="rounded-xl shadow-2xl pointer-events-auto"
                      draggable={false}
                    />

                    {/* Interactive Zoom/Pan Hint Overlay */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md px-4 py-1.5 rounded-full text-[11px] text-gray-300 font-medium flex items-center gap-2 pointer-events-none border border-white/10 shadow-lg">
                      <Move className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        {zoomScale > 1 ? 'Drag to move photo | Scroll to zoom' : 'Click +, Scroll wheel, or Double-click to Zoom & Move'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Details Footer */}
              <div className="p-4 bg-gray-900 border-t border-gray-800 shrink-0">
                {selectedMedia.description && (
                  <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-1">{selectedMedia.description}</p>
                )}
                {selectedMedia.eventDate && (
                  <span className="text-gray-500 text-xs flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Date: {selectedMedia.eventDate}</span>
                  </span>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

