import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { Upload } from 'lucide-react';

interface InlineImageEditProps {
  settingKey: string;
  fallbackUrl: string;
  className?: string;
  alt?: string;
}

export function InlineImageEdit({ settingKey, fallbackUrl, className = '', alt = '' }: InlineImageEditProps) {
  const { isAdmin } = useAuth();
  const { settings, updateSetting } = useSettings();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUrl = settings[settingKey] || fallbackUrl;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // In a real app we might upload this to Firebase Storage, but here we read it as data URL
    // since the original code does the same or we use the dataUrl
    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large. Please use an image under 2MB.");
      return;
    }
    
    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await updateSetting(settingKey, reader.result as string);
      } catch (err) {
        console.error("Failed to save image", err);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isAdmin) {
    return <img src={currentUrl} alt={alt} className={className} />;
  }

  return (
    <div className={`relative group ${className}`}>
      <img src={currentUrl} alt={alt} className="w-full h-full object-cover" />
      <div 
        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer backdrop-blur-[1px] z-10" 
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? (
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <>
            <Upload className="w-8 h-8 text-white mb-2 drop-shadow-md" />
            <span className="text-sm text-white font-bold uppercase tracking-wider drop-shadow-md">Change Image</span>
          </>
        )}
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      </div>
    </div>
  );
}
