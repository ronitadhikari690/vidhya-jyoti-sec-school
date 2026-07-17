/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Academics from './pages/Academics';
import Calendar from './pages/Calendar';
import News from './pages/News';
import Committees from './pages/Committees';
import StaffDirectory from './pages/StaffDirectory';
import TeacherResponsibilities from './pages/TeacherResponsibilities';
import Parents from './pages/Parents';
import Students from './pages/Students';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'academics', element: <Academics /> },
      { path: 'calendar', element: <Calendar /> },
      { path: 'news', element: <News /> },
      { path: 'committees', element: <Committees /> },
      { path: 'staff', element: <StaffDirectory /> },
      { path: 'responsibilities', element: <TeacherResponsibilities /> },
      { path: 'parents', element: <Parents /> },
      { path: 'students', element: <Students /> },
      { path: 'contact', element: <Contact /> },
      { path: 'admin/*', element: <Admin /> },
    ],
  },
]);

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <LanguageProvider>
          <RouterProvider router={router} />
        </LanguageProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
