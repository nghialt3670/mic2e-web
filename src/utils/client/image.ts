interface CreateThumbnailResult {
  file: File;
  width: number;
  height: number;
}

export async function createImageThumbnail(
  file: File,
): Promise<CreateThumbnailResult> {
  const maxWidth = 800;
  const maxHeight = 800;
  const quality = 0.85;
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

export const createImageFileFromDataURL = async (
  dataURL: string,
  filename: string = "image.jpg",
): Promise<File> => {
  return new Promise((resolve, reject) => {
    try {
      // Extract the base64 data and mime type from data URL
      const arr = dataURL.split(",");
      const mimeMatch = arr[0].match(/:(.*?);/);

      if (!mimeMatch) {
        reject(new Error("Invalid data URL format"));
        return;
      }

      const mime = mimeMatch[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);

      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }

      const blob = new Blob([u8arr], { type: mime });
      const file = new File([blob], filename, { type: mime });

      resolve(file);
    } catch (error) {
      reject(new Error(`Failed to create file from data URL: ${error}`));
    }
  });
};
