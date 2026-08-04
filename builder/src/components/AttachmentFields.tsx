'use client';

import { Grid2, Select, Text } from '@/components/Field';
import Button, { IconButton } from '@/components/ui/Button';
import TextInput from '@/components/ui/TextInput';
import { newAttachment } from '@/lib/factories';
import { ATTACHMENT_KINDS } from '@/types/itinerary';
import type { AttachmentKind, DraftAttachment } from '@/types/itinerary';

const KIND_META: Record<AttachmentKind, string> = {
  pdf: '\u{1F4C4}  PDF',
  image: '\u{1F5BC}  Image',
  doc: '\u{1F4DD}  Doc',
  ticket: '\u{1F3AB}  Ticket',
  link: '\u{1F517}  Link',
};

const KIND_OPTIONS = ATTACHMENT_KINDS.map((k) => ({ value: k, label: KIND_META[k] }));

interface Props {
  readonly attachments: DraftAttachment[];
  readonly onChange: (next: DraftAttachment[]) => void;
  readonly label?: string;
  readonly hint?: string;
}

/** Links to booking PDFs and tickets. The phone hands the URL to its own viewer,
 *  so the file has to be reachable without a login. */
export default function AttachmentFields({
  attachments,
  onChange,
  label = 'Documents',
  hint = 'Flight tickets, booking confirmations, show tickets. Use a direct, publicly reachable link.',
}: Props) {
  const set = (id: string, patch: Partial<DraftAttachment>) =>
    onChange(attachments.map((a) => (a.id === id ? { ...a, ...patch } : a)));

  return (
    <div className="rounded-sm border border-lineSoft bg-elevated p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
          {label} {attachments.length > 0 ? `(${attachments.length})` : null}
        </span>
        <Button
          size="xs"
          variant="subtle"
          onClick={() => onChange([...attachments, newAttachment()])}
        >
          + Add document
        </Button>
      </div>

      {attachments.length === 0 ? <p className="text-xs text-faint">{hint}</p> : null}

      <div className="space-y-3">
        {attachments.map((a) => (
          <div key={a.id} className="space-y-2">
            <div className="flex gap-2">
              <TextInput
                value={a.url}
                placeholder="https://.../boarding-pass.pdf"
                onChange={(e) => set(a.id, { url: e.target.value })}
              />
              <IconButton
                label="Remove document"
                variant="danger"
                size="md"
                onClick={() => onChange(attachments.filter((x) => x.id !== a.id))}
              >
                {'\u{2715}'}
              </IconButton>
            </div>
            <Grid2>
              <Text
                label="Title"
                value={a.title}
                placeholder="Boarding pass · BKK to CNX"
                onChange={(v) => set(a.id, { title: v })}
              />
              <Select<AttachmentKind>
                label="Kind"
                value={a.kind}
                onChange={(kind) => set(a.id, { kind })}
                options={KIND_OPTIONS}
              />
            </Grid2>
            <Text
              label="Note"
              value={a.note}
              placeholder="Confirmation ABC123"
              onChange={(v) => set(a.id, { note: v })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
