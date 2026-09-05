import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Volume2, VolumeX, Play, Pause, Video, Image as ImageIcon, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { InlineImageEdit } from './InlineImageEdit';
import { getVideoEmbedInfo } from '../utils/videoUtils';

interface HeroMediaProps {
  fallbackUrl: string;
}

export function HeroMedia({ fallbackUrl }: HeroMediaProps) {
  const { isAdmin } = useAuth();
  const { settings, updateSetting } = useSettings();
  
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const heroMediaType = settings.heroMediaType || (settings.heroVideoUrl ? 'video' : 'image');
  const heroVideoUrl = settings.heroVideoUrl || '';
  const heroImageUrl = settings.heroImageUrl || fallbackUrl;
  const videoInfo = heroVideoUrl ? getVideoEmbedInfo(heroVideoUrl) : null;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    // Direct HTML5 video tag
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
    }

    // YouTube / Vimeo / Facebook iframe postMessage commands
    if (iframeRef.current?.contentWindow && videoInfo) {
      if (videoInfo.type === 'youtube') {
        if (nextMuted) {
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: 'command', func: 'mute', args: [] }),
            '*'
          );
        } else {
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: 'command', func: 'unMute', args: [] }),
            '*'
          );
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: 'command', func: 'setVolume', args: [100] }),
            '*'
          );
        }
      } else if (videoInfo.type === 'vimeo') {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ method: nextMuted ? 'setMuted' : 'setVolume', value: nextMuted ? true : 1 }),
          '*'
        );
      }
    }
  };

  const handleSwitchToImage = async () => {
    if (window.confirm("Switch home hero background to Photo?")) {
      await updateSetting('heroMediaType', 'image');
    }
  };

  const handleSwitchToVideo = async () => {
    if (!heroVideoUrl) {
      alert("Please configure a video URL first in Admin > Settings.");
      return;
    }
    await updateSetting('heroMediaType', 'video');
  };

  const isVideoActive = heroMediaType === 'video' && Boolean(videoInfo);

  return (
    <div className="absolute inset-0 overflow-hidden bg-slate-950">
      {/* Background Poster (Always rendered behind video to prevent black flash) */}
      <img
        src={heroImageUrl}
        alt="School backdrop"
        className="absolute inset-0 w-full h-full object-cover opacity-85"
      />

      {/* Video Layer */}
      {isVideoActive && videoInfo && (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          {videoInfo.type === 'youtube' && (
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
              <iframe
                ref={iframeRef}
                src={videoInfo.embedUrl}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[125%] h-[125%] min-w-[177.77vh] min-h-[56.25vw] object-cover pointer-events-none border-0 opacity-90"
                allow="autoplay; encrypted-media; picture-in-picture"
                title="Hero Background Video"
              />
            </div>
          )}

          {videoInfo.type === 'vimeo' && (
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
              <iframe
                ref={iframeRef}
                src={videoInfo.embedUrl}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[125%] h-[125%] min-w-[177.77vh] min-h-[56.25vw] object-cover pointer-events-none border-0 opacity-90"
                allow="autoplay; encrypted-media; picture-in-picture"
                title="Hero Background Video"
              />
            </div>
          )}

          {videoInfo.type === 'facebook' && (
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
              <iframe
                ref={iframeRef}
                src={videoInfo.embedUrl}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[125%] h-[125%] min-w-[177.77vh] min-h-[56.25vw] object-cover pointer-events-none border-0 opacity-90"
                allow="autoplay; encrypted-media; picture-in-picture"
                title="Hero Background Facebook Video"
              />
            </div>
          )}

          {videoInfo.type === 'direct' && (
            <video
              ref={videoRef}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-90 transition-opacity duration-700"
              poster={heroImageUrl}
            >
              <source src={videoInfo.srcUrl} />
              Your browser does not support the video tag.
            </video>
          )}

          {/* Persistent Mute/Unmute & Playback Controls in corner */}
          <div className="absolute bottom-5 right-5 sm:bottom-6 sm:right-6 z-30 flex items-center gap-2.5">
            {videoInfo.type === 'direct' && (
              <button
                type="button"
                onClick={togglePlay}
                className="p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-900 backdrop-blur-md text-white border border-white/20 transition-all duration-200 shadow-xl text-xs flex items-center justify-center cursor-pointer active:scale-95"
                title={isPlaying ? "Pause video" : "Play video"}
                aria-label={isPlaying ? "Pause video" : "Play video"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            )}

            {/* Small persistent Mute / Unmute audio button */}
            <button
              type="button"
              onClick={toggleMute}
              className={`px-3.5 py-2 rounded-full backdrop-blur-md border transition-all duration-200 shadow-xl text-xs flex items-center gap-2 cursor-pointer select-none active:scale-95 group ${
                isMuted
                  ? 'bg-slate-900/80 hover:bg-slate-900 text-white/90 border-white/20 hover:border-white/40'
                  : 'bg-emerald-950/85 hover:bg-emerald-900 text-emerald-100 border-emerald-400/50 hover:border-emerald-300 shadow-emerald-900/30'
              }`}
              title={isMuted ? "Turn sound on (Unmute)" : "Mute sound"}
              aria-label={isMuted ? "Unmute video audio" : "Mute video audio"}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
              ) : (
                <span className="relative flex items-center justify-center">
                  <Volume2 className="w-4 h-4 text-emerald-300 animate-pulse" />
                </span>
              )}
              <span className="font-medium tracking-wide">
                {isMuted ? 'Unmute' : 'Mute'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* When Image mode is active, render InlineImageEdit for inline admin editing */}
      {!isVideoActive && (
        <InlineImageEdit
          settingKey="heroImageUrl"
          fallbackUrl={fallbackUrl}
          className="w-full h-full object-cover opacity-90"
          alt="School students and campus"
        />
      )}

      {/* Dark gradient overlay for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-black/35 pointer-events-none" />

      {/* Admin Quick Media Switcher Badge */}
      {isAdmin && (
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
          {isVideoActive ? (
            <button
              type="button"
              onClick={handleSwitchToImage}
              className="px-3 py-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-white/90 border border-white/20 text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md transition shadow cursor-pointer"
              title="Switch back to Photo background"
            >
              <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
              <span>Switch to Photo</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSwitchToVideo}
              className="px-3 py-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-white/90 border border-white/20 text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md transition shadow cursor-pointer"
              title="Switch to Video background"
            >
              <Video className="w-3.5 h-3.5 text-amber-400" />
              <span>Switch to Video</span>
            </button>
          )}

          <Link
            to="/admin/settings"
            className="p-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-white/80 border border-white/20 backdrop-blur-md transition shadow hover:text-white"
            title="Configure Hero Video & Media in Admin Settings"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
