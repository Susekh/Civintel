"use client";
import { useEffect, useState, useTransition } from "react";
import { User as UserIcon, Calendar } from "lucide-react";

type Comment = {
  _id: string;
  username: string;
  content: string;
  createdAt: string;
};

export default function Comments({ spotId }: { spotId: string }) {
  const [isPending, startTransition] = useTransition();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/spots/${spotId}/comments`, {
      cache: "no-store",
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to load comments");
      return;
    }
    setComments(data.comments || []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotId]);

  function maskUsername(username: string) {
    if (!username) return "anon";
    const start = username.slice(0, 2);
    const end = username.slice(-2);
    const hash = Math.random().toString(36).substring(2, 6);
    return `${start}**${end}-${hash}`;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!content.trim()) return;

    startTransition(async () => {
      const res = await fetch(`/api/spots/${spotId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to add comment");
        return;
      }
      setContent("");
      await load();
    });
  }

  return (
    <div className="space-y-4">
      {/* Comment Input Form */}
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 border rounded px-3 py-2 bg-transparent text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-600 focus:ring-purple-500 focus:border-purple-500 transition duration-150"
          placeholder="Add a comment"
          disabled={isPending}
        />
        <button
          disabled={isPending || !content.trim()}
          className="px-4 py-2 rounded bg-purple-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition"
        >
          {isPending ? "Posting..." : "Post"}
        </button>
      </form>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Comments List */}
      <div className="space-y-3">
        {comments.map((c) => (
          <div
            key={c._id}
            className="p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-900 shadow-sm"
          >
            {/* Compact Header: Username and Date */}
            <div className="flex items-center justify-between mb-2">
              {/* Username Tag */}
              <div className="flex items-center text-xs font-semibold tracking-wide border border-neutral-800 dark:border-neutral-700 bg-neutral-800 dark:bg-neutral-800 text-neutral-300 py-0.5 px-2 rounded-full">
                <UserIcon className="h-3 w-3 mr-1.5 text-purple-400" />
                {maskUsername(c.username)}
              </div>

              {/* Date Stamp */}
              <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-500">
                <Calendar className="h-3 w-3 mr-1 opacity-70" />
                {new Date(c.createdAt).toLocaleDateString()}
              </div>
            </div>

            {/* Comment Content */}
            <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
              {c.content}
            </p>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-sm opacity-70 text-center py-4 text-neutral-500 dark:text-neutral-400">
            Be the first to leave a comment!
          </p>
        )}
      </div>
    </div>
  );
}
