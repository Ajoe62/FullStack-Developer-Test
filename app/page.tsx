'use client'
import { useGalleryData } from "@/lib/useGalleryData";
import Image from "next/image";

export default function Home() {
  const { data, reverseSort } = useGalleryData();

  return (
    <main className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4">Image Gallery</h1>
          <p className="text-gray-600 text-lg mb-6">
            A beautiful collection of images
          </p>
          
          
          <button
            onClick={reverseSort}
            className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium"
          >
            <Image
              src="/img/IconDown.svg"
              alt="Sort icon"
              width={20}
              height={20}
              className="w-5 h-5"
            />
            Reverse Sort
          </button>
        </div>

        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {data.map((image, index) => (
            <div
              key={`${image.filename}-${index}`}
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gray-100"
            >
              <div className="aspect-square relative">
                <Image
                  src={`/img/${image.filename}`}
                  alt={image.altText}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-white font-medium">{image.altText}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
