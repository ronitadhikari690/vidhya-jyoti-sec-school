import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Calendar,
  Trophy,
  Download,
  Plus,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  FileText,
  FolderX,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { InlineEdit } from '../components/InlineEdit';

export interface StudentResource {
  id: string;
  title: string;
  titleNp?: string;
  category: 'syllabus' | 'schedules' | 'activities' | 'general';
  grade?: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: string;
  description?: string;
  createdAt?: any;
}

export default function Students() {
  const { isAdmin } = useAuth();
  const { t, language } = useLanguage();

  const [resources, setResources] = useState<StudentResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('all');

  // Admin Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    titleNp: '',
    category: 'syllabus',
    grade: 'All Classes',
    fileUrl: '',
    fileType: 'PDF',
    description: ''
  });

  // Admin Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const resourcesSectionRef = useRef<HTMLDivElement>(null);

  // Fetch student resources from Firestore
  useEffect(() => {
    async function loadResources() {
      setLoading(true);
      try {
        const q = query(collection(db, 'student_resources'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as StudentResource[];
          setResources(list);
        } else {
          setResources([]);
        }
      } catch (err) {
        // Fallback without ordering in case index is not built yet
        try {
          const snap = await getDocs(collection(db, 'student_resources'));
          const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as StudentResource[];
          setResources(list);
        } catch (innerErr) {
          console.error('Error fetching student resources:', innerErr);
          setResources([]);
        }
      } finally {
        setLoading(false);
      }
    }

    loadResources();
  }, []);

  const handleCategorySelect = (category: string) => {
    setActiveCategory(category);
    setTimeout(() => {
      resourcesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.fileUrl.trim()) return;

    setSubmitting(true);
    try {
      const newDoc = {
        title: formData.title.trim(),
        titleNp: formData.titleNp.trim() || '',
        category: formData.category,
        grade: formData.grade,
        fileUrl: formData.fileUrl.trim(),
        fileType: formData.fileType || 'PDF',
        description: formData.description.trim() || '',
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'student_resources'), newDoc);
      setResources(prev => [{ id: docRef.id, ...newDoc }, ...prev]);
      
      // Reset & close
      setFormData({
        title: '',
        titleNp: '',
        category: 'syllabus',
        grade: 'All Classes',
        fileUrl: '',
        fileType: 'PDF',
        description: ''
      });
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Error adding resource:', err);
      alert('Failed to add resource. Please check your connection or permissions.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!window.confirm(t('Are you sure you want to delete this resource?', 'के तपाईं यो स्रोत हटाउन निश्चित हुनुहुन्छ?'))) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'student_resources', id));
      setResources(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error deleting resource:', err);
      alert('Failed to delete resource. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  // Filter resources
  const filteredResources = resources.filter(res => {
    const matchesCategory = activeCategory === 'all' || res.category === activeCategory;
    const matchesGrade = gradeFilter === 'all' || !res.grade || res.grade === 'All Classes' || res.grade === gradeFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (res.titleNp && res.titleNp.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (res.description && res.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (res.grade && res.grade.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesGrade && matchesSearch;
  });

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'syllabus':
        return {
          label: t('Syllabus & Materials', 'पाठ्यक्रम तथा सामग्री'),
          color: 'bg-blue-50 text-blue-700 border-blue-200'
        };
      case 'schedules':
        return {
          label: t('Class Schedules', 'कक्षा तालिका'),
          color: 'bg-amber-50 text-amber-700 border-amber-200'
        };
      case 'activities':
        return {
          label: t('Extracurriculars', 'अतिरिक्त क्रियाकलाप'),
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        };
      default:
        return {
          label: t('General Resource', 'सामान्य स्रोत'),
          color: 'bg-slate-50 text-slate-700 border-slate-200'
        };
    }
  };

  return (
    <div className="bg-light py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <InlineEdit settingKey="studentsTitle" fallback="Student Hub" />
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            <InlineEdit settingKey="studentsSubtitle" fallback="Resources, schedules, and important information for all current students." as="span" />
          </p>
        </div>

        {/* 3 Main Interactive Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Syllabus & Materials */}
          <div
            onClick={() => handleCategorySelect('syllabus')}
            className={`bg-white rounded-2xl shadow-sm border transition-all cursor-pointer overflow-hidden text-center group hover:shadow-lg ${
              activeCategory === 'syllabus' ? 'ring-2 ring-primary border-primary shadow-md' : 'border-gray-100 hover:border-blue-300'
            }`}
          >
            <div className="bg-blue-50 py-8 flex justify-center group-hover:bg-primary transition-colors">
              <BookOpen className="w-12 h-12 text-primary group-hover:text-white transition-colors" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Syllabus & Materials</h3>
              <p className="text-gray-600 mb-4">Access course outlines and supplementary reading materials.</p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCategorySelect('syllabus');
                }}
                className={`text-primary font-semibold hover:underline px-4 py-2 rounded-xl transition-all ${
                  activeCategory === 'syllabus' ? 'bg-blue-50 font-bold' : ''
                }`}
              >
                View Resources
              </button>
            </div>
          </div>

          {/* Card 2: Class Schedules */}
          <div
            onClick={() => handleCategorySelect('schedules')}
            className={`bg-white rounded-2xl shadow-sm border transition-all cursor-pointer overflow-hidden text-center group hover:shadow-lg ${
              activeCategory === 'schedules' ? 'ring-2 ring-accent border-accent shadow-md' : 'border-gray-100 hover:border-amber-300'
            }`}
          >
            <div className="bg-amber-50 py-8 flex justify-center group-hover:bg-accent transition-colors">
              <Calendar className="w-12 h-12 text-accent group-hover:text-white transition-colors" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Class Schedules</h3>
              <p className="text-gray-600 mb-4">Check your daily class routines and exam timetables.</p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCategorySelect('schedules');
                }}
                className={`text-accent font-semibold hover:underline px-4 py-2 rounded-xl transition-all ${
                  activeCategory === 'schedules' ? 'bg-amber-50 font-bold' : ''
                }`}
              >
                View Schedules
              </button>
            </div>
          </div>

          {/* Card 3: Extracurriculars */}
          <div
            onClick={() => handleCategorySelect('activities')}
            className={`bg-white rounded-2xl shadow-sm border transition-all cursor-pointer overflow-hidden text-center group hover:shadow-lg ${
              activeCategory === 'activities' ? 'ring-2 ring-emerald-500 border-emerald-500 shadow-md' : 'border-gray-100 hover:border-emerald-300'
            }`}
          >
            <div className="bg-emerald-50 py-8 flex justify-center group-hover:bg-emerald-500 transition-colors">
              <Trophy className="w-12 h-12 text-emerald-500 group-hover:text-white transition-colors" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Extracurriculars</h3>
              <p className="text-gray-600 mb-4">Information on sports, clubs, and student activities.</p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCategorySelect('activities');
                }}
                className={`text-emerald-500 font-semibold hover:underline px-4 py-2 rounded-xl transition-all ${
                  activeCategory === 'activities' ? 'bg-emerald-50 font-bold' : ''
                }`}
              >
                Explore Activities
              </button>
            </div>
          </div>

        </div>

        {/* Resources Interactive Section */}
        <div ref={resourcesSectionRef} className="mt-16 pt-8 border-t border-slate-200">
          
          {/* Section Header & Category Filter Tabs */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                <Layers className="w-6 h-6 text-primary" />
                <span>
                  {activeCategory === 'syllabus' && t('Syllabus & Study Materials', 'पाठ्यक्रम तथा अध्ययन सामग्री')}
                  {activeCategory === 'schedules' && t('Class Schedules & Routines', 'कक्षा तथा परीक्षा तालिकाहरू')}
                  {activeCategory === 'activities' && t('Extracurriculars & Clubs', 'अतिरिक्त क्रियाकलाप तथा क्लबहरू')}
                  {activeCategory === 'all' && t('All Student Resources', 'सम्पूर्ण विद्यार्थी स्रोत तथा सामग्रीहरू')}
                </span>
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {activeCategory === 'all'
                  ? t('Browse or search all academic and student support materials.', 'सम्पूर्ण शैक्षिक तथा अतिरिक्त सामग्रीहरू खोजी गर्नुहोस्।')
                  : t('Filtered resources for your selection.', 'तपाईंले छान्नुभएको विधा अनुसारका सामग्रीहरू।')}
              </p>
            </div>

            {/* Admin Add Resource Button */}
            {isAdmin && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-sm hover:shadow transition-all text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('Add Resource', 'नयाँ स्रोत थप्नुहोस्')}</span>
                </button>
              </div>
            )}
          </div>

          {/* Filtering and Search Controls */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Category pills */}
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {[
                { id: 'all', label: t('All', 'सबै') },
                { id: 'syllabus', label: t('Syllabus', 'पाठ्यक्रम') },
                { id: 'schedules', label: t('Schedules', 'तालिका') },
                { id: 'activities', label: t('Extracurriculars', 'क्रियाकलाप') }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeCategory === tab.id
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input & Grade Filter */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-56">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('Search resources...', 'सामग्री खोज्नुहोस्...')}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary font-medium"
              >
                <option value="all">{t('All Grades', 'सबै कक्षाहरू')}</option>
                <option value="All Classes">{t('Common to All', 'सबैलाई लागू')}</option>
                <option value="Primary (1-5)">{t('Primary (Class 1-5)', 'आधारभूत (१-५)')}</option>
                <option value="Lower Secondary (6-8)">{t('Lower Secondary (Class 6-8)', 'निम्न माध्यमिक (६-८)')}</option>
                <option value="Secondary (9-10)">{t('Secondary (Class 9-10)', 'माध्यमिक (९-१०)')}</option>
                <option value="Grade 11-12">{t('Higher Secondary (11-12)', 'उच्च माध्यमिक (११-१२)')}</option>
              </select>
            </div>
          </div>

          {/* Resources Grid or Empty State */}
          {loading ? (
            <div className="py-16 text-center text-gray-400">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium">{t('Loading resources...', 'स्रोतहरू खुल्दैछ...')}</p>
            </div>
          ) : filteredResources.length === 0 ? (
            /* Explicit "No resources found" empty state */
            <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 shadow-sm max-w-xl mx-auto my-6">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FolderX className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {t('No resources found', 'कुनै स्रोत वा सामग्री भेटिएन')}
              </h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed mb-6">
                {searchQuery || gradeFilter !== 'all' || activeCategory !== 'all'
                  ? t('No resources match your active filters or search criteria. Try selecting another category or clearing search.', 'तपाईंले छान्नुभएको विधा वा खोजमा कुनै सामग्री फेला परेन। कृपया अन्य विधा छान्नुहोस्।')
                  : t('No student resources have been added to this section yet. Please check back soon.', 'यस शाखामा हाल कुनै सामग्री थपिएको छैन। कृपया केही समयपछि पुन: हेर्नुहोस्।')}
              </p>

              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-sm transition text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('Add First Resource Now', 'अहिले नयाँ स्रोत थप्नुहोस्')}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('all');
                    setGradeFilter('all');
                    setSearchQuery('');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
                >
                  <span>{t('Reset Filters', 'सबै फिल्टर हटाउनुहोस्')}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((item) => {
                const badge = getCategoryBadge(item.category);
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md border ${badge.color}`}>
                          {badge.label}
                        </span>
                        {item.grade && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {item.grade}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h4 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors mb-2 leading-snug">
                        {language === 'np' && item.titleNp ? item.titleNp : item.title}
                      </h4>

                      {/* Description */}
                      {item.description && (
                        <p className="text-gray-600 text-xs line-clamp-3 leading-relaxed mb-4">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Bottom Action Row */}
                    <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                        {item.fileType || 'DOCUMENT'}
                      </span>

                      <div className="flex items-center gap-2">
                        {/* Open / Download Button */}
                        <a
                          href={item.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-lg text-xs font-bold transition"
                        >
                          <span>{t('Open Resource', 'स्रोत खोल्नुहोस्')}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        {/* Admin Delete Button */}
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDeleteResource(item.id)}
                            disabled={deletingId === item.id}
                            title="Delete Resource"
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

      {/* Admin Add Resource Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {t('Add New Student Resource', 'नयाँ विद्यार्थी स्रोत थप्नुहोस्')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  {t('Resource Title (English)', 'स्रोत शीर्षक (अंग्रेजी)')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Class 10 Science Model Question & Syllabus"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  {t('Resource Title (Nepali - Optional)', 'स्रोत शीर्षक (नेपाली - ऐच्छिक)')}
                </label>
                <input
                  type="text"
                  value={formData.titleNp}
                  onChange={(e) => setFormData({ ...formData, titleNp: e.target.value })}
                  placeholder="उदा. कक्षा १० विज्ञान नमूना प्रश्न तथा पाठ्यक्रम"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    {t('Category', 'विधा')} *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                  >
                    <option value="syllabus">{t('Syllabus & Materials', 'पाठ्यक्रम तथा सामग्री')}</option>
                    <option value="schedules">{t('Class Schedules', 'कक्षा तालिका')}</option>
                    <option value="activities">{t('Extracurriculars', 'अतिरिक्त क्रियाकलाप')}</option>
                    <option value="general">{t('General', 'सामान्य')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    {t('Target Grade / Class', 'कक्षा / तह')}
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                  >
                    <option value="All Classes">All Classes</option>
                    <option value="Primary (1-5)">Primary (Class 1-5)</option>
                    <option value="Lower Secondary (6-8)">Lower Secondary (Class 6-8)</option>
                    <option value="Secondary (9-10)">Secondary (Class 9-10)</option>
                    <option value="Grade 11-12">Higher Secondary (Class 11-12)</option>
                    <option value="Class 10 (SEE)">Class 10 (SEE)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    {t('File / Resource Link (URL)', 'फाइल वा लिंक (URL)')} *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.fileUrl}
                    onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                    placeholder="https://drive.google.com/... or https://..."
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    {t('File Type', 'प्रकार')}
                  </label>
                  <select
                    value={formData.fileType}
                    onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                  >
                    <option value="PDF">PDF</option>
                    <option value="DOC">DOC / Word</option>
                    <option value="SHEET">Excel / Sheet</option>
                    <option value="IMAGE">Image / Photo</option>
                    <option value="LINK">Web Link</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  {t('Description / Instructions', 'विवरण / निर्देशिका')}
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide brief details about what this resource contains..."
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  {t('Cancel', 'रद्द गर्नुहोस्')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-sm transition disabled:opacity-50 text-sm"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{t('Saving...', 'बचत गर्दै...')}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>{t('Publish Resource', 'स्रोत प्रकाशित गर्नुहोस्')}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

