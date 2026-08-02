/** Types for Chrome's built-in Prompt API (Gemini Nano, runs on-device).
 *  Two shapes exist in the wild: the current global `LanguageModel` and the
 *  older `window.ai.languageModel`. Both are declared here. */

export type Availability = 'unavailable' | 'downloadable' | 'downloading' | 'available';

export interface DownloadMonitor {
  addEventListener(
    type: 'downloadprogress',
    listener: (event: { loaded: number; total?: number }) => void
  ): void;
}

export interface CreateOptions {
  readonly initialPrompts?: readonly { readonly role: 'system' | 'user'; readonly content: string }[];
  readonly temperature?: number;
  readonly topK?: number;
  readonly signal?: AbortSignal;
  readonly monitor?: (m: DownloadMonitor) => void;
}

export interface LanguageModelSession {
  prompt(input: string, options?: { signal?: AbortSignal }): Promise<string>;
  destroy(): void;
}

export interface LanguageModelFactory {
  availability?(): Promise<Availability>;
  capabilities?(): Promise<{ available: 'no' | 'readily' | 'after-download' }>;
  create(options?: CreateOptions): Promise<LanguageModelSession>;
}

declare global {
  interface Window {
    LanguageModel?: LanguageModelFactory;
    ai?: { languageModel?: LanguageModelFactory };
  }
}

export type AiStatus =
  | 'checking'
  | 'unsupported'
  | 'needs-download'
  | 'downloading'
  | 'ready'
  | 'working'
  | 'error';
