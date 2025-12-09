"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { User, Star, TrendingUp } from "lucide-react";
import Link from "next/link";

interface Spot {
  spotId: string;
  title: string;
  saveCount: number;
  description?: string;
}

export default function MostSavedSpots() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(5);

  const limits = [5, 10, 15, 20];

  useEffect(() => {
    const fetchSpots = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/admin/analytics/spots/most-saved?limit=${limit}`
        );
        const data = await res.json();
        setSpots(data.data || []);
      } catch (err) {
        console.error("Failed to fetch spots:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSpots();
  }, [limit]);

  return (
    <Card className="w-full max-w-full bg-neutral-950 border border-neutral-800/50 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-800/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-neutral-900 rounded-lg flex items-center justify-center">
            <Star className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">
              Most Saved Spots
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Top {limit} spots loved by users
            </p>
          </div>
        </div>

        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="bg-neutral-900 text-white text-sm rounded-lg px-3 py-1.5 border border-neutral-800/50 hover:border-neutral-700 focus:outline-none focus:border-neutral-700 transition cursor-pointer"
        >
          {limits.map((l) => (
            <option key={l} value={l}>
              Top {l}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      <CardContent className="max-h-[450px] overflow-y-auto space-y-2 p-4 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
        {loading ? (
          <div className="h-[200px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-neutral-700 border-t-white rounded-full animate-spin"></div>
              <p className="text-neutral-500 text-sm">Loading...</p>
            </div>
          </div>
        ) : spots.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center">
            <p className="text-neutral-600 text-sm">No spots found.</p>
          </div>
        ) : (
          spots.map((spot, index) => (
            <Link
              href={`/spots/${spot.spotId}`}
              key={spot.spotId}
              className="group flex items-center gap-3 bg-neutral-900/40 hover:bg-neutral-900/60 transition-all duration-200 rounded-lg p-3.5 border border-transparent hover:border-neutral-800/50"
            >
              {/* Ranking */}
              <div className="w-7 h-7 bg-neutral-900 rounded-md flex items-center justify-center text-white text-xs font-semibold shrink-0">
                {index + 1}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-5 h-5 text-blue-400 shrink-0" />
                  <h3 className="text-white text-sm font-medium truncate">
                    {spot.title}
                  </h3>
                </div>

                {spot.description && (
                  <p className="text-neutral-500 text-xs line-clamp-1 ml-7">
                    {spot.description}
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-2 ml-10 sm:ml-auto">
                <div className="flex items-center gap-1.5 bg-neutral-900 px-2.5 py-1 rounded-md">
                  <Star className="w-3 h-3 text-rose-500" />
                  <span className="text-xs font-medium text-white">
                    {spot.saveCount.toLocaleString()}
                  </span>
                </div>

                {index < 3 && (
                  <div className="flex items-center gap-1 bg-neutral-900 px-2 py-1 rounded-md">
                    <TrendingUp className="w-3 h-3 text-amber-500" />
                    <span className="text-xs font-medium text-amber-500">
                      Trending
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
