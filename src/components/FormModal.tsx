import { useState, useRef } from 'react';
import { X, Printer, Download, ArrowRight, Check, Sparkles, FileText, User, FileCheck, HelpCircle, Mail } from 'lucide-react';
import { motion } from 'motion/react';

interface FormModalProps {
  formType: 'leave' | 'admission' | 'scholarship' | null;
  onClose: () => void;
}

export default function FormModal({ formType, onClose }: FormModalProps) {
  if (!formType) return null;

  // Form State: Leave Application
  const [leaveData, setLeaveData] = useState({
    studentName: 'Aayush Adhikari',
    studentClass: 'Class 10',
    rollNo: '14',
    guardianName: 'Ram Bahadur Adhikari',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    reason: 'Sickness',
    additionalInfo: 'I have had a high fever since yesterday. The doctor advised me to rest for two days.',
  });

  // Form State: Admission Form
  const [admissionData, setAdmissionData] = useState({
    academicYear: '2083 B.S.',
    appliedClass: 'Class 9',
    studentName: 'Subash Thapa',
    studentNameNepali: 'सुवास थापा',
    dob: '2071-04-12',
    gender: 'Male',
    fatherName: 'Hari Bahadur Thapa',
    motherName: 'Sita Devi Thapa',
    contactNo: '9841XXXXXX',
    address: 'Beshisahar, Lamjung, Nepal',
    prevSchool: 'Lamjung Bright Future School',
    prevGrade: '3.65 GPA',
  });

  // Form State: Scholarship Application
  const [scholarshipData, setScholarshipData] = useState({
    studentName: 'Pooja Shrestha',
    studentClass: 'Class 11',
    rollNo: '05',
    guardianName: 'Gopal Shrestha',
    guardianOccupation: 'Agriculture / Farmer',
    annualIncome: '1,20,000',
    scholarshipCategory: 'Financial Need',
    prevGPA: '3.80 GPA',
    reason: 'My father is the sole breadwinner of our family of 6, and his agricultural income is barely enough to cover food and basic necessities. I wish to pursue higher education and relieve the financial burden with this scholarship.',
  });

  const [formSubmitted, setFormSubmitted] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    let emailSubject = '';
    let emailBody = '';
    const schoolEmail = 'vidhyajyotilamjung@gmail.com';

    if (formType === 'leave') {
      const duration = Math.max(1, Math.ceil((new Date(leaveData.endDate).getTime() - new Date(leaveData.startDate).getTime()) / 86400000) + 1);
      emailSubject = `Leave Application Form - ${leaveData.studentName} (${leaveData.studentClass})`;
      emailBody = `To,\nThe Principal,\nVidhya Jyoti Secondary School\nKhahare, Lamjung, Nepal\n\nSubject: Application for Leave (बिदाको लागि निवेदन)\n\nRespected Principal,\n\nI am writing to formally request leave of absence from classes for my ward, ${leaveData.studentName}, who is currently studying in ${leaveData.studentClass}, Roll Number ${leaveData.rollNo}.\n\nThe leave is requested for a period of ${duration} day(s), starting from ${leaveData.startDate} to ${leaveData.endDate} due to ${leaveData.reason.toLowerCase()}.\n\nDetailed Reason:\n"${leaveData.additionalInfo || 'N/A'}"\n\nI assure you that the student will take immediate steps to catch up with all classwork and lectures missed during this period. I request you to kindly grant approval for the leave.\n\nThank you for your consideration.\n\nSincerely,\nGuardian: ${leaveData.guardianName || '_______________________'}\nDate: ${new Date().toLocaleDateString()}`;
    } else if (formType === 'admission') {
      emailSubject = `New Student Admission Form - ${admissionData.studentName} (${admissionData.appliedClass})`;
      emailBody = `STUDENT ADMISSION REQUEST (भर्ना आवेदन फारम)\n=========================================\nAcademic Session: ${admissionData.academicYear}\nApplied for Class: ${admissionData.appliedClass}\n\n1. STUDENT DETAILS (विद्यार्थीको विवरण)\n-----------------------------------------\nFull Name (English): ${admissionData.studentName}\nFull Name (Nepali): ${admissionData.studentNameNepali}\nDate of Birth: ${admissionData.dob}\nGender: ${admissionData.gender}\nPermanent Address: ${admissionData.address}\n\n2. FAMILY DETAILS (पारिवारिक विवरण)\n-----------------------------------------\nFather's Name: ${admissionData.fatherName}\nMother's Name: ${admissionData.motherName}\nContact Phone: ${admissionData.contactNo}\n\n3. ACADEMIC HISTORY (शैक्षिक इतिहास)\n-----------------------------------------\nPrevious School Name: ${admissionData.prevSchool}\nMarks Secured / Grade: ${admissionData.prevGrade}\n\nDeclaration:\nWe hereby declare that all the details provided in this admission form are true, correct, and complete to the best of our knowledge. We agree to abide by all the rules, disciplines, and academic standards set forth by Vidhya Jyoti Secondary School.\n\nSubmitted by:\nStudent and Parent/Guardian\nDate: ${new Date().toLocaleDateString()}`;
    } else if (formType === 'scholarship') {
      emailSubject = `Scholarship & Fee Waiver Application - ${scholarshipData.studentName} (${scholarshipData.studentClass})`;
      emailBody = `SCHOLARSHIP & FEE WAIVER APPLICATION\n=========================================\nRequest Category: ${scholarshipData.scholarshipCategory}\n\n1. STUDENT PARTICULARS\n-----------------------------------------\nStudent Name: ${scholarshipData.studentName}\nClass: ${scholarshipData.studentClass}\nRoll Number: ${scholarshipData.rollNo}\n\n2. SOCIO-ECONOMIC INFORMATION\n-----------------------------------------\nGuardian Name: ${scholarshipData.guardianName}\nOccupation: ${scholarshipData.guardianOccupation}\nAnnual Income (NPR): Rs. ${scholarshipData.annualIncome}\n\n3. ACADEMIC PERFORMANCE\n-----------------------------------------\nPrevious GPA/Grade: ${scholarshipData.prevGPA}\n\n4. STATEMENT OF NEED / JUSTIFICATION\n-----------------------------------------\n"${scholarshipData.reason}"\n\nSubmitted by:\nApplicant and Parent/Guardian\nDate: ${new Date().toLocaleDateString()}`;
    }

    const mailtoUrl = `mailto:${schoolEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoUrl;
  };

  const getFormTitle = () => {
    switch (formType) {
      case 'leave':
        return 'Leave Application Form Template';
      case 'admission':
        return 'Student Admission Form Template';
      case 'scholarship':
        return 'Scholarship Application Form Template';
      default:
        return 'Form Template';
    }
  };

  const getNepaliFormTitle = () => {
    switch (formType) {
      case 'leave':
        return 'बिदाको लागि आवेदन फारम';
      case 'admission':
        return 'विद्यार्थी भर्ना आवेदन फारम';
      case 'scholarship':
        return 'छात्रवृत्ति आवेदन फारम';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto no-print">
      {/* Universal CSS to hide everything else during print and clean styling for the document */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          /* Hide all page elements except the printable area */
          div#root, nav, footer, .no-print {
            display: none !important;
          }
          /* Format printable content */
          .print-content {
            display: block !important;
            position: absolute !important;
            left: 0;
            top: 0;
            width: 100% !important;
            padding: 2rem !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
          }
          /* Standard letter margins for neat print output */
          @page {
            size: A4 portrait;
            margin: 1.5cm;
          }
        }
      `}</style>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white w-full max-w-6xl h-[90vh] md:h-[85vh] rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden no-print"
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{getFormTitle()}</h2>
              <p className="text-xs text-gray-500 font-medium">{getNepaliFormTitle()}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Workspace (Two Columns: Inputs & Live Preview) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Column: Interactive Fields (Inputs) */}
          <div className="w-full md:w-5/12 border-r border-gray-100 p-6 overflow-y-auto bg-gray-50/50">
            <div className="mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-primary mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Interactive Form Filler
              </span>
              <h3 className="text-lg font-bold text-gray-900">Enter Student Information</h3>
              <p className="text-xs text-gray-500">Fill in the fields below. The document preview on the right will update in real-time.</p>
            </div>

            {/* Form Type 1: Leave Form Inputs */}
            {formType === 'leave' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Student Name</label>
                  <input 
                    type="text" 
                    value={leaveData.studentName}
                    onChange={(e) => setLeaveData({ ...leaveData, studentName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-gray-800"
                    placeholder="Enter full name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Class</label>
                    <input 
                      type="text" 
                      value={leaveData.studentClass}
                      onChange={(e) => setLeaveData({ ...leaveData, studentClass: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-gray-800"
                      placeholder="e.g. Class 10"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Roll Number</label>
                    <input 
                      type="text" 
                      value={leaveData.rollNo}
                      onChange={(e) => setLeaveData({ ...leaveData, rollNo: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-gray-800"
                      placeholder="e.g. 14"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Parent/Guardian Name</label>
                  <input 
                    type="text" 
                    value={leaveData.guardianName}
                    onChange={(e) => setLeaveData({ ...leaveData, guardianName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-gray-800"
                    placeholder="Guardian full name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Leave From Date</label>
                    <input 
                      type="date" 
                      value={leaveData.startDate}
                      onChange={(e) => setLeaveData({ ...leaveData, startDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Leave To Date</label>
                    <input 
                      type="date" 
                      value={leaveData.endDate}
                      onChange={(e) => setLeaveData({ ...leaveData, endDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-gray-800"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Reason for Leave</label>
                  <select 
                    value={leaveData.reason}
                    onChange={(e) => setLeaveData({ ...leaveData, reason: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-gray-800"
                  >
                    <option value="Sickness">Medical/Sickness (बिरामी बिदा)</option>
                    <option value="Family Function">Family Event/Function (पारिवारिक कार्य)</option>
                    <option value="Urgent Personal Work">Urgent Personal Work (घरायसी जरुरी काम)</option>
                    <option value="Festival">Festival Celebration (चाडपर्व)</option>
                    <option value="Other">Other (अन्य कारण)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Application Body Details</label>
                  <textarea 
                    value={leaveData.additionalInfo}
                    onChange={(e) => setLeaveData({ ...leaveData, additionalInfo: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-gray-800 resize-none"
                    placeholder="State full details for the record..."
                  />
                </div>
              </div>
            )}

            {/* Form Type 2: Admission Form Inputs */}
            {formType === 'admission' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Academic Year</label>
                    <input 
                      type="text" 
                      value={admissionData.academicYear}
                      onChange={(e) => setAdmissionData({ ...admissionData, academicYear: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-gray-800"
                      placeholder="e.g. 2083 B.S."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Class Applied For</label>
                    <input 
                      type="text" 
                      value={admissionData.appliedClass}
                      onChange={(e) => setAdmissionData({ ...admissionData, appliedClass: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-gray-800"
                      placeholder="e.g. Class 9"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Full Name (English)</label>
                  <input 
                    type="text" 
                    value={admissionData.studentName}
                    onChange={(e) => setAdmissionData({ ...admissionData, studentName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-gray-800"
                    placeholder="Full Name in English"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Full Name (नेपालीमा)</label>
                  <input 
                    type="text" 
                    value={admissionData.studentNameNepali}
                    onChange={(e) => setAdmissionData({ ...admissionData, studentNameNepali: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-gray-800"
                    placeholder="नेपालीमा पूरा नाम"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Date of Birth</label>
                    <input 
                      type="date" 
                      value={admissionData.dob}
                      onChange={(e) => setAdmissionData({ ...admissionData, dob: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Gender</label>
                    <select 
                      value={admissionData.gender}
                      onChange={(e) => setAdmissionData({ ...admissionData, gender: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-gray-800"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Father's Name</label>
                    <input 
                      type="text" 
                      value={admissionData.fatherName}
                      onChange={(e) => setAdmissionData({ ...admissionData, fatherName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Mother's Name</label>
                    <input 
                      type="text" 
                      value={admissionData.motherName}
                      onChange={(e) => setAdmissionData({ ...admissionData, motherName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-gray-800"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Contact Phone</label>
                    <input 
                      type="text" 
                      value={admissionData.contactNo}
                      onChange={(e) => setAdmissionData({ ...admissionData, contactNo: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Permanent Address</label>
                    <input 
                      type="text" 
                      value={admissionData.address}
                      onChange={(e) => setAdmissionData({ ...admissionData, address: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-gray-800"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Previous School</label>
                    <input 
                      type="text" 
                      value={admissionData.prevSchool}
                      onChange={(e) => setAdmissionData({ ...admissionData, prevSchool: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Previous Grade / Marks</label>
                    <input 
                      type="text" 
                      value={admissionData.prevGrade}
                      onChange={(e) => setAdmissionData({ ...admissionData, prevGrade: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-gray-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Form Type 3: Scholarship Form Inputs */}
            {formType === 'scholarship' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Student Full Name</label>
                  <input 
                    type="text" 
                    value={scholarshipData.studentName}
                    onChange={(e) => setScholarshipData({ ...scholarshipData, studentName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-gray-800"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Class</label>
                    <input 
                      type="text" 
                      value={scholarshipData.studentClass}
                      onChange={(e) => setScholarshipData({ ...scholarshipData, studentClass: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Roll No</label>
                    <input 
                      type="text" 
                      value={scholarshipData.rollNo}
                      onChange={(e) => setScholarshipData({ ...scholarshipData, rollNo: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-gray-800"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Guardian Name</label>
                    <input 
                      type="text" 
                      value={scholarshipData.guardianName}
                      onChange={(e) => setScholarshipData({ ...scholarshipData, guardianName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Guardian Occupation</label>
                    <input 
                      type="text" 
                      value={scholarshipData.guardianOccupation}
                      onChange={(e) => setScholarshipData({ ...scholarshipData, guardianOccupation: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-gray-800"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Family Annual Income (NPR)</label>
                    <input 
                      type="text" 
                      value={scholarshipData.annualIncome}
                      onChange={(e) => setScholarshipData({ ...scholarshipData, annualIncome: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Previous GPA / Percentage</label>
                    <input 
                      type="text" 
                      value={scholarshipData.prevGPA}
                      onChange={(e) => setScholarshipData({ ...scholarshipData, prevGPA: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-gray-800"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Scholarship Category</label>
                  <select 
                    value={scholarshipData.scholarshipCategory}
                    onChange={(e) => setScholarshipData({ ...scholarshipData, scholarshipCategory: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-gray-800"
                  >
                    <option value="Financial Need">Jehendar / Intelligent (जेहेन्दार तथा आर्थिक विपन्न)</option>
                    <option value="Dalit / Indigenous">Dalit / Janajati (दलित तथा उत्पीडित वर्ग)</option>
                    <option value="Differently-Abled">Differently-Abled (अपाङ्गता छात्रवृत्ति)</option>
                    <option value="Merit Academic">Merit Scholar (उत्कृष्ट शैक्षिक नतिजा)</option>
                    <option value="Martyr Family">Conflict Affected / Martyr Family (शहीद तथा बेपत्ता परिवार)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Justification / Statement of Need</label>
                  <textarea 
                    value={scholarshipData.reason}
                    onChange={(e) => setScholarshipData({ ...scholarshipData, reason: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-gray-800 resize-none"
                    placeholder="Describe family financial conditions or achievements..."
                  />
                </div>
              </div>
            )}

            {/* Submission State Actions */}
            <div className="mt-8 pt-4 border-t border-gray-100 space-y-3">
              <button
                onClick={handleEmail}
                className="w-full bg-primary text-white text-sm font-extrabold py-3 px-4 rounded-xl shadow-md hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mail className="w-4 h-4" /> Email Form Directly to School
              </button>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setFormSubmitted(true);
                    setTimeout(() => setFormSubmitted(false), 4000);
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-bold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {formSubmitted ? (
                    <>
                      <Check className="w-4 h-4" /> Form Saved Offline!
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4" /> Save Copy Offline
                    </>
                  )}
                </button>
                <button
                  onClick={handlePrint}
                  className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <Printer className="w-4 h-4" /> Print Document
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: High-Fidelity Printable Document Live Preview */}
          <div className="w-full md:w-7/12 p-6 overflow-y-auto flex justify-center bg-gray-200/50">
            
            {/* The printable boundary sheet layout */}
            <div 
              id="printable-form-area"
              className="print-content bg-white w-full max-w-[210mm] min-h-[297mm] shadow-lg border border-gray-300 p-8 sm:p-12 relative flex flex-col font-sans text-gray-900 text-sm leading-relaxed"
            >
              
              {/* Document Letterhead */}
              <div className="flex flex-col items-center text-center border-b-2 border-primary pb-5 mb-8">
                {/* Official Crest / Logo Placeholder */}
                <div className="w-16 h-16 rounded-full border-2 border-primary flex items-center justify-center text-primary font-bold text-lg mb-3 bg-blue-50/50">
                  VJSS
                </div>
                <h1 className="text-2xl font-black text-gray-950 uppercase tracking-wide">
                  Vidhya Jyoti Secondary School
                </h1>
                <p className="text-sm font-bold text-primary mt-0.5">
                  विद्या ज्योति माध्यमिक विद्यालय
                </p>
                <p className="text-xs text-gray-600 font-medium mt-1">
                  Khahare, Lamjung, Gandaki Province, Nepal | Estd: 2046
                </p>
                <p className="text-[10px] text-gray-500 font-mono tracking-wider">
                  Contact: +977 | Email: vidhyajyotilamjung@gmail.com
                </p>
              </div>

              {/* Document Watermark Accent */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none z-0">
                <div className="text-9xl font-black tracking-widest text-primary border-4 border-primary p-8 rounded-full">
                  VJSS
                </div>
              </div>

              {/* Main Document Content Area */}
              <div className="relative z-10 flex-1 flex flex-col">
                
                {/* 1. Leave Application Document Template */}
                {formType === 'leave' && (
                  <div className="space-y-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-800">Ref No: VJSS/LEAVE/2083</span>
                      <span className="font-semibold text-gray-800">Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>

                    <div className="space-y-1">
                      <p className="font-bold">To,</p>
                      <p className="font-bold pl-4">The Principal,</p>
                      <p className="pl-4">Vidhya Jyoti Secondary School</p>
                      <p className="pl-4 text-gray-600">Khahare, Lamjung, Nepal</p>
                    </div>

                    <div className="text-center my-4">
                      <p className="inline-block border-b border-black pb-1 uppercase tracking-wider font-extrabold text-sm text-gray-950">
                        Subject: Application for Leave (बिदाको लागि निवेदन)
                      </p>
                    </div>

                    <p className="leading-relaxed">
                      Respected Principal,
                    </p>

                    <p className="leading-relaxed text-justify">
                      I am writing to formally request leave of absence from classes for my ward, 
                      <strong className="mx-1 border-b border-dotted border-gray-700 px-2 text-gray-950">{leaveData.studentName}</strong> 
                      who is currently studying in <strong>{leaveData.studentClass}</strong>, Roll Number 
                      <strong className="mx-1 border-b border-dotted border-gray-700 px-2 text-gray-950">{leaveData.rollNo}</strong>.
                    </p>

                    <p className="leading-relaxed text-justify">
                      The leave is requested for a period of <strong className="border-b border-dotted border-gray-700 px-2 text-gray-950">
                        {Math.max(1, Math.ceil((new Date(leaveData.endDate).getTime() - new Date(leaveData.startDate).getTime()) / 86400000) + 1)}
                      </strong> day(s), starting from <strong>{leaveData.startDate}</strong> to <strong>{leaveData.endDate}</strong> due to 
                      <strong className="mx-1 border-b border-dotted border-gray-700 px-2 text-gray-950 lowercase">{leaveData.reason}</strong>.
                    </p>

                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 italic">
                      <strong className="block text-gray-900 not-italic font-bold mb-1">Detailed Reason:</strong>
                      "{leaveData.additionalInfo || 'N/A'}"
                    </div>

                    <p className="leading-relaxed text-justify">
                      I assure you that the student will take immediate steps to catch up with all classwork and lectures missed during this period. I request you to kindly grant approval for the leave.
                    </p>

                    <p className="leading-relaxed mt-4">
                      Thank you for your consideration.
                    </p>

                    <div className="mt-12 flex justify-between items-end pt-12 flex-1">
                      <div className="text-center w-48 border-t border-gray-400 pt-2">
                        <p className="font-semibold text-gray-800">{leaveData.guardianName || '_______________________'}</p>
                        <p className="text-xs text-gray-500">Guardian's Signature & Name</p>
                      </div>
                      
                      <div className="text-center w-48 border-t border-gray-400 pt-2">
                        <p className="font-semibold text-gray-400">_______________________</p>
                        <p className="text-xs text-gray-500">Principal / Authority Approval</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Admission Form Document Template */}
                {formType === 'admission' && (
                  <div className="space-y-6 flex-1 flex flex-col text-xs sm:text-sm">
                    {/* Passport Photo Box on Sheet */}
                    <div className="absolute top-44 right-10 w-28 h-32 border border-gray-400 flex flex-col items-center justify-center text-center p-2 bg-gray-50 text-[10px] text-gray-500 rounded">
                      <User className="w-8 h-8 text-gray-400 mb-1" />
                      Affix Passport Size Photo Here
                    </div>

                    <div className="mb-4">
                      <p className="font-extrabold text-base border-b border-gray-200 pb-2">Student Admission Request (भर्ना आवेदन फारम)</p>
                      <p className="text-xs text-gray-500 mt-1">Academic session: <strong>{admissionData.academicYear}</strong></p>
                    </div>

                    <div className="space-y-4 max-w-[75%]">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs font-semibold text-gray-500">Applied For Class</p>
                          <p className="font-bold border-b border-gray-300 pb-1 text-gray-900">{admissionData.appliedClass}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500">Admission Date</p>
                          <p className="font-bold border-b border-gray-300 pb-1 text-gray-900">{new Date().toISOString().split('T')[0]}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-primary border-b border-blue-100 pb-1">1. Student Details (विद्यार्थीको विवरण)</h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-semibold text-gray-500">Full Name (English)</p>
                          <p className="font-bold border-b border-gray-200 pb-1">{admissionData.studentName}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500">पूरा नाम (नेपालीमा)</p>
                          <p className="font-bold border-b border-gray-200 pb-1 font-nepali">{admissionData.studentNameNepali}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs font-semibold text-gray-500">Date of Birth (DOB)</p>
                          <p className="font-bold border-b border-gray-200 pb-1">{admissionData.dob}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500">Gender</p>
                          <p className="font-bold border-b border-gray-200 pb-1">{admissionData.gender}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500">Address</p>
                          <p className="font-bold border-b border-gray-200 pb-1 text-xs truncate">{admissionData.address}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-primary border-b border-blue-100 pb-1">2. Family Details (पारिवारिक विवरण)</h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-semibold text-gray-500">Father's Full Name</p>
                          <p className="font-bold border-b border-gray-200 pb-1">{admissionData.fatherName}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500">Mother's Full Name</p>
                          <p className="font-bold border-b border-gray-200 pb-1">{admissionData.motherName}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-gray-500">Contact Mobile/Phone Number</p>
                        <p className="font-bold border-b border-gray-200 pb-1">{admissionData.contactNo}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-primary border-b border-blue-100 pb-1">3. Academic History (शैक्षिक इतिहास)</h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-semibold text-gray-500">Previous School Name</p>
                          <p className="font-bold border-b border-gray-200 pb-1">{admissionData.prevSchool}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500">Marks Secured / Grade</p>
                          <p className="font-bold border-b border-gray-200 pb-1">{admissionData.prevGrade}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs pt-4 text-gray-600">
                      <p className="font-bold text-gray-800">Declaration:</p>
                      <p className="text-justify leading-relaxed">
                        We hereby declare that all the details provided in this admission form are true, correct, and complete to the best of our knowledge. We agree to abide by all the rules, disciplines, and academic standards set forth by Vidhya Jyoti Secondary School.
                      </p>
                    </div>

                    <div className="mt-12 flex justify-between items-end pt-12 flex-1">
                      <div className="text-center w-48 border-t border-gray-400 pt-2">
                        <p className="text-xs text-gray-500">Signature of Student</p>
                      </div>
                      
                      <div className="text-center w-48 border-t border-gray-400 pt-2">
                        <p className="text-xs text-gray-500">Signature of Parent / Guardian</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Scholarship Form Document Template */}
                {formType === 'scholarship' && (
                  <div className="space-y-6 flex-1 flex flex-col text-xs sm:text-sm">
                    <div className="mb-4">
                      <p className="font-extrabold text-base border-b border-gray-200 pb-2">Scholarship & Fee Waiver Application (छात्रवृत्ति आवेदन)</p>
                      <p className="text-xs text-gray-500 mt-1">Request category: <strong className="text-primary">{scholarshipData.scholarshipCategory}</strong></p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-primary border-b border-blue-100 pb-1">Student Particulars</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs font-semibold text-gray-500">Student Name</p>
                          <p className="font-bold border-b border-gray-200 pb-1">{scholarshipData.studentName}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500">Class</p>
                          <p className="font-bold border-b border-gray-200 pb-1">{scholarshipData.studentClass}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500">Roll Number</p>
                          <p className="font-bold border-b border-gray-200 pb-1">{scholarshipData.rollNo}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-primary border-b border-blue-100 pb-1">Socio-Economic Information</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs font-semibold text-gray-500">Guardian Name</p>
                          <p className="font-bold border-b border-gray-200 pb-1">{scholarshipData.guardianName}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500">Occupation</p>
                          <p className="font-bold border-b border-gray-200 pb-1">{scholarshipData.guardianOccupation}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500">Annual Income (NPR)</p>
                          <p className="font-bold border-b border-gray-200 pb-1">Rs. {scholarshipData.annualIncome}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-primary border-b border-blue-100 pb-1">Academic Performance</h4>
                      <div className="w-1/3">
                        <p className="text-xs font-semibold text-gray-500">Previous GPA/Grade</p>
                        <p className="font-bold border-b border-gray-200 pb-1">{scholarshipData.prevGPA}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-primary border-b border-blue-100 pb-1">Justification Detail</h4>
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 italic leading-relaxed text-justify">
                        "{scholarshipData.reason}"
                      </div>
                    </div>

                    <div className="space-y-2 text-xs pt-2">
                      <p className="font-bold text-gray-800">Checklist of Documents to Attach:</p>
                      <ul className="list-disc list-inside space-y-1 text-gray-600 pl-2">
                        <li>Official recommendation letter from local ward office (सिफारिस पत्र)</li>
                        <li>Copy of past class gradesheet / academic report</li>
                        <li>Character certificate from previous school (if applicable)</li>
                        <li>Document proof of scholarship category status (Dalit, Janajati, Disability certificate etc.)</li>
                      </ul>
                    </div>

                    <div className="mt-12 flex justify-between items-end pt-12 flex-1">
                      <div className="text-center w-48 border-t border-gray-400 pt-2">
                        <p className="text-xs text-gray-500">Signature of Applicant</p>
                      </div>
                      
                      <div className="text-center w-48 border-t border-gray-400 pt-2">
                        <p className="text-xs text-gray-500">Signature of Parent / Guardian</p>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Printable footer disclaimer */}
              <div className="border-t border-gray-200 pt-4 mt-8 flex justify-between items-center text-[10px] text-gray-500 font-mono">
                <span>Vidhya Jyoti Sec School Web-App Generated Template</span>
                <span>Page 1 of 1</span>
              </div>

            </div>

          </div>

        </div>

      </motion.div>
    </div>
  );
}
