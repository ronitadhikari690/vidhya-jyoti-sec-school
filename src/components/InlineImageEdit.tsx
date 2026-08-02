import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { Upload } from 'lucide-react';
import { compressImage } from '../utils/imageCompressor';

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const compressedDataUrl = await compressImage(file, 1000, 1000, 0.75);
      await updateSetting(settingKey, compressedDataUrl);
    } catch (err) {
      console.error("Failed to save image", err);
      alert("Failed to update image. Please try a different image.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  if (!isAdmin) {
    return <img src={currentUrl} alt={alt} className={className} />;
  }

  return (
    <div 
      className={`relative group ${className} cursor-pointer`}
      onClick={handleClick}
      title="Click to change image"
    >
      <img src={currentUrl} alt={alt} className="w-full h-full object-cover" />
      <div 
        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center backdrop-blur-[1px] z-10 p-1" 
      >
        {uploading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <>
            <Upload className="w-4 h-4 text-white drop-shadow-md" />
            <span className="text-[9px] text-white font-bold uppercase tracking-wider drop-shadow-md text-center leading-tight">Change</span>
          </>
        )}
      </div>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        onClick={(e) => e.stopPropagation()}
        accept="image/*" 
        className="hidden" 
      />
    </div>
  );
}
