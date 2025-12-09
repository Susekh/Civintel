"use client";

import { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import GeoAutofillButton from "./GeoAutofillButton";
import { X, Upload, Loader2, Camera, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

export default function CreateSpotForm({
  action,
}: {
  action: (formData: FormData) => Promise<void>;
}) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [cameraMode, setCameraMode] = useState(false);

  const webcamRef = useRef<Webcam | null>(null);
  const galleryInput = useRef<HTMLInputElement | null>(null);

  // 📷 Capture Photo from Webcam
  const capturePhoto = useCallback(async () => {
    if (!webcamRef.current) {
      toast.error("Camera not ready");
      return;
    }

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      toast.error("Failed to capture image");
      return;
    }

    try {
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      const file = new File([blob], `photo_${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
      
      setCameraMode(false);
      await uploadFiles([file]);
    } catch (error) {
      console.error("Capture error:", error);
      toast.error("Failed to capture photo");
    }
  }, []);

  // 📤 Upload Files to Cloudinary
  const uploadFiles = async (files: File[]) => {
    const remainingSlots = 10 - selectedFiles.length;
    const newFiles = files.slice(0, remainingSlots);

    if (newFiles.length === 0) {
      toast.error("Maximum 10 photos allowed");
      return;
    }

    const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file));
    setSelectedFiles((prev) => [...prev, ...newFiles]);
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);

    setIsUploading(true);
    try {
      const uploadPromises = newFiles.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();
        return data.result.secure_url;
      });

      const urls = await Promise.all(uploadPromises);
      setUploadedUrls((prev) => [...prev, ...urls]);
      toast.success("Images uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload some images. Please try again.");

      setSelectedFiles((prev) => prev.slice(0, -newFiles.length));
      setPreviewUrls((prev) => prev.slice(0, -newFiles.length));
    } finally {
      setIsUploading(false);
    }
  };

  // 📁 Handle File Selection from Gallery
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    await uploadFiles(files);
  };

  // 🗑 Remove Selected Image
  const removeImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    setUploadedUrls((prev) => prev.filter((_, i) => i !== index));
    toast("Image removed", { icon: "🗑️" });
  };

  // 🧾 Handle Submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isUploading)
      return toast.error("Please wait until images finish uploading");

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    uploadedUrls.forEach((url) => formData.append("gallery[]", url));

    try {
      await toast.promise(action(formData), {
        loading: "Creating spot...",
        success: "Spot created successfully 🎉",
        error: "Failed to create spot. Please try again.",
      });

      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Hidden Gallery Input */}
      <input
        type="file"
        accept="image/*"
        ref={galleryInput}
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-neutral-950 text-neutral-100 p-6 rounded-3xl shadow-xl border border-neutral-800"
      >
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold mb-1 text-neutral-200">
            Title
          </label>
          <input
            name="title"
            required
            placeholder="Enter report title"
            className="w-full border border-neutral-700 rounded-lg px-4 py-2 bg-neutral-900 text-neutral-100"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold mb-1 text-neutral-200">
            Description
          </label>
          <textarea
            name="description"
            required
            rows={3}
            placeholder="Describe the report"
            className="w-full border border-neutral-700 rounded-lg px-4 py-2 bg-neutral-900 text-neutral-100"
          />
        </div>

        {/* Upload Trigger */}
        <div>
          <label className="block text-sm font-semibold mb-1 text-neutral-200">
            Gallery Photos (max 10)
          </label>

          <button
            type="button"
            disabled={isUploading || selectedFiles.length >= 10}
            onClick={() => setShowActions(true)}
            className="w-full flex flex-col items-center justify-center h-32 border-2 border-dashed border-neutral-700 rounded-lg bg-neutral-900 hover:bg-neutral-800 transition disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                <span className="text-sm text-neutral-400 mt-2">
                  Uploading...
                </span>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-neutral-400" />
                <span className="text-sm text-neutral-400 mt-2">
                  Add photos
                </span>
                <span className="text-xs text-neutral-500 mt-1">
                  {selectedFiles.length}/10 photos
                </span>
              </>
            )}
          </button>

          {/* Image Grid */}
          {previewUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <Image
                    src={url}
                    alt="preview"
                    width={100}
                    height={100}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-semibold mb-1 text-neutral-200">
            Tags (comma separated)
          </label>
          <input
            name="tags"
            placeholder="e.g. burglary, theft"
            className="w-full border border-neutral-700 rounded-lg px-4 py-2 bg-neutral-900 text-neutral-100"
          />
        </div>

        {/* Lat & Lng */}
        <div className="grid grid-cols-2 gap-4">
          <input
            name="lat"
            required
            step="any"
            placeholder="Latitude"
            className="border border-neutral-700 rounded-lg px-4 py-2 bg-neutral-900 text-neutral-100"
          />
          <input
            name="lng"
            required
            step="any"
            placeholder="Longitude"
            className="border border-neutral-700 rounded-lg px-4 py-2 bg-neutral-900 text-neutral-100"
          />
        </div>

        <GeoAutofillButton />

        {/* Submit */}
        <button
          type="submit"
          disabled={isUploading || isSubmitting}
          className="w-full py-3 rounded-xl bg-purple-700 hover:bg-purple-800 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition"
        >
          {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
          {isSubmitting ? "Creating Report..." : "Create Report"}
        </button>
      </form>

      {/* Camera Modal */}
      {cameraMode && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex flex-col items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl space-y-4">
            <div className="bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  facingMode: "environment",
                }}
                className="w-full h-auto rounded-lg"
                onUserMediaError={(error) => {
                  console.error("Webcam error:", error);
                  toast.error("Failed to access camera. Please check permissions.");
                  setCameraMode(false);
                }}
              />
            </div>

            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={capturePhoto}
                disabled={isUploading}
                className="flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-medium transition-all shadow-lg hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                <Camera size={24} />
                {isUploading ? "Uploading..." : "Capture Photo"}
              </button>
              <button
                type="button"
                onClick={() => setCameraMode(false)}
                disabled={isUploading}
                className="flex items-center gap-2 px-6 py-4 bg-neutral-700 hover:bg-neutral-600 text-white rounded-full font-medium transition-all shadow-lg disabled:opacity-50"
              >
                <X size={24} />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Sheet */}
      {showActions && !cameraMode && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50"
          onClick={() => setShowActions(false)}
        >
          <div
            className="bg-neutral-900 w-full max-w-md rounded-t-2xl p-6 space-y-3 shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-neutral-100 mb-2">
              Upload Photo
            </h3>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors shadow-md"
              onClick={() => {
                setCameraMode(true);
                setShowActions(false);
              }}
            >
              <Camera size={22} />
              Take Photo
            </button>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 font-medium transition-colors"
              onClick={() => {
                galleryInput.current?.click();
                setShowActions(false);
              }}
            >
              <ImageIcon size={22} />
              Choose from Gallery
            </button>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-neutral-700 hover:bg-neutral-600 text-neutral-100 font-medium transition-colors"
              onClick={() => setShowActions(false)}
            >
              <X size={22} />
              Cancel
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}