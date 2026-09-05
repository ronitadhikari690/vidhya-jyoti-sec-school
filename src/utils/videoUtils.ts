import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

export interface VideoEmbedInfo {
  type: 'youtube' | 'vimeo' | 'facebook' | 'direct';
  embedUrl?: string;
  srcUrl?: string;
  videoId?: string;
}

/**
 * Extracts embed URL or source information for YouTube, Vimeo, Facebook, and direct video links.
 */
export function getVideoEmbedInfo(url: string): VideoEmbedInfo | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // YouTube match: supports youtu.be, youtube.com/watch?v=, youtube.com/embed/, youtube.com/shorts/
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|shorts\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: 'youtube',
      videoId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1&enablejsapi=1`
    };
  }

  // Vimeo match: supports vimeo.com/123456789
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/);
  if (vimeoMatch && vimeoMatch[3]) {
    const videoId = vimeoMatch[3];
    return {
      type: 'vimeo',
      videoId,
      embedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=1&background=1&autopause=0`
    };
  }

  // Facebook video match: facebook.com/.../videos/..., fb.watch, facebook.com/watch
  if (trimmed.includes('facebook.com') || trimmed.includes('fb.watch')) {
    return {
      type: 'facebook',
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(trimmed)}&autoplay=true&mute=1&show_text=false`
    };
  }

  // Direct video link (e.g. .mp4, .webm, Firebase storage download URL, etc.)
  return {
    type: 'direct',
    srcUrl: trimmed
  };
}

/**
 * Uploads a video file directly to Firebase Storage and returns download URL.
 */
export async function uploadVideoToStorage(file: File, storagePath: string): Promise<string> {
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, file, {
    contentType: file.type || 'video/mp4'
  });
  return await getDownloadURL(storageRef);
}
