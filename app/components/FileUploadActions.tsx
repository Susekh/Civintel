import { useState, useRef, useCallback } from "react";
import { Camera, Image, X, Upload } from "lucide-react";

export default function FileUploadActions({ onFileSelect }: { onFileSelect: (file: File) => void }) {
  const [open, setOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraMode(true);
      setOpen(false);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraMode(false);
  }, [stream]);

  const capture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: "image/jpeg" });
        onFileSelect(file);
        stopCamera();
      }
    }, "image/jpeg", 0.95);
  }, [onFileSelect, stopCamera]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      setOpen(false);
    }
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors shadow-lg"
      >
        <Upload size={20} />
        Upload File
      </button>

      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInput}
        onChange={handleFile}
        style={{ display: "none" }}
      />

      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Camera Modal */}
      {cameraMode && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex flex-col items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl space-y-4">
            <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-auto"
              />
            </div>
            
            <div className="flex gap-3 justify-center">
              <button
                onClick={capture}
                className="flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-medium transition-all shadow-lg hover:scale-105"
              >
                <Camera size={24} />
                Capture Photo
              </button>
              <button
                onClick={stopCamera}
                className="flex items-center gap-2 px-6 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-full font-medium transition-all shadow-lg"
              >
                <X size={24} />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Sheet */}
      {open && !cameraMode && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white w-full max-w-md rounded-2xl p-6 space-y-3 shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload Photo</h3>
            
            <button
              className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors shadow-md"
              onClick={startCamera}
            >
              <Camera size={22} />
              Take Photo
            </button>
            
            <button
              className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 font-medium transition-colors"
              onClick={() => fileInput.current?.click()}
            >
              <Image size={22} />
              Choose from Gallery
            </button>
            
            <button
              className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
              onClick={() => setOpen(false)}
            >
              <X size={22} />
              Cancel
            </button>
          </div>
        </div>
      )}

      <style>{`
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