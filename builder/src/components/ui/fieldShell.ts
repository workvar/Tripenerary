/** The visual shell every text-entry surface shares: input, textarea and the
 *  trigger of the custom dropdown. Keeping it here means a border tweak lands
 *  on all three at once. */

export {
  CONTROL_HEIGHT,
  CONTROL_PAD,
  CONTROL_TEXT,
  cx,
  type ControlSize,
} from '@/components/ui/tokens';

export const FIELD_SHELL =
  'w-full rounded-sm border border-line bg-white text-ink outline-none transition ' +
  'placeholder:text-faint focus:border-primary focus:ring-2 focus:ring-primary/15 ' +
  'disabled:cursor-not-allowed disabled:bg-sunken disabled:text-muted';
