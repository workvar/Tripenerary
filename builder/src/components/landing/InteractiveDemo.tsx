'use client';

import { useState } from 'react';
import DayScreen from '@/components/preview/DayScreen';
import InfoScreen from '@/components/preview/InfoScreen';
import PhoneFrame from '@/components/preview/PhoneFrame';
import type { Draft } from '@/types/itinerary';

const emptyLoc = { name: '', address: '', lat: '', lng: '', placeId: '', googleMapsUrl: '' };

const SAMPLE_DEMO_TRIP: Draft = {
  version: 1,
  trip: {
    title: 'Thailand Explorer: Bangkok & Beyond',
    subtitle: '5-Day Cultural & Culinary Adventure',
    startDate: '2026-11-10',
    endDate: '2026-11-14',
    timezone: 'Asia/Bangkok',
    currency: 'THB',
    travellers: ['Alex', 'Sam'],
    coverImage: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80',
    attachments: [
      {
        id: 'att-t1',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        title: 'Flight Confirmation (TG-604)',
        kind: 'ticket',
        note: 'Saved Offline',
      },
      {
        id: 'att-t2',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        title: 'Hotel Voucher - The Siam',
        kind: 'ticket',
        note: 'Saved Offline',
      },
    ],
  },
  stays: [
    {
      id: 'stay-siam-bkk',
      key: 'siam-bkk',
      name: 'The Siam Hotel Bangkok',
      city: 'Bangkok',
      address: '3/2 Thanon Khao, Vachirapayabal, Dusit, Bangkok 10300',
      checkIn: '2026-11-10',
      checkOut: '2026-11-13',
      phone: '+66 2 206 6999',
      confirmation: 'THB-998231',
      notes: 'Riverfront suite on Chao Phraya',
      location: {
        name: 'The Siam Hotel',
        address: '3/2 Thanon Khao',
        lat: '13.7788',
        lng: '100.5056',
        placeId: '',
        googleMapsUrl: 'https://maps.google.com/?q=The+Siam+Hotel',
      },
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
      attachments: [],
    },
  ],
  days: [
    {
      id: 'day-1',
      date: '2026-11-10',
      base: 'Bangkok',
      title: 'Arrival & Grand Palace',
      summary: 'Touch down at Suvarnabhumi Airport, check in to hotel, and explore the historic Grand Palace & Emerald Buddha.',
      stayId: 'stay-siam-bkk',
      image: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800&q=80',
      notes: [
        'Remember conservative dress code (covered shoulders & knees) for Grand Palace.',
        'Carry 500 THB cash for street food stalls.',
      ],
      items: [
        {
          id: 'b1',
          time: '08:30',
          endTime: '10:00',
          title: 'Land at Suvarnabhumi Airport (BKK)',
          type: 'flight',
          description: 'Clear immigration, grab local eSIM, and meet private driver at Gate 4.',
          cost: '',
          bookingRef: 'TG-604',
          bookingUrl: '',
          location: emptyLoc,
          images: [],
          attachments: [
            {
              id: 'att-b1',
              url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
              title: 'Boarding Pass TG-604',
              kind: 'ticket',
              note: '',
            },
          ],
        },
        {
          id: 'b2',
          time: '11:00',
          endTime: '12:00',
          title: 'Check in to The Siam Hotel',
          type: 'hotel',
          description: 'Drop luggage, receive welcome drink on the Chao Phraya riverfront.',
          cost: '',
          bookingRef: 'THB-998231',
          bookingUrl: '',
          location: {
            name: 'The Siam Hotel',
            address: 'Dusit, Bangkok',
            lat: '13.7788',
            lng: '100.5056',
            placeId: '',
            googleMapsUrl: '',
          },
          images: [],
          attachments: [],
        },
        {
          id: 'b3',
          time: '14:00',
          endTime: '16:30',
          title: 'Grand Palace & Wat Phra Kaew',
          type: 'sight',
          description: 'Explore the ceremonial home of the Kings of Siam and the sacred Emerald Buddha.',
          cost: '500 THB',
          bookingRef: '',
          bookingUrl: '',
          location: {
            name: 'Grand Palace Bangkok',
            address: 'Na Phra Lan Rd, Phra Borom Maha Ratchawang, Phra Nakhon, Bangkok',
            lat: '13.7500',
            lng: '100.4913',
            placeId: '',
            googleMapsUrl: 'https://maps.google.com/?q=Grand+Palace+Bangkok',
          },
          images: [
            {
              id: 'img-b3',
              url: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80',
              caption: 'Grand Palace Bangkok',
              credit: 'Unsplash',
            },
          ],
          attachments: [],
        },
        {
          id: 'b4',
          time: '19:30',
          endTime: '21:30',
          title: 'Chinatown Michelin Street Food Crawl',
          type: 'food',
          description: 'Try Yaowarat famous seafood, toasted buns, and Guay Tiew Kua Gai noodles.',
          cost: '',
          bookingRef: '',
          bookingUrl: '',
          location: {
            name: 'Yaowarat Road',
            address: 'Samphanthawong, Bangkok',
            lat: '13.7412',
            lng: '100.5085',
            placeId: '',
            googleMapsUrl: '',
          },
          images: [],
          attachments: [],
        },
      ],
    },
    {
      id: 'day-2',
      date: '2026-11-11',
      base: 'Bangkok',
      title: 'Floating Market & Wat Arun',
      summary: 'Early morning boat tour through Damnoen Saduak floating market followed by sunset at Temple of Dawn.',
      stayId: 'stay-siam-bkk',
      image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80',
      notes: [],
      items: [
        {
          id: 'b5',
          time: '07:30',
          endTime: '11:00',
          title: 'Damnoen Saduak Floating Market',
          type: 'activity',
          description: 'Ride a long-tail boat along narrow canals filled with fresh mangoes, coconut ice cream, and noodle vendors.',
          cost: '',
          bookingRef: '',
          bookingUrl: '',
          location: {
            name: 'Damnoen Saduak Floating Market',
            address: 'Ratchaburi',
            lat: '13.5186',
            lng: '99.9599',
            placeId: '',
            googleMapsUrl: '',
          },
          images: [
            {
              id: 'img-b5',
              url: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80',
              caption: 'Floating Market',
              credit: '',
            },
          ],
          attachments: [],
        },
        {
          id: 'b6',
          time: '16:00',
          endTime: '18:00',
          title: 'Wat Arun (Temple of Dawn)',
          type: 'sight',
          description: 'Admire the intricately detailed ceramic prang towers glistening along the riverbank.',
          cost: '100 THB',
          bookingRef: '',
          bookingUrl: '',
          location: {
            name: 'Wat Arun',
            address: 'Bangkok',
            lat: '13.7437',
            lng: '100.4888',
            placeId: '',
            googleMapsUrl: '',
          },
          images: [],
          attachments: [],
        },
        {
          id: 'b7',
          time: '20:00',
          endTime: '22:00',
          title: 'Rooftop Dinner at Vertigo (Banyan Tree)',
          type: 'food',
          description: '360-degree panoramic view of Bangkok skyline at night.',
          cost: '',
          bookingRef: '',
          bookingUrl: '',
          location: emptyLoc,
          images: [],
          attachments: [],
        },
      ],
    },
    {
      id: 'day-3',
      date: '2026-11-12',
      base: 'Ayutthaya',
      title: 'Ancient Capital Ruins',
      summary: 'Take the morning train to Ayutthaya to explore UNESCO World Heritage temples and Buddha head in tree roots.',
      stayId: 'stay-siam-bkk',
      image: 'https://images.unsplash.com/photo-1608889825103-70518870213b?w=800&q=80',
      notes: [],
      items: [
        {
          id: 'b8',
          time: '08:15',
          endTime: '09:30',
          title: 'Express Train from Hua Lamphong to Ayutthaya',
          type: 'travel',
          description: 'Scenic 1-hour train ride through rural Central Thailand.',
          cost: '',
          bookingRef: '',
          bookingUrl: '',
          location: emptyLoc,
          images: [],
          attachments: [],
        },
        {
          id: 'b9',
          time: '10:00',
          endTime: '13:00',
          title: 'Wat Mahathat & Wat Chaiwatthanaram',
          type: 'sight',
          description: 'Famous stone Buddha head entwined in banyan tree roots and riverfront stupas.',
          cost: '',
          bookingRef: '',
          bookingUrl: '',
          location: {
            name: 'Wat Mahathat Ayutthaya',
            address: 'Ayutthaya',
            lat: '14.3570',
            lng: '100.5684',
            placeId: '',
            googleMapsUrl: '',
          },
          images: [],
          attachments: [],
        },
      ],
    },
  ],
  info: [
    {
      id: 'inf-1',
      title: 'Practical Information & Money',
      body: 'Cash is king for street vendors and tuk-tuks. ATMs charge a standard 220 THB fee per foreign card withdrawal.',
      image: '',
    },
    {
      id: 'inf-2',
      title: 'Local Transport Tips',
      body: 'Use Grab or Bolt apps for ride hailing. Agree on taxi meter before starting journey.',
      image: '',
    },
  ],
  contacts: [
    {
      id: 'con-1',
      label: 'Tourist Police (English 24/7)',
      value: '1155',
      type: 'phone',
    },
  ],
  emergency: {
    contacts: [
      {
        id: 'em-1',
        label: 'Medical Emergency',
        value: '1669',
        type: 'phone',
      },
    ],
    locations: [
      {
        id: 'emb-1',
        label: 'Embassy',
        name: 'US Embassy Bangkok',
        address: '95 Wireless Road, Bangkok',
        phone: '+66 2 205 4000',
        notes: '',
        location: emptyLoc,
      },
    ],
  },
};

type DemoTab = 'day' | 'info' | 'stays' | 'pdf';

export default function InteractiveDemo() {
  const [activeTab, setActiveTab] = useState<DemoTab>('day');
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const currentDay = SAMPLE_DEMO_TRIP.days[selectedDayIndex] || SAMPLE_DEMO_TRIP.days[0];

  return (
    <div className="mx-auto w-full max-w-5xl rounded-2xl border border-line bg-surface p-4 shadow-xl lg:p-6">
      {/* Top Demo Header */}
      <div className="mb-4 flex flex-col gap-4 border-b border-lineSoft pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Interactive Live Simulator</span>
          </div>
          <h3 className="text-xl font-extrabold tracking-tight text-ink">
            {SAMPLE_DEMO_TRIP.trip.title}
          </h3>
          <p className="text-xs text-muted">
            Test the mobile preview experience right here. Change days, inspect schedule blocks, and view master trip info.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex flex-wrap gap-1.5 rounded-lg bg-sunken p-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('day')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'day'
                ? 'bg-primary text-white shadow-sm'
                : 'text-ink hover:bg-white/60'
            }`}
          >
            📱 Day View
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('stays')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'stays'
                ? 'bg-primary text-white shadow-sm'
                : 'text-ink hover:bg-white/60'
            }`}
          >
            🏨 Stay Cards
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'info'
                ? 'bg-primary text-white shadow-sm'
                : 'text-ink hover:bg-white/60'
            }`}
          >
            ℹ️ Trip Info Hub
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pdf')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'pdf'
                ? 'bg-primary text-white shadow-sm'
                : 'text-ink hover:bg-white/60'
            }`}
          >
            📄 PDF Vault
          </button>
        </div>
      </div>

      {/* Simulator Frame Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Interactive Phone Simulator */}
        <div className="flex justify-center lg:col-span-6">
          <div className="w-full max-w-[360px] overflow-hidden rounded-[32px] border-[8px] border-ink bg-bg shadow-2xl">
            {/* Fake Phone Status Bar */}
            <div className="flex items-center justify-between bg-primaryDark px-5 py-2 text-[10px] font-bold text-white/80">
              <span>9:41 AM</span>
              <div className="flex items-center gap-1.5">
                <span>📶</span>
                <span>⚡ 100%</span>
              </div>
            </div>

            {/* Phone Screen Viewport */}
            <div className="h-[540px] overflow-hidden">
              <PhoneFrame>
                {activeTab === 'day' ? (
                  <DayScreen
                    draft={SAMPLE_DEMO_TRIP}
                    day={currentDay}
                    index={selectedDayIndex}
                    onSelect={setSelectedDayIndex}
                  />
                ) : null}

                {activeTab === 'info' ? (
                  <InfoScreen draft={SAMPLE_DEMO_TRIP} />
                ) : null}

                {activeTab === 'stays' ? (
                  <div className="flex flex-col gap-4 overflow-y-auto p-4">
                    <div className="rounded-xl border border-line bg-white p-4 shadow-sm">
                      <span className="rounded bg-accentSoft px-2 py-0.5 text-[10px] font-bold uppercase text-accent">
                        Hotel Stay
                      </span>
                      <h4 className="mt-1 text-base font-bold text-ink">The Siam Hotel Bangkok</h4>
                      <p className="mt-0.5 text-xs text-muted">3/2 Thanon Khao, Vachirapayabal, Dusit, Bangkok</p>
                      
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className="rounded bg-sunken px-2 py-1 font-medium">
                          📅 Check-in: Nov 10
                        </span>
                        <span className="rounded bg-sunken px-2 py-1 font-medium">
                          📅 Check-out: Nov 13
                        </span>
                      </div>

                      <div className="mt-3 rounded bg-primarySoft p-2 text-xs font-semibold text-primary">
                        Confirmation: THB-998231
                      </div>

                      <a
                        href="tel:+6622066999"
                        className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-primary py-2 text-xs font-bold text-white"
                      >
                        📞 Call Hotel Concierge
                      </a>
                    </div>
                  </div>
                ) : null}

                {activeTab === 'pdf' ? (
                  <div className="flex flex-col gap-3 overflow-y-auto p-4">
                    <div className="rounded-lg bg-primarySoft p-3 text-xs font-semibold text-primary">
                      🔒 100% Offline PDF Vault
                    </div>
                    <p className="text-xs text-muted">
                      Attached flight tickets & vouchers are saved locally to your device storage.
                    </p>

                    {SAMPLE_DEMO_TRIP.trip.attachments?.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between rounded-lg border border-line bg-white p-3 shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">📄</span>
                          <div>
                            <div className="text-xs font-bold text-ink">{doc.title}</div>
                            <div className="text-[10px] text-muted">PDF Document · Cached</div>
                          </div>
                        </div>
                        <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          Ready Offline
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </PhoneFrame>
            </div>

            {/* Fake Home Indicator */}
            <div className="flex justify-center bg-primaryDark py-1.5">
              <div className="h-1 w-28 rounded-full bg-white/30" />
            </div>
          </div>
        </div>

        {/* Right Feature Highlight Details */}
        <div className="flex flex-col justify-center gap-4 lg:col-span-6">
          <div className="rounded-xl border border-lineSoft bg-elevated p-5">
            <span className="inline-block text-xs font-bold text-accent">Feature Spotlight</span>
            
            {activeTab === 'day' && (
              <>
                <h4 className="mt-1 text-lg font-bold text-ink">Smart Date Rail & Schedule Blocks</h4>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  The thumb-reach date rail lets travelers switch days instantly without awkward stretching.
                  Full-width time blocks display flight times, hotels, sightseeing spots, and street food stops with exact coordinates and custom photos.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded bg-white px-2.5 py-1 text-xs font-semibold text-ink border border-line">
                    📍 Coordinates Auto-Pin
                  </span>
                  <span className="rounded bg-white px-2.5 py-1 text-xs font-semibold text-ink border border-line">
                    🗺️ One-Tap Maps & Route
                  </span>
                  <span className="rounded bg-white px-2.5 py-1 text-xs font-semibold text-ink border border-line">
                    🖼️ Photo Lightbox
                  </span>
                </div>
              </>
            )}

            {activeTab === 'stays' && (
              <>
                <h4 className="mt-1 text-lg font-bold text-ink">Stay Cards & Direct Calling</h4>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  Keep your hotel check-in dates, confirmation numbers, address details, and direct phone numbers linked to each day. One tap calls the front desk or launches native turn-by-turn navigation.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded bg-white px-2.5 py-1 text-xs font-semibold text-ink border border-line">
                    🏨 Multi-Hotel Support
                  </span>
                  <span className="rounded bg-white px-2.5 py-1 text-xs font-semibold text-ink border border-line">
                    📞 Direct Call Trigger
                  </span>
                </div>
              </>
            )}

            {activeTab === 'info' && (
              <>
                <h4 className="mt-1 text-lg font-bold text-ink">Emergency Contacts & Practical Guides</h4>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  Never search through emails for emergency numbers. Store tourist police, consulate contacts, embassy addresses, currency tips, and medical instructions offline.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded bg-white px-2.5 py-1 text-xs font-semibold text-ink border border-line">
                    🚨 24/7 Hotline Buttons
                  </span>
                  <span className="rounded bg-white px-2.5 py-1 text-xs font-semibold text-ink border border-line">
                    💡 Custom Practical Notes
                  </span>
                </div>
              </>
            )}

            {activeTab === 'pdf' && (
              <>
                <h4 className="mt-1 text-lg font-bold text-ink">Offline PDF Document Vault</h4>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  Attach PDF tickets, airline boarding passes, insurance docs, and train passes to schedule items or stay cards. They download automatically and remain available offline inside your phone's native PDF reader.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded bg-white px-2.5 py-1 text-xs font-semibold text-ink border border-line">
                    ✈️ In-Flight Ticket Access
                  </span>
                  <span className="rounded bg-white px-2.5 py-1 text-xs font-semibold text-ink border border-line">
                    🧹 Storage Manager
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Interactive Day Rail Picker for Demo */}
          {activeTab === 'day' && (
            <div className="rounded-xl border border-line p-4 bg-surface">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Select Day in Sample Trip:</span>
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                {SAMPLE_DEMO_TRIP.days.map((d, i) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDayIndex(i)}
                    className={`flex flex-col rounded-lg px-3 py-2 text-left text-xs transition ${
                      selectedDayIndex === i
                        ? 'bg-primary text-white font-bold shadow'
                        : 'bg-sunken text-ink hover:bg-primarySoft'
                    }`}
                  >
                    <span>Day {i + 1}</span>
                    <span className="text-[10px] opacity-80">{d.base}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
