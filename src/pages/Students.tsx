import { BookOpen, Calendar, Trophy, Download } from 'lucide-react';
import { InlineEdit } from '../components/InlineEdit';

export default function Students() {
  return (
    <div className="bg-light py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <InlineEdit settingKey="studentsTitle" fallback="Student Hub" />
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            <InlineEdit settingKey="studentsSubtitle" fallback="Resources, schedules, and important information for all current students." as="span" />
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-center group hover:shadow-md transition-all">
            <div className="bg-blue-50 py-8 flex justify-center group-hover:bg-primary transition-colors">
              <BookOpen className="w-12 h-12 text-primary group-hover:text-white transition-colors" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Syllabus & Materials</h3>
              <p className="text-gray-600 mb-4">Access course outlines and supplementary reading materials.</p>
              <button className="text-primary font-semibold hover:underline">View Resources</button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-center group hover:shadow-md transition-all">
            <div className="bg-amber-50 py-8 flex justify-center group-hover:bg-accent transition-colors">
              <Calendar className="w-12 h-12 text-accent group-hover:text-white transition-colors" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Class Schedules</h3>
              <p className="text-gray-600 mb-4">Check your daily class routines and exam timetables.</p>
              <button className="text-accent font-semibold hover:underline">View Schedules</button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-center group hover:shadow-md transition-all">
            <div className="bg-emerald-50 py-8 flex justify-center group-hover:bg-emerald-500 transition-colors">
              <Trophy className="w-12 h-12 text-emerald-500 group-hover:text-white transition-colors" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Extracurriculars</h3>
              <p className="text-gray-600 mb-4">Information on sports, clubs, and student activities.</p>
              <button className="text-emerald-500 font-semibold hover:underline">Explore Activities</button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
