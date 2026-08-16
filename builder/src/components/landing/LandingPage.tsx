'use client';

import { useState } from 'react';
import Link from 'next/link';
import InteractiveDemo from '@/components/landing/InteractiveDemo';

const FAQ_ITEMS = [
  {
    question: 'How does Tripenerary work without a database lock-in?',
    answer:
      'Tripenerary uses standard, human-readable JSON files as the source of truth for itineraries. You can create or edit your trip using our Visual Web Builder, host the resulting JSON on GitHub Gists, Google Drive, Dropbox, or any public web server, and paste the URL into the mobile app.',
  },
  {
    question: 'Does the mobile app work completely offline?',
    answer:
      'Yes! Every trip you add is automatically downloaded and cached on your device storage along with all attached PDF flight tickets, hotel vouchers, and images. Even if you have zero cell signal or airplane mode turned on, your full day-by-day itinerary remains accessible.',
  },
  {
    question: 'How do map routes and turn-by-turn directions work?',
    answer:
      'Every schedule item can hold latitude and longitude coordinates. You can paste a Google Maps URL directly into the Visual Builder, and it automatically extracts the coordinates. Tapping "Open in Maps" or "Directions" on the mobile app launches native Google Maps or Apple Maps.',
  },
  {
    question: 'Can I print my itinerary or save it as a PDF?',
    answer:
      'Yes! The Visual Builder includes a PDF export engine that generates crisp, printable A4 pages with real searchable text. You can download an A4 sheet for a single day or export the entire multi-day trip as a single travel book PDF.',
  },
  {
    question: 'Is sign-in required to use the Visual Builder or mobile app?',
    answer:
      'No. Sign-in is 100% optional. The Visual Builder autosaves your drafts locally in your browser storage. If you choose to sign in with Firebase, your trips and display preferences will sync across devices.',
  },
];

export default function LandingPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-bg text-ink font-sans selection:bg-accentSoft selection:text-accent">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-line/80 bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-md transition group-hover:scale-105">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
              </svg>
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-ink">Tripenerary</span>
              <span className="ml-2 rounded-full bg-accentSoft px-2 py-0.5 text-[10px] font-bold text-accent">
                Companion
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex text-sm font-semibold text-muted">
            <a href="#features" className="transition hover:text-primary">Features</a>
            <a href="#demo" className="transition hover:text-primary">Live Demo</a>
            <a href="#workflow" className="transition hover:text-primary">How It Works</a>
            <a href="#pdf" className="transition hover:text-primary">PDF Books</a>
            <a href="#faq" className="transition hover:text-primary">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/builder"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-xs font-extrabold text-white shadow-sm transition hover:bg-primaryDark hover:shadow-md"
            >
              Launch Visual Builder →
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primarySoft px-4 py-1.5 text-xs font-bold text-primary">
            <span className="flex h-2 w-2 rounded-full bg-primary" />
            Open-Source & Offline-First Travel Companion
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl lg:leading-[1.15]">
            Turn Your JSON Itineraries into <br />
            <span className="text-primary">Beautiful Travel Companions.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            Build day-by-day trips in a visual web editor or hand-craft raw JSON.
            Enjoy 100% offline access, smart thumb-reach date rails, route maps, ticket document vaults, and printable A4 travel books.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/builder"
              className="w-full rounded-xl bg-primary px-8 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-primaryDark hover:shadow-xl sm:w-auto"
            >
              Launch Visual Builder
            </Link>
            <a
              href="#demo"
              className="w-full rounded-xl border border-line bg-surface px-8 py-3.5 text-sm font-bold text-ink shadow-sm transition hover:bg-sunken sm:w-auto"
            >
              Explore Interactive Demo ↓
            </a>
          </div>

          {/* Quick Platform Badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-muted">
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-600">✓</span> iOS & Android App
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-600">✓</span> Web Visual Builder
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-600">✓</span> 100% Offline Access
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-600">✓</span> Zero Locked Formats
            </span>
          </div>
        </div>

        {/* Hero Interactive Preview Anchor */}
        <div id="demo" className="mx-auto mt-16 max-w-6xl">
          <InteractiveDemo />
        </div>
      </section>

      {/* Metrics & Value Props Banner */}
      <section className="border-y border-line bg-surface py-12 px-6">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 md:grid-cols-4 text-center">
          <div>
            <div className="text-3xl font-extrabold text-primary">100%</div>
            <div className="mt-1 text-xs font-bold text-muted uppercase tracking-wider">Offline Capable</div>
            <p className="mt-1 text-[11px] text-faint">Itineraries & PDF tickets cached locally</p>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-accent">0</div>
            <div className="mt-1 text-xs font-bold text-muted uppercase tracking-wider">Forced Logins</div>
            <p className="mt-1 text-[11px] text-faint">Privacy-first, works fully offline</p>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-primary">8</div>
            <div className="mt-1 text-xs font-bold text-muted uppercase tracking-wider">Block Types</div>
            <p className="mt-1 text-[11px] text-faint">Flight, Stay, Sight, Food, Rest & more</p>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-accent">A4</div>
            <div className="mt-1 text-xs font-bold text-muted uppercase tracking-wider">PDF Travel Book</div>
            <p className="mt-1 text-[11px] text-faint">Vector-sharp printable day pages</p>
          </div>
        </div>
      </section>

      {/* Features Showcase Grid */}
      <section id="features" className="px-6 py-20 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <span className="text-xs font-extrabold uppercase tracking-widest text-accent">
              Comprehensive Feature Set
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Everything You Need for Effortless Journeys
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-muted">
              Designed to eliminate internet anxiety on the road and give you full control over your travel plans.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm transition hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primarySoft text-primary text-xl">
                🖥️
              </div>
              <h3 className="mt-4 text-base font-bold text-ink">Visual Editor & Phone Simulator</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Split-screen visual web editor with a live phone preview. Edit days, stays, schedule blocks, and verify checks in real time.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm transition hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accentSoft text-accent text-xl">
                📱
              </div>
              <h3 className="mt-4 text-base font-bold text-ink">Smart Thumb-Reach Date Rail</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Scrollable bottom date strip anchored comfortably within thumb reach. Features a dot indicator for today and a floating "Jump to Today" bar.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm transition hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primarySoft text-primary text-xl">
                🗺️
              </div>
              <h3 className="mt-4 text-base font-bold text-ink">Map Routes & Directions</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Auto-extract coordinates from Google Maps URLs. View embedded preview maps and route lines from your hotel through daily stops.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm transition hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accentSoft text-accent text-xl">
                📄
              </div>
              <h3 className="mt-4 text-base font-bold text-ink">Offline PDF Document Vault</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Attach PDF flight tickets, hotel vouchers, and train passes to schedule items or stay cards. They download once and open offline inside your device's viewer.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm transition hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primarySoft text-primary text-xl">
                🖨️
              </div>
              <h3 className="mt-4 text-base font-bold text-ink">Printable A4 Travel Books</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Generate crisp, printable A4 pages for single days or the entire itinerary. Formatted with left-margin times, stay headers, and vector text.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm transition hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accentSoft text-accent text-xl">
                ℹ️
              </div>
              <h3 className="mt-4 text-base font-bold text-ink">Master Trip Info Hub</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Access emergency hotline numbers, consulate addresses, local currency advice, weather guidance, and medical notes offline in one tap.
              </p>
            </div>

            {/* Feature 7 */}
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm transition hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primarySoft text-primary text-xl">
                🌐
              </div>
              <h3 className="mt-4 text-base font-bold text-ink">Flexible Open JSON Hosting</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Host your itinerary JSON anywhere: GitHub Gists, Google Drive, Dropbox, or custom web servers. Automatic URL rewriting makes sharing seamless.
              </p>
            </div>

            {/* Feature 8 */}
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm transition hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accentSoft text-accent text-xl">
                🖼️
              </div>
              <h3 className="mt-4 text-base font-bold text-ink">Full-Screen Photo Lightbox</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Trips, days, and schedule items support high-resolution cover photos with full-screen pinch-to-zoom, pan, double-tap, and flick-to-close gestures.
              </p>
            </div>

            {/* Feature 9 */}
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm transition hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primarySoft text-primary text-xl">
                ☁️
              </div>
              <h3 className="mt-4 text-base font-bold text-ink">Optional Cloud Sync</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Without Firebase keys, the app stays 100% local. With Firebase configured, optional sign-in syncs your trip library and display preferences across devices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Workflow */}
      <section id="workflow" className="border-t border-line bg-elevated py-20 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <span className="text-xs font-extrabold uppercase tracking-widest text-primary">
              Simple 3-Step Workflow
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              From Planning to Traveling Offline
            </h2>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="relative rounded-2xl border border-line bg-surface p-6 shadow-sm">
              <div className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bold text-white text-xs">
                1
              </div>
              <h3 className="mt-2 text-base font-bold text-ink">Build or Import</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Use the Visual Web Builder form tabs (Days, Trip, Stays, Info, Checks) or import an existing JSON file from disk, URL, or raw text.
              </p>
            </div>

            <div className="relative rounded-2xl border border-line bg-surface p-6 shadow-sm">
              <div className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-accent font-bold text-white text-xs">
                2
              </div>
              <h3 className="mt-2 text-base font-bold text-ink">Publish or Share</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Click "Publish link" to upload to Storage, or host the exported JSON file on GitHub Gist, Google Drive, or Dropbox.
              </p>
            </div>

            <div className="relative rounded-2xl border border-line bg-surface p-6 shadow-sm">
              <div className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bold text-white text-xs">
                3
              </div>
              <h3 className="mt-2 text-base font-bold text-ink">Travel Offline</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Paste the URL into the mobile app's "Add trip" sheet. The app saves a local copy, updates daily, and works 100% offline during your trip.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PDF Spotlight Section */}
      <section id="pdf" className="px-6 py-20">
        <div className="mx-auto max-w-5xl rounded-3xl border border-line bg-primary text-white p-8 lg:p-12 shadow-xl">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                Printable Travel Books
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
                Export Vector-Sharp A4 PDFs
              </h2>
              <p className="mt-4 text-sm leading-relaxed opacity-90 text-primarySoft">
                Need a paper backup or printed guide? The built-in PDF generator renders clean, structured A4 pages for every day of your journey. Sized perfectly for printing or saving to Apple Books and Google Drive.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold">
                  📄 Single-Day A4 Sheets
                </span>
                <span className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold">
                  📚 Multi-Day Travel Book
                </span>
                <span className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold">
                  🔍 Searchable Real Text
                </span>
              </div>
            </div>

            <div className="flex justify-center lg:col-span-5">
              <div className="w-full max-w-[260px] rounded-xl border border-white/20 bg-white p-4 text-ink shadow-2xl">
                <div className="border-b border-line pb-2">
                  <div className="text-[10px] font-bold uppercase text-primary">Day 2 · Bangkok</div>
                  <div className="text-sm font-extrabold">Floating Market & Wat Arun</div>
                  <div className="text-[9px] text-muted">Nov 11, 2026 · Base: Bangkok</div>
                </div>
                <div className="mt-3 space-y-2 text-[10px]">
                  <div className="flex gap-2">
                    <span className="font-bold text-accent">07:30</span>
                    <span>Damnoen Saduak Market</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-accent">16:00</span>
                    <span>Wat Arun Temple</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-accent">20:00</span>
                    <span>Rooftop Dinner</span>
                  </div>
                </div>
                <div className="mt-4 border-t border-lineSoft pt-2 text-center text-[9px] text-muted font-bold">
                  A4 Printable Format · Page 2 of 5
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="border-t border-line bg-surface py-20 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <span className="text-xs font-extrabold uppercase tracking-widest text-accent">
              Why Choose Tripenerary?
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink">
              Tripenerary vs. Traditional Travel Apps
            </h2>
          </div>

          <div className="mt-12 overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line bg-sunken text-ink uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-4">Feature</th>
                  <th className="px-6 py-4 text-primary">Tripenerary</th>
                  <th className="px-6 py-4 text-muted">Typical Commercial Apps</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lineSoft">
                <tr>
                  <td className="px-6 py-4 font-bold text-ink">Data Control</td>
                  <td className="px-6 py-4 font-bold text-emerald-700">Open JSON standard, host anywhere</td>
                  <td className="px-6 py-4 text-muted">Locked inside proprietary database</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-bold text-ink">Offline Reliability</td>
                  <td className="px-6 py-4 font-bold text-emerald-700">100% offline (itineraries & PDF tickets)</td>
                  <td className="px-6 py-4 text-muted">Requires active internet / drops data</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-bold text-ink">Account Requirement</td>
                  <td className="px-6 py-4 font-bold text-emerald-700">Zero sign-in needed (optional sync)</td>
                  <td className="px-6 py-4 text-muted">Mandatory registration & tracking</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-bold text-ink">PDF Export</td>
                  <td className="px-6 py-4 font-bold text-emerald-700">Printable A4 day sheets & full books</td>
                  <td className="px-6 py-4 text-muted">No print output or paid premium tier</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-bold text-ink">Maps & Routing</td>
                  <td className="px-6 py-4 font-bold text-emerald-700">Native Google & Apple Maps one-tap</td>
                  <td className="px-6 py-4 text-muted">In-app webview with ads</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <span className="text-xs font-extrabold uppercase tracking-widest text-primary">
              Got Questions?
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mt-12 space-y-4">
            {FAQ_ITEMS.map((item, index) => (
              <div
                key={item.question}
                className="rounded-2xl border border-line bg-surface p-5 transition shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="flex w-full items-center justify-between text-left text-sm font-bold text-ink"
                >
                  <span>{item.question}</span>
                  <span className="ml-4 text-lg font-bold text-primary">
                    {openFaqIndex === index ? '−' : '+'}
                  </span>
                </button>

                {openFaqIndex === index ? (
                  <p className="mt-3 text-xs leading-relaxed text-muted border-t border-lineSoft pt-3">
                    {item.answer}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="border-t border-line bg-elevated py-20 px-6 text-center">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Ready to Plan Your Next Journey?
          </h2>
          <p className="mt-3 text-sm text-muted">
            Start building your trip in the split-screen web editor right now—no registration required.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/builder"
              className="w-full rounded-xl bg-primary px-8 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-primaryDark sm:w-auto"
            >
              Launch Visual Builder →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line bg-surface py-12 px-6 text-xs text-muted">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-ink">Tripenerary</span>
            <span>· Open JSON Travel Companion</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/builder" className="transition hover:text-primary">
              Visual Builder
            </Link>
            <a href="#features" className="transition hover:text-primary">
              Features
            </a>
            <a href="#faq" className="transition hover:text-primary">
              FAQ
            </a>
          </div>

          <div>
            Built with React Native, Expo & Next.js
          </div>
        </div>
      </footer>
    </div>
  );
}
