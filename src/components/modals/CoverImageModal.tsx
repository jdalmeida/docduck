"use client";

import { useState } from "react";
import { useCoverImage } from "../../hooks/use-cover-image";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useAuth } from "../../context/AuthContext";

export const CoverImageModal = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const coverImage = useCoverImage();
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const update = useMutation(api.documents.update);
  
  const documentId = coverImage.documentId;

  const onClose = () => {
    setIsSubmitting(false);
    coverImage.onClose();
  };

  const onChange = async (file?: File) => {
    if (file) {
      setIsSubmitting(true);

      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      const { storageId } = await result.json();
      
      if(documentId && user) {
        await update({
          id: documentId as Id<"documents">,
          coverImage: storageId,
          userId: user._id,
        });
      }

      onClose();
    }
  };

  return (
    <div className={`fixed inset-0 z-[99999] ${coverImage.isOpen ? 'block' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black/70" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neutral-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Upload Cover Image</h2>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="border-2 border-dashed border-neutral-600 rounded-lg p-6 text-center hover:border-neutral-500 transition-colors">
            <div className="text-neutral-400 mb-2">
              <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-sm text-neutral-400 mb-2">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-neutral-500">
              PNG, JPG, GIF up to 10MB
            </p>
            <input 
              type="file" 
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              onChange={(e) => onChange(e.target.files?.[0])} 
              disabled={isSubmitting} 
            />
          </div>
          
          {isSubmitting && (
            <div className="flex items-center justify-center text-neutral-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Uploading...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 