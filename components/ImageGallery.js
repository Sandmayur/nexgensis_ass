"use client";

import { useState } from "react";

export default function ImageGallery({ images, thumbnail }) {
  const allImages = images?.length > 0 ? images : (thumbnail ? [thumbnail] : ['https://via.placeholder.com/400']);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100 border border-gray-200">
        <img
          src={allImages[activeIndex]}
          alt="Product image"
          className="h-full w-full object-cover object-center sm:h-96"
        />
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative flex h-24 cursor-pointer items-center justify-center rounded-md bg-white text-sm font-medium uppercase hover:bg-gray-50 focus:outline-none focus:ring focus:ring-opacity-50 focus:ring-offset-4 ${
                activeIndex === idx ? "ring-2 ring-blue-500" : "ring-1 ring-gray-200"
              }`}
            >
              <span className="sr-only">View image {idx + 1}</span>
              <span className="absolute inset-0 overflow-hidden rounded-md">
                <img src={img} alt="" className="h-full w-full object-cover object-center" />
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
