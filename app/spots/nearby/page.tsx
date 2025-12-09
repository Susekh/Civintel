"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import SpotCard from "@/app/components/SpotCard";

type Spot = {
  _id: string;
  title: string;
  description: string;
  tags?: string[];
  distanceKm?: number;
};

export default function NearbySpotsPage() {
  const [isPending, startTransition] = useTransition();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState("");
  const [q, setQ] = useState("");
  const [global, setGlobal] = useState(false);
  const [locating, setLocating] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Memoized fetch function
  const fetchNearby = useCallback(
    (lat: number, lng: number) => {
      startTransition(async () => {
        setError(null);
        const params = new URLSearchParams({
          lat: String(lat),
          lng: String(lng),
        });
        if (tags.trim()) params.set("tags", tags);
        if (q.trim()) params.set("q", q);
        if (global) params.set("global", "1");

        try {
          const res = await fetch(`/api/spots/nearby?${params.toString()}`);
          const data = await res.json();

          if (!res.ok) {
            setError(data.error || "Failed to load spots");
            return;
          }
          setSpots(data.spots || []);
        } catch {
          setError("Network error occurred");
        }
      });
    },
    [tags, q, global]
  );

  // Get user location on mount
  // Inside NearbySpotsPage
  useEffect(() => {
    const cachedLocation = sessionStorage.getItem("userLocation");
    if (cachedLocation) {
      const location = JSON.parse(cachedLocation);
      setUserLocation(location);
      setLocating(false);
      return;
    }

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLocating(false);
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const location = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserLocation(location);
        sessionStorage.setItem("userLocation", JSON.stringify(location));
        setLocating(false);
      },
      () => {
        setError("Unable to retrieve your location.");
        setLocating(false);
      }
    );
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchNearby(userLocation.lat, userLocation.lng);
    }
  }, [userLocation, fetchNearby]);

  function handleRefresh() {
    if (!navigator.geolocation) return;

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const location = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserLocation(location);
        sessionStorage.setItem("userLocation", JSON.stringify(location));
        setLocating(false);
      },
      () => {
        setError("Unable to retrieve your location.");
        setLocating(false);
      }
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6">
      {/* Header */}
      <h1 className="text-3xl font-bold">Nearby Reports</h1>

      {/* Filters */}
      <div className="rounded-2xl border p-4 bg-neutral-50 dark:bg-neutral-900 space-y-4 shadow-sm">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Filter by tags
            </label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 bg-transparent focus:ring-2 focus:ring-foreground/50"
              placeholder="e.g. burglary, theft"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 bg-transparent focus:ring-2 focus:ring-foreground/50"
              placeholder="Title, description or tag"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={global}
              onChange={(e) => setGlobal(e.target.checked)}
              className="accent-foreground"
            />
            Global (ignore my location)
          </label>

          <div className="flex gap-3 ml-auto">
            <button
              onClick={handleRefresh}
              disabled={isPending}
              className="px-4 py-2 rounded-lg bg-foreground text-background font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {locating
                ? "Retrieving..."
                : isPending
                ? "Refreshing…"
                : "Update Location"}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Location Loading */}
      {locating && (
        <div className="flex justify-center items-center py-12">
          <div className="flex items-center gap-3 text-sm opacity-80">
            <div className="w-5 h-5 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
            <span>Retrieving your location…</span>
          </div>
        </div>
      )}

      {/* Spots grid */}
      <div className="grid gap-4">
        {isPending && spots.length === 0 && (
          <div className="space-y-3">
            <div className="h-24 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
            <div className="h-24 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
          </div>
        )}

        {!isPending &&
          spots.length > 0 &&
          spots.map((s) => <SpotCard key={s._id} spot={s} />)}

        {!isPending && spots.length === 0 && !error && (
          <p className="opacity-70 text-center py-8">No reports found nearby.</p>
        )}
      </div>

      {/* Loading indicator for filter changes */}
      {isPending && spots.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-foreground text-background px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Updating...</span>
          </div>
        </div>
      )}
    </div>
  );
}
