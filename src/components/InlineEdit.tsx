import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';

interface InlineEditProps {
  settingKey: string;
  fallback: string;
  as?: React.ElementType;
  className?: string;
  multiline?: boolean;
}

export function InlineEdit({
  settingKey,
  fallback,
  as: Component = 'span',
  className = '',
  multiline = false
}: InlineEditProps) {
  const { isAdmin } = useAuth();
  const { settings, updateSetting } = useSettings();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef<any>(null);

  // Sync value from settings
  useEffect(() => {
    if (settings && settings[settingKey] !== undefined) {
      setValue(settings[settingKey]);
    } else {
      setValue(fallback);
    }
  }, [settings, settingKey, fallback]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = async () => {
    setIsEditing(false);
    if (value !== (settings[settingKey] || fallback)) {
      await updateSetting(settingKey, value);
    }
  };

  if (!isAdmin) {
    return <Component className={className}>{settings[settingKey] || fallback}</Component>;
  }

  if (isEditing) {
    const editClasses = `w-full p-2 text-black bg-white rounded border-2 border-blue-500 focus:ring-0 focus:outline-none shadow-lg ${className}`;
    
    if (multiline) {
      return (
        <textarea
          ref={inputRef}
          className={editClasses}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsEditing(false);
              setValue(settings[settingKey] || fallback);
            }
          }}
          rows={5}
        />
      );
    }
    
    return (
      <input
        ref={inputRef}
        type="text"
        className={editClasses}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave();
          if (e.key === 'Escape') {
            setIsEditing(false);
            setValue(settings[settingKey] || fallback);
          }
        }}
      />
    );
  }

  return (
    <Component
      className={`cursor-pointer hover:outline hover:outline-dashed hover:outline-2 hover:outline-blue-500/50 hover:bg-black/5 transition-all rounded px-1 -mx-1 relative group ${className}`}
      onClick={(e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsEditing(true);
      }}
      title="Click to edit"
    >
      {settings[settingKey] || fallback}
      <span className="absolute top-0 right-0 -mt-3 -mr-3 bg-blue-500 text-white text-[10px] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
        Edit
      </span>
    </Component>
  );
}
