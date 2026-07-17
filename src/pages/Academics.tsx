import { BookOpen, Award, CheckCircle2 } from 'lucide-react';
import { InlineEdit } from '../components/InlineEdit';

export default function Academics() {
  return (
    <div className="bg-light py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <InlineEdit settingKey="academicsTitle" fallback="Academics" />
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            <InlineEdit settingKey="academicsSubtitle" fallback="Our comprehensive curriculum is designed to challenge students and foster a lifelong love of learning." as="span" />
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
              <Award className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              <InlineEdit settingKey="academicsBox1Title" fallback="Basic Education" />
            </h2>
            <p className="text-gray-600 mb-4 font-medium">
              <InlineEdit settingKey="academicsBox1Grades" fallback="Grades 1 to 8" />
            </p>
            <p className="text-gray-600 mb-6 line-clamp-3">
              <InlineEdit settingKey="academicsBox1Desc" fallback="Focusing on foundational numeracy, literacy, and social skills in a nurturing environment." as="span" />
            </p>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent" /> <InlineEdit settingKey="academics1" fallback="Nepali & English" /></li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent" /> <InlineEdit settingKey="academics2" fallback="Mathematics & Science" /></li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent" /> <InlineEdit settingKey="academics3" fallback="Social Studies" /></li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 border-t-4 border-t-primary hover:shadow-md transition-shadow transform md:-translate-y-4">
            <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              <InlineEdit settingKey="academicsBox2Title" fallback="Secondary Education" />
            </h2>
            <p className="text-primary mb-4 font-bold">
              <InlineEdit settingKey="academicsBox2Grades" fallback="Grades 9 to 10 (SEE)" />
            </p>
            <p className="text-gray-600 mb-6">
              <InlineEdit settingKey="academicsBox2Desc" fallback="Rigorous preparation for the Secondary Education Examination (SEE) and higher studies." as="span" />
            </p>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> <InlineEdit settingKey="academics4" fallback="Compulsory Subjects" /></li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> <InlineEdit settingKey="academics5" fallback="Optional Mathematics" /></li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> <InlineEdit settingKey="academics6" fallback="Computer Science" /></li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="bg-amber-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
              <Award className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              <InlineEdit settingKey="academicsBox3Title" fallback="Higher Secondary" />
            </h2>
            <p className="text-gray-600 mb-4 font-medium">
              <InlineEdit settingKey="academicsBox3Grades" fallback="Grades 11 & 12" />
            </p>
            <p className="text-gray-600 mb-6">
              <InlineEdit settingKey="academicsBox3Desc" fallback="Specialized streams preparing students for university education and future careers." as="span" />
            </p>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent" /> <InlineEdit settingKey="academics7" fallback="Management Stream" /></li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent" /> <InlineEdit settingKey="academics8" fallback="Education Stream" /></li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent" /> <InlineEdit settingKey="academics9" fallback="Humanities (Planned)" /></li>
            </ul>
          </div>

        </div>

        <div className="bg-primary/5 rounded-3xl p-8 md:p-12 border border-primary/10 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            <InlineEdit settingKey="academicsFrameworkTitle" fallback="Curriculum Framework" />
          </h2>
          <div className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
            <InlineEdit
              settingKey="academicsFrameworkDesc"
              fallback={"We follow the national curriculum prescribed by the Curriculum Development Centre (CDC), Government of Nepal. \nIn addition to the core subjects, we emphasize extracurricular activities, moral education, and practical knowledge\nto ensure holistic development of our students."}
              multiline={true}
              as="p"
              className="whitespace-pre-line"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
