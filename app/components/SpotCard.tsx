import Link from "next/link";

type Spot = {
    _id: string;
    title: string;
    description: string;
    tags?: string[];
    distanceKm?: number;
};

export default function SpotCard({ spot }: { spot: Spot }) {
    return (
        <div className="rounded-2xl p-5 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm hover:shadow transition">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="text-lg font-semibold">{spot.title}</h3>
                    {typeof spot.distanceKm === "number" && (
                        <p className="text-xs opacity-70 mt-0.5">{spot.distanceKm} km away</p>
                    )}
                </div>
                <Link href={`/spots/${spot._id}`} className="text-sm underline cursor-pointer hover:opacity-80 transition">View</Link>
            </div>
            <p className="text-sm opacity-80 line-clamp-3 mt-2">{spot.description}</p>
            {spot.tags && spot.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                    {spot.tags.map((t) => (
                        <span key={t} className="text-xs border rounded px-2 py-0.5 opacity-80">{t}</span>
                    ))}
                </div>
            )}
            <div className="mt-3 flex gap-3 text-sm">
                <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.title)}&query_place_id=`}
                    target="_blank"
                    rel="noreferrer"
                    className="underline cursor-pointer hover:opacity-80 transition"
                >
                    View on Google Maps
                </a>
            </div>
        </div>
    );
}


