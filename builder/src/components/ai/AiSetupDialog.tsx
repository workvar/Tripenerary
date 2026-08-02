'use client';

import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

const STEPS: readonly { readonly title: string; readonly body: string }[] = [
  {
    title: 'Use Chrome 138 or newer, on desktop',
    body: 'The model runs on your machine, so it needs desktop Chrome on Windows, macOS or Linux. It is not in Safari, Firefox or Chrome on mobile.',
  },
  {
    title: 'Turn on the on-device model',
    body: 'Open chrome://flags/#optimization-guide-on-device-model and set it to "Enabled BypassPerfRequirement".',
  },
  {
    title: 'Turn on the Prompt API',
    body: 'Open chrome://flags/#prompt-api-for-gemini-nano and set it to "Enabled", then restart Chrome.',
  },
  {
    title: 'Let the model download',
    body: 'Check chrome://components and update "Optimization Guide On Device Model". It is a few gigabytes and downloads once.',
  },
];

interface Props {
  readonly onClose: () => void;
  readonly onRetry: () => void;
}

export default function AiSetupDialog({ onClose, onRetry }: Props) {
  return (
    <Modal
      width="md"
      title="Turn on Chrome's built-in AI"
      subtitle="Descriptions are written on your own machine. Nothing about your trip is sent anywhere."
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Not now</Button>
          <Button
            variant="primary"
            onClick={() => {
              onRetry();
              onClose();
            }}
          >
            I have done this
          </Button>
        </>
      }
    >
      <ol className="space-y-3">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primarySoft text-xs font-bold text-primary">
              {i + 1}
            </span>
            <span>
              <span className="block text-sm font-bold text-ink">{step.title}</span>
              <span className="block text-[13px] leading-relaxed text-muted">{step.body}</span>
            </span>
          </li>
        ))}
      </ol>

      <p className="mt-4 rounded-sm bg-elevated p-3 text-[12px] text-muted">
        Chrome flags cannot be opened by a page, so paste those addresses into the address bar
        yourself. Everything in the builder works without this; the AI button is only a shortcut.
      </p>
    </Modal>
  );
}
