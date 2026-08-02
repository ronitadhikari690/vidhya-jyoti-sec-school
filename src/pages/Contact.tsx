import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { InlineEdit } from '../components/InlineEdit';

export default function Contact() {
  const { settings } = useSettings();
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const accessKey = (import.meta as any).env.VITE_WEB3FORMS_ACCESS_KEY;

    if (!accessKey) {
      // Fallback to mailto if access key is not set
      const firstName = (form.elements.namedItem('firstName') as HTMLInputElement).value;
      const lastName = (form.elements.namedItem('lastName') as HTMLInputElement).value;
      const email = (form.elements.namedItem('email') as HTMLInputElement).value;
      const subject = (form.elements.namedItem('subject') as HTMLInputElement).value;
      const message = (form.elements.namedItem('message') as HTMLTextAreaElement).value;

      const body = `Name: ${firstName} ${lastName}\nEmail: ${email}\n\nMessage:\n${message}`;
      const mailtoLink = `mailto:vidhyajyotilamjung@gmail.com?subject=${encodeURIComponent(subject || 'Contact Form Submission')}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoLink;
      return;
    }

    const formData = new FormData(form);
    formData.append("access_key", accessKey);
    formData.append("from_name", "Vidhya Jyoti School Website");

    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStatus('success');
        form.reset();
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        setStatus('error');
        setErrorMessage(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage('Network error occurred. Please check your connection and try again.');
    }
  };

  return (
    <div className="bg-light py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We'd love to hear from you. Reach out to us with any questions, concerns, or inquiries.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
            
            {status === 'success' && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Message sent successfully!</h3>
                  <p className="text-sm">Thank you for contacting us. We'll get back to you shortly.</p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Failed to send message</h3>
                  <p className="text-sm">{errorMessage}</p>
                </div>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input type="text" id="firstName" name="firstName" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow" placeholder="John" />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input type="text" id="lastName" name="lastName" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow" placeholder="Doe" />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input type="email" id="email" name="email" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow" placeholder="john@example.com" />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input type="text" id="subject" name="subject" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow" placeholder="How can we help?" />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea id="message" name="message" required rows={5} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow resize-none" placeholder="Write your message here..."></textarea>
              </div>

              {/* Botpress/Spam Protection for Web3Forms */}
              <input type="checkbox" name="botcheck" className="hidden" style={{ display: 'none' }} />

              <button 
                type="submit" 
                disabled={status === 'submitting'}
                className={`w-full text-white font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center gap-2 ${
                  status === 'submitting' ? 'bg-primary/70 cursor-not-allowed' : 'bg-primary hover:bg-blue-800'
                }`}
              >
                {status === 'submitting' ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Contact Info & Map */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 flex flex-col justify-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-50 p-3 rounded-full text-primary mt-1">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <InlineEdit settingKey="contactLocationTitle" fallback="Our Location" className="font-semibold text-gray-900" as="h3" />
                    <InlineEdit
                      settingKey="address"
                      fallback="Khahare, Lamjung, Gandaki Province, Nepal"
                      as="p"
                      className="text-gray-600 mt-1 block"
                    />
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-blue-50 p-3 rounded-full text-primary mt-1">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <InlineEdit settingKey="contactPhoneTitle" fallback="Phone Number" className="font-semibold text-gray-900" as="h3" />
                    <InlineEdit
                      settingKey="phoneNumber"
                      fallback="+977"
                      as="p"
                      className="text-gray-600 mt-1 block"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="bg-blue-100 p-3 rounded-xl text-primary mt-0.5">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <InlineEdit settingKey="contactEmailTitle" fallback="Official Email Address" className="font-bold text-gray-900 text-sm" as="h3" />
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <a href="mailto:vidhyajyotilamjung@gmail.com" className="text-primary hover:underline text-sm font-semibold break-all">
                        vidhyajyotilamjung@gmail.com
                      </a>
                      <button 
                        type="button"
                        onClick={() => navigator.clipboard.writeText('vidhyajyotilamjung@gmail.com')}
                        className="text-xs bg-white hover:bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md border border-gray-200 transition-colors font-medium flex-shrink-0"
                        title="Copy email address"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-amber-50 p-3 rounded-full text-accent mt-1">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <InlineEdit settingKey="contactHoursTitle" fallback="Office Hours" className="font-semibold text-gray-900" as="h3" />
                    <InlineEdit
                      settingKey="officeHours"
                      fallback="Sunday - Friday: 10:00 AM - 4:00 PM\nSaturday: Closed"
                      multiline={true}
                      as="p"
                      className="text-gray-600 mt-1 block whitespace-pre-line"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Map Embed */}
            <div className="bg-gray-200 rounded-2xl overflow-hidden h-80 border border-gray-300 relative shadow-inner">
              <iframe
                title="School Location Map"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(settings?.mapQuery || 'Vidhya Jyoti Secondary School, Lamjung, Nepal')}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
              ></iframe>
            </div>

          </div>
          
        </div>
      </div>
    </div>
  );
}
