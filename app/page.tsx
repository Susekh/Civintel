'use client'
import Link from "next/link";
import Image from "next/image";

import conf from "./conf/conf";
import LightRays from "@/components/LightRays";

export default function HomePage() {
  return (
    <main className="min-h-[calc(100vh-64px)] relative">
      {/* Hero Background */}
      <div className="absolute inset-0 z-0">
        <LightRays
          raysOrigin="top-center"
          raysColor="#8000FF"
          raysSpeed={1.5}
          lightSpread={0.8}
          rayLength={1.2}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0.1}
          distortion={0.05}
          className="custom-rays"
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Hero Content */}
      <section className="relative z-10">
        <div className="mx-auto max-w-7xl px-6 py-32 flex flex-col lg:flex-row items-center lg:justify-between gap-12">
          
          {/* Text Content */}
          <div className="space-y-8 text-white text-center lg:text-left">
            <div className="space-y-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full border border-white/50 text-sm">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2" />
                Community-powered civic intelligence
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                Report and discover
                <br />
                <span className="text-purple-300">real-world situations</span>
              </h1>
            </div>

            <p className="text-lg md:text-xl max-w-lg leading-relaxed mx-auto lg:mx-0">
              CivIntel helps you stay aware of what&apos;s happening around you through verified community reports.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                href="/spots/nearby"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-purple-500/80 hover:bg-purple-500 transition-colors font-medium text-black"
              >
                View nearby reports
              </Link>

              <Link
                href="/spots/new"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-purple-300/70 hover:bg-purple-500/20 transition-colors font-medium text-white"
              >
                Submit a report
              </Link>
            </div>
          </div>

          {/* Minimal Hero Illustration */}
          <div className="hidden lg:flex rounded-3xl p-4 items-center justify-center bg-white/10 overflow-hidden">
            <Image
              src={conf.heroImage}
              alt="CivIntel Hero Illustration"
              width={400}
              height={400}
              className="object-contain rounded-2xl"
              priority
            />
          </div>

        </div>
      </section>
    </main>
  );
}
