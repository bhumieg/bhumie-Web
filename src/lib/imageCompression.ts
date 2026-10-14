/**
 * Client-side image compression and resizing utility.
 * Compresses large mobile/camera photos (5-15MB) down to 200-400KB
 * with excellent visual fidelity, preventing 413 Payload Too Large errors.
 */

export async function compressAndResizeImage(
  file: File,
  maxWidth: number = 1600,
  maxHeight: number = 1600,
  quality: number = 0.82
): Promise<File> {
  // If file is already small (under 400KB), return as is
  if (file.size <= 400 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    // If not running in browser or FileReader/Image not supported, return original
    if (typeof window === 'undefined' || !window.FileReader || !window.HTMLCanvasElement) {
      return resolve(file);
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        try {
          let { width, height } = img;

          // Calculate new dimensions preserving aspect ratio
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return resolve(file);
          }

          // Draw image to canvas
          ctx.drawImage(img, 0, 0, width, height);

          // Export as compressed JPEG
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            quality
          );
        } catch {
          resolve(file);
        }
      };

      img.onerror = () => {
        resolve(file);
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      resolve(file);
    };

    reader.readAsDataURL(file);
  });
}

