'use client';

interface Props {
  readonly notes: string[];
  readonly onChange: (next: string[]) => void;
}

/** Free-form tips shown under the schedule on the day screen. */
export default function NotesEditor({ notes, onChange }: Props) {
  return (
    <div className="rounded-md border border-line bg-white p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
          Day notes {notes.length > 0 ? `(${notes.length})` : null}
        </span>
        <button
          type="button"
          className="text-xs font-semibold text-primary"
          onClick={() => onChange([...notes, ''])}
        >
          + Add note
        </button>
      </div>

      {notes.length === 0 ? <p className="text-xs text-faint">No notes for this day.</p> : null}

      <div className="space-y-2">
        {notes.map((note, i) => (
          <div key={i} className="flex gap-2">
            <textarea
              className="field resize-y"
              rows={2}
              value={note}
              placeholder="Buy a SIM at arrivals, 300 to 600 baht."
              onChange={(e) => onChange(notes.map((n, j) => (j === i ? e.target.value : n)))}
            />
            <button
              type="button"
              className="btn-mini self-start hover:border-danger hover:text-danger"
              onClick={() => onChange(notes.filter((_, j) => j !== i))}
              title="Remove note"
            >
              {'\u{2715}'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
