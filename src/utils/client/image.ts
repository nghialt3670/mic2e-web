interface CreateThumbnailOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

interface CreateThumbnailResult {
  file: File;
  width: number;
  height: number;
}

export async function createImageThumbnail(
  file: File,
  options?: CreateThumbnailOptions,
): Promise<CreateThumbnailResult> {
  const { maxWidth = 800, maxHeight = 800, quality = 0.85 } = options || {};
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Could not get canvas context"));
      return;
    }

    img.onload = () => {
      let { width, height } = img;

      // Calculate new dimensions maintaining aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height;

        if (width > height) {
          width = maxWidth;
          height = width / aspectRatio;
        } else {
          height = maxHeight;
          width = height * aspectRatio;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw the resized image
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to create thumbnail blob"));
            return;
          }

          // Create a new File from the blob
          const thumbnailFile = new File(
            [blob],
            file.name.replace(/\.[^/.]+$/, "_thumbnail.jpg"),
            { type: "image/jpeg" },
          );

          resolve({ file: thumbnailFile, width, height });
        },
        "image/jpeg",
        quality,
      );
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    // Load the image
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    reader.readAsDataURL(file);
  });
}
