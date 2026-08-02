'use client';

import { validate } from '@/lib/stats';
import type { Draft } from '@/types/itinerary';

export default function IssueList({ draft }: { readonly draft: Draft }) {
  const issues = validate(draft);
  if (issues.length === 0) {
    return (
      <div className="rounded-md border border-lineSoft bg-primarySoft p-3 text-sm font-semibold text-primary">
        {'\u{2713}'} No problems found. The export will load cleanly in the app.
      </div>
    );
  }

  return (
    <ul className="space-y-1.5">
      {issues.map((issue, i) => (
        <li
          key={i}
          className={`flex gap-2 rounded-sm border p-2.5 text-[13px] ${
            issue.level === 'error'
              ? 'border-danger/25 bg-dangerSoft text-danger'
              : 'border-line bg-elevated text-muted'
          }`}
        >
          <span className="font-bold">{issue.level === 'error' ? '!' : '?'}</span>
          <span>{issue.message}</span>
        </li>
      ))}
    </ul>
  );
}
