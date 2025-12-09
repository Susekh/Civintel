"use client";

import Image from "next/image";
import { useState } from "react";

interface SpotGalleryProps {
  images: string[];
  spotTitle: string;
}

export default function SpotGallery({ images, spotTitle }: SpotGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!images || images.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
        Gallery
      </h2>

      {/* Grid of thumbnails */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {images.map((url, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedImage(url)}
            className="relative aspect-square w-full overflow-hidden rounded-xl border border-neutral-800 hover:opacity-90 transition"
          >
            <Image
              src={url}
              alt={`${spotTitle} photo ${idx + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 300px"
            />
          </button>
        ))}
      </div>

      {/* Lightbox overlay */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 cursor-pointer"
        >
          <div className="relative w-full max-w-4xl h-[80vh]">
            <Image
              src={selectedImage}
              alt={spotTitle}
              fill
              className="object-contain rounded-lg"
              sizes="100vw"
            />
          </div>
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 text-white text-3xl font-bold hover:opacity-70"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
