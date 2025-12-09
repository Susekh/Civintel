"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation"; 
import toast from "react-hot-toast";
import Comments from "@/app/components/Comments";
import SpotGallery from "@/app/components/SpotGallery";
import { useSession } from "@/lib/auth-client";
import { Star, Trash2 } from "lucide-react";

type SpotLocation = {
  coordinates: [number, number]; // [longitude, latitude]
  address?: string;
};

type Spot = {
  _id: string;
  title: string;
  description: string;
  tags: string[];
  location: SpotLocation;
  gallery?: string[];
  createdBy: string; 
};

type User = {
  id: string;
  savedSpots: string[];
};

export default function SpotDetailPage() {
  const params = useParams();
  const router = useRouter(); // Initialize router for navigation
  const id = params?.id as string | undefined;

  const [spot, setSpot] = useState<Spot | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: session } = useSession();
  const userId = session?.user?.id;

  const isCreator = userId && spot?.createdBy === userId;


  // Fetch spot details
  useEffect(() => {
    if (!id) return;

    const fetchSpot = async () => {
      try {
        const res = await fetch(`/api/spots/${id}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load spot");
        const data = await res.json();
        setSpot(data.spot);
        console.log("Spot data ::", data);

      } catch (error) {
        console.error("Error fetching spot:", error);
        toast.error("Error loading spot");
      } finally {
        setLoading(false);
      }
    };

    fetchSpot();
  }, [id]);

  // Fetch user saved spots
  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/users/${userId}`, { cache: "no-store" });
        const data = await res.json();

        if (res.ok) setUser(data.user);
        else toast.error("Couldn't get saved spots");
      } catch (err) {
        console.error("Error fetching user:", err);
        toast.error("Couldn't get saved spots");
      }
    };

    fetchUser();
  }, [userId]);

  const isSaved = !!user?.savedSpots?.includes(spot?._id ?? "");

  const handleAddSpot = (spotId: string) => {
    if (!userId) {
      toast.error("Please log in to save this spot.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/spots/save/${spotId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });

        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || "Failed to update saved spots");

        setUser((prev) => {
          if (!prev) return prev;
          const updated = isSaved
            ? prev.savedSpots.filter((s) => s !== spotId)
            : [...prev.savedSpots, spotId];
          return { ...prev, savedSpots: updated };
        });

        toast.success(
          isSaved ? "Removed from saved spots" : "Saved successfully"
        );
      } catch (error) {
        console.error("Error saving spot:", error);
        toast.error("Error updating saved spots");
      }
    });
  };

  const handleDeleteSpot = async (spotId: string) => {
    if (!isCreator || !confirm("Are you sure you want to delete this spot? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true); 
    try {
      const res = await fetch(`/api/spots/${spotId}`, {
        method: "DELETE", 
        cache: "no-store",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete spot");
      }

      toast.success("Spot deleted successfully!");
      router.push("/spots/nearby");
    } catch (error) {
      console.error("Error deleting spot:", error);
      toast.error("Error deleting spot.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading)
    return <div className="p-6 text-center text-neutral-500">Loading...</div>;

  if (!spot)
    return <div className="p-6 text-center text-red-500">Spot not found.</div>;

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            {spot.title}
          </h1>

          {/* Action Buttons: Save & Delete */}
          <div className="flex items-center space-x-4">
            {/* Delete Button (Only for Creator) */}
            {isCreator && (
              <button
                onClick={() => handleDeleteSpot(spot._id)}
                disabled={isDeleting}
                className="cursor-pointer transition hover:scale-110 disabled:opacity-50 text-red-500 hover:text-red-700 dark:hover:text-red-400"
                title="Delete Spot"
              >
                <Trash2 className="h-6 w-6" />
              </button>
            )}

            {/* Save Spot Button */}
            {userId ? (
              <button
                onClick={() => handleAddSpot(spot._id)}
                disabled={isPending}
                className="cursor-pointer transition hover:scale-110 disabled:opacity-50"
                title={isSaved ? "Unsave Spot" : "Save Spot"}
              >
                <Star
                  className={`h-6 w-6 transition ${
                    isSaved
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-neutral-500"
                  }`}
                />
              </button>
            ) : (
              <span className="text-sm text-neutral-400">Login to save</span>
            )}
          </div>
        </div>

        
        {/* Description */}
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 p-5 shadow-sm">
          <p className="text-base leading-relaxed text-neutral-700 dark:text-neutral-300">
            {spot.description}
          </p>
        </div>

        {/* Tags */}
        {spot.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {spot.tags.map((t) => (
              <span
                key={t}
                className="text-xs border border-neutral-300 dark:border-neutral-600 rounded-full px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition hover:border-purple-400"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Gallery - Using SpotGallery Component */}
      {spot.gallery && spot.gallery.length > 0 && (
        <div className="space-y-3">
          <SpotGallery images={spot.gallery} spotTitle={spot.title} />
        </div>
      )}

      {/* Location */}
      {spot.location && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
            Location
          </h2>
          <div className="aspect-video w-full overflow-hidden md:h-60 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow">
            <iframe
              width="100%"
              height="100%"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://maps.google.com/maps?q=${spot.location.coordinates[1]},${spot.location.coordinates[0]}&z=15&output=embed`}
            />
          </div>
          <div>
            <a
              className="underline text-purple-600 hover:text-purple-700 dark:text-purple-400 hover:opacity-80 transition"
              target="_blank"
              rel="noreferrer"
              href={`https://maps.google.com/maps?q=${spot.location.coordinates[1]},${spot.location.coordinates[0]}`}
            >
              Open directions in Google Maps
            </a>
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
          Comments
        </h2>
        <Comments spotId={spot._id} />
      </div>
    </div>
  );
}