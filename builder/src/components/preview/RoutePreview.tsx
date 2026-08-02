'use client';

import { project, type RouteStop } from '@/lib/route';

const W = 322;
const H = 200;

/** Schematic version of the app's day route map: the same ordered stops and the
 *  same dashed leg home, drawn as SVG so no maps key is needed in the browser. */
export default function RoutePreview({ stops }: { readonly stops: RouteStop[] }) {
  if (stops.length < 2) return null;

  const points = project(stops, W, H);
  const closes = Boolean(stops[0]?.isStay);
  const path = points.map((p) => `${p.x},${p.y}`).join(' ');
  const first = points[0];
  const last = points[points.length - 1];

  return (
    <div className="overflow-hidden rounded-lg border border-lineSoft bg-white shadow-sm">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="block bg-sunken">
        <defs>
          <pattern id="route-grid" width="26" height="26" patternUnits="userSpaceOnUse">
            <path d="M26 0H0V26" fill="none" stroke="#E3DFD6" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#route-grid)" />

        <polyline points={path} fill="none" stroke="#0E4F4C" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />

        {closes && first && last ? (
          <line
            x1={last.x}
            y1={last.y}
            x2={first.x}
            y2={first.y}
            stroke="#D9713C"
            strokeWidth="3"
            strokeDasharray="6 6"
            strokeLinecap="round"
          />
        ) : null}

        {stops.map((stop, i) => {
          const p = points[i];
          if (!p) return null;
          return (
            <g key={stop.key}>
              <circle cx={p.x} cy={p.y} r="13" fill={stop.isStay ? '#D9713C' : '#0E4F4C'} stroke="#fff" strokeWidth="2.5" />
              <text
                x={p.x}
                y={p.y + 4}
                textAnchor="middle"
                fill="#fff"
                fontSize="11"
                fontWeight="800"
                fontFamily="ui-sans-serif, system-ui"
              >
                {stop.label}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="border-t border-lineSoft px-4 py-3 text-center text-[13px] font-bold text-primary">
        Open route in Maps {'\u{203A}'}
      </div>
    </div>
  );
}
