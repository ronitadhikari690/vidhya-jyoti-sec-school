/**
 * Utility to compress and resize image files or base64 Data URLs on the client side
 * before saving to Firestore to prevent exceeding the 1MB document limit.
 */

export async function compressImage(
  input: File | string,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve) => {
    const processSrc = (src: string) => {
      // If not a data URL or already small enough (< 100 KB), return as-is
      if (!src || !src.startsWith('data:image/') || src.length < 100000) {
        resolve(src);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > maxWidth || height > maxHeight) {
            if (width / height > maxWidth / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            resolve(src);
            return;
          }

          // Draw white background in case PNG has transparency
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          const compressed = canvas.toDataURL('image/jpeg', quality);
          // Return whichever is smaller
          resolve(compressed.length < src.length ? compressed : src);
        } catch (err) {
          console.warn('Canvas compression failed, returning original image string:', err);
          resolve(src);
        }
      };

      img.onerror = () => {
        resolve(src);
      };

      img.src = src;
    };

    if (input instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          processSrc(result);
        } else {
          resolve('');
        }
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(input);
    } else {
      processSrc(input);
    }
  });
}
