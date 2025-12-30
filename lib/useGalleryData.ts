import { useState } from "react";

const galleryJSON: string = `[
  { "filename": "Image-1.png", "altText": "Image One" },
  { "filename": "Image-number-2.png", "altText": "Image Two" },
  { "filename": "Image-3.png", "altText": "Image Three" },
  { "filename": "Image-number-4.png", "altText": "Image Four" },
  { "filename": "Image-5.png", "altText": "Image Five" },
  { "filename": "Image-6.png", "altText": "Image Six" },
  { "filename": "Image-7.png", "altText": "Image Seven" },
  { "filename": "Image-8.png", "altText": "Image Eight" }
]`;

export interface GalleryImage {
  filename: string;
  altText: string;
}

export interface GalleryData {
  data: GalleryImage[];
  reverseSort: () => void;
}

export function useGalleryData(): GalleryData {

  const [data, setData] = useState<GalleryImage[]>(JSON.parse(galleryJSON) as GalleryImage[])

  const reverseSort = () => {
    setData([...data].reverse())
  }

  return { data, reverseSort }

}