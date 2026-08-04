import { Linking, Platform } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import { fileFor } from './files';
import type { Attachment, AttachmentKind } from '@/types';

/** FLAG_GRANT_READ_URI_PERMISSION. Without it the viewer is handed a URI it is
 *  not allowed to read, and opens on a blank page. */
const GRANT_READ = 1;

const KIND_MIME: Readonly<Record<AttachmentKind, string>> = {
  pdf: 'application/pdf',
  image: 'image/*',
  doc: 'application/msword',
  ticket: 'application/vnd.apple.pkpass',
  link: '*/*',
};

/**
 * Open the cached copy in whatever app the phone uses for that file type.
 *
 * Android will not accept a bare `file://` URI from another app — it throws
 * FileUriExposedException — so the file is handed over as a `content://` URI
 * through the FileProvider that expo-file-system already registers, with an
 * explicit VIEW intent. Everywhere else, handing the local URI to the OS is enough.
 */
export async function openCached(tripId: string, attachment: Attachment): Promise<boolean> {
  try {
    const file = fileFor(tripId, attachment);
    if (!file.exists || file.size <= 0) return false;

    if (Platform.OS !== 'android') {
      await Linking.openURL(file.uri);
      return true;
    }

    await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
      data: file.contentUri,
      flags: GRANT_READ,
      type: file.type || KIND_MIME[attachment.kind],
    });
    return true;
  } catch {
    return false;
  }
}

/** Fall back to the original link, letting the browser or a remote viewer handle it. */
export async function openRemote(attachment: Attachment): Promise<boolean> {
  try {
    await Linking.openURL(attachment.url);
    return true;
  } catch {
    return false;
  }
}
