"use client";
import { signOut } from "@/lib/actions/auth-actions";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import SpotCard from "@/app/components/SpotCard";
import { getIsPro } from "@/lib/actions/getIsPro";
import { Crown, Plus, Compass, Zap } from "lucide-react";

type Session = typeof auth.$Infer.Session;

type Spot = {
  _id: string;
  title: string;
  description: string;
  tags?: string[];
  distanceKm?: number;
};

export default function DashboardClientPage({ session }: { session: Session }) {
  const router = useRouter();
  const user = session.user;
  const [interests, setInterests] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();

  // New state for dropdown sections
  const [showCreated, setShowCreated] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [createdSpots, setCreatedSpots] = useState<Spot[]>([]);
  const [savedSpots, setSavedSpots] = useState<Spot[]>([]);
  const [loadingCreated, setLoadingCreated] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth");
  };

  // Fetch interests
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/profile/interests", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setInterests(data.interests || []);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const data = await getIsPro();
      setIsPro(data.isPro);
    })();
  }, []);

  function saveInterests(next: string[]) {
    startTransition(async () => {
      setInterests(next);
      await fetch("/api/profile/interests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests: next }),
      });
    });
  }

  // Lazy load created spots
  async function fetchCreatedSpots() {
    if (createdSpots.length > 0 || loadingCreated) return;
    setLoadingCreated(true);
    const res = await fetch("/api/spots/created", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setCreatedSpots(data.spots || []);
    }
    setLoadingCreated(false);
  }

  // Lazy load saved spots
  async function fetchSavedSpots() {
    if (savedSpots.length > 0 || loadingSaved) return;
    setLoadingSaved(true);
    const res = await fetch("/api/spots/saved", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setSavedSpots(data.spots || []);
    }
    setLoadingSaved(false);
  }

  // Toggle handlers
  function toggleCreated() {
    setShowCreated((prev) => {
      const next = !prev;
      if (next) fetchCreatedSpots();
      return next;
    });
  }

  function toggleSaved() {
    setShowSaved((prev) => {
      const next = !prev;
      if (next) fetchSavedSpots();
      return next;
    });
  }

  return (
    <main className="mx-auto max-w-6xl p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
      {/* User Info */}
      <div className="rounded-xl sm:rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 sm:p-5 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="w-full sm:w-auto">
            <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-2 flex-wrap">
              <span className="break-words">Welcome back, {user.name}</span>
              {isPro && (
                <Crown
                  className="text-yellow-500 flex-shrink-0"
                  size={20}
                  strokeWidth={2.5}
                />
              )}
            </h1>

            <p className="opacity-70 text-xs sm:text-sm break-all">{user.email}</p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto flex-wrap">
            {user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL && (
              <Link
                href="/admin"
                className="px-3 sm:px-4 py-2 rounded bg-purple-600 text-white text-xs sm:text-sm font-medium hover:bg-purple-500 transition flex-shrink-0"
              >
                Admin Analytics
              </Link>
            )}

            {/* Sign out button */}
            <button
              onClick={handleSignOut}
              className="px-3 sm:px-4 py-2 rounded bg-foreground text-background cursor-pointer hover:opacity-90 hover:bg-red-500 hover:text-white transition text-xs sm:text-sm font-medium flex-shrink-0"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions & Interests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
        {/* Quick Actions (Professional Tiles) */}
        <div className="rounded-xl sm:rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 sm:p-5">
          <h2 className="font-semibold text-base sm:text-lg mb-3 text-neutral-900 dark:text-neutral-100">
            Quick Actions
          </h2>

          {/* Compact Tile Grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {/* Create Spot Tile */}
            <Link
              href="/spots/new"
              className="group flex flex-col justify-between items-start p-2.5 sm:p-3 aspect-[6/3] rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:border-purple-500 hover:shadow-md transition duration-200"
            >
              <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-600 dark:text-neutral-400 group-hover:text-purple-600 transition duration-200" />
              <span className="text-sm sm:text-lg font-semibold mt-auto text-neutral-800 dark:text-neutral-200 group-hover:text-purple-600 transition leading-tight">
                Create Report
              </span>
            </Link>

            {/* Find Nearby Tile */}
            <Link
              href="/spots/nearby"
              className="group flex flex-col justify-between items-start p-2.5 sm:p-3 aspect-[6/3] rounded-lg bg-purple-50 dark:bg-neutral-800 border border-purple-200 dark:border-neutral-700 hover:bg-purple-100 dark:hover:bg-purple-900/50 hover:border-purple-500 transition duration-200"
            >
              <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 transition duration-200" />
              <span className="text-sm sm:text-lg font-semibold mt-auto text-purple-800 dark:text-purple-300 transition leading-tight">
                Find Nearby
              </span>
            </Link>

            {/* Upgrade to Pro Tile (Takes full width if not Pro) */}
            {isPro === false && (
              <Link
                href="/payment"
                // Full width, professional border, and subtle yellow highlight
                className="col-span-2 group flex justify-between items-center p-2.5 sm:p-3 rounded-lg border border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 text-neutral-800 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition duration-200"
              >
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base font-bold">Upgrade to Pro</span>
                </div>
                {/* Minimal star icon */}
                <span className="text-base sm:text-lg text-yellow-500">&#9733;</span>
              </Link>
            )}
          </div>
        </div>

        {/* Interests */}
        <div className="rounded-xl sm:rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 sm:p-5 space-y-3">
          <h2 className="font-semibold text-base sm:text-lg text-neutral-900 dark:text-neutral-100">
            Your interests
          </h2>
          <div className="flex flex-wrap gap-2">
            {interests.map((t) => (
              <button
                key={t}
                onClick={() => saveInterests(interests.filter((i) => i !== t))}
                className="text-xs border border-neutral-400 dark:border-neutral-600 rounded-full px-2.5 sm:px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-purple-500 hover:text-purple-500 transition"
              >
                {t} ✕
              </button>
            ))}
            {interests.length === 0 && (
              <div className="text-xs sm:text-sm opacity-60 text-neutral-500 dark:text-neutral-400">
                No interests added yet.
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Add interest (comma separated)"
              className="flex-1 border rounded px-3 py-2 bg-transparent text-sm text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-600 focus:ring-purple-500 focus:border-purple-500"
            />
            <button
              disabled={isPending}
              onClick={() => {
                const next = Array.from(
                  new Set([
                    ...interests,
                    ...input
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  ])
                );
                setInput("");
                saveInterests(next);
              }}
              className="px-4 py-2 rounded bg-purple-600 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition w-full sm:w-auto"
            >
              Add
            </button>
          </div>
          <p className="text-xs opacity-60 text-neutral-500 dark:text-neutral-400">
            These interests will be used to improve search relevance.
          </p>
        </div>
      </div>

{/* My Created Spots */}
<div className="rounded-lg sm:rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm">
  <button
    onClick={toggleCreated}
    className="w-full flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 font-semibold tracking-wide hover:bg-neutral-100 hover:rounded-lg sm:hover:rounded-xl dark:hover:bg-neutral-800 transition-colors"
  >
    <span className="text-sm sm:text-base">My Created Spots</span>
    <span className="text-lg sm:text-xl font-bold transition-transform">
      {showCreated ? "−" : "+"}
    </span>
  </button>

  {showCreated && (
    <div className="border-t border-neutral-200 dark:border-neutral-700">
      <div className="px-4 sm:px-6 py-3 sm:py-4 max-h-80 overflow-y-auto space-y-3">
        {loadingCreated && (
          <div className="text-xs sm:text-sm opacity-70 animate-pulse">
            Loading your spots…
          </div>
        )}

        {!loadingCreated && createdSpots.length === 0 && (
          <div className="text-xs sm:text-sm opacity-70">
            You haven&apos;t created any spots yet.
          </div>
        )}

        {!loadingCreated &&
          createdSpots.map((spot) => (
            <SpotCard key={spot._id} spot={spot} />
          ))}
      </div>
    </div>
  )}
</div>

{/* Saved Spots */}
<div className="rounded-lg sm:rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm">
  <button
    onClick={toggleSaved}
    className="w-full flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 font-semibold tracking-wide hover:bg-neutral-100 hover:rounded-lg sm:hover:rounded-xl dark:hover:bg-neutral-800 transition-colors"
  >
    <span className="text-sm sm:text-base">Saved Spots</span>
    <span className="text-lg sm:text-xl font-bold transition-transform">
      {showSaved ? "−" : "+"}
    </span>
  </button>

  {showSaved && (
    <div className="border-t border-neutral-200 dark:border-neutral-700">
      <div className="px-4 sm:px-6 py-3 sm:py-4 max-h-80 overflow-y-auto space-y-3">
        {loadingSaved && (
          <div className="text-xs sm:text-sm opacity-70 animate-pulse">
            Loading saved spots…
          </div>
        )}

        {!loadingSaved && savedSpots.length === 0 && (
          <div className="text-xs sm:text-sm opacity-70">
            You haven&apos;t saved any spots yet.
          </div>
        )}

        {!loadingSaved &&
          savedSpots.map((spot) => (
            <SpotCard key={spot._id} spot={spot} />
          ))}
      </div>
    </div>
  )}
</div>

    </main>
  );
}