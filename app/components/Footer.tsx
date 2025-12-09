import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid md:grid-cols-3 gap-8 text-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-foreground text-background grid place-items-center font-bold">S</div>
            <span className="font-semibold">Civintel</span>
          </div>
          <p className="opacity-70">Discover and share the best around you.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="font-medium">Explore</p>
            <ul className="space-y-1 opacity-80">
              <li><Link href="/spots/nearby" className="hover:opacity-100">Nearby</Link></li>
              <li><Link href="/spots/new" className="hover:opacity-100">Add report</Link></li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="font-medium">Account</p>
            <ul className="space-y-1 opacity-80">
              <li><Link href="/dashboard" className="hover:opacity-100">Dashboard</Link></li>
              <li><Link href="/auth" className="hover:opacity-100">Sign in</Link></li>
            </ul>
          </div>
        </div>
        <div className="opacity-60">
          <p>© {new Date().getFullYear()} Civintel. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}


