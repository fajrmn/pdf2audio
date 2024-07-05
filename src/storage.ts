
import { PATH_MAP, HF_BASE } from "./fixtures";
import { fetchBlob } from "./http";
import { removeBlob, writeBlob } from "./opfs";
import { ProgressCallback, VoiceId } from "./types";

/**
 * Prefetch a model for later use
 */
export async function download(voiceId: VoiceId, callback?: ProgressCallback): Promise<void> {
  const path = PATH_MAP[voiceId];
  const urls = [`${HF_BASE}/${path}`, `${HF_BASE}/${path}.json`]

  await Promise.all(urls.map(async (url) => {
    writeBlob(url, await fetchBlob(url, callback));
  }));
}

/**
 * Remove a model from opfs
 */
export async function remove(voiceId: VoiceId) {
  const path = PATH_MAP[voiceId];
  const urls = [`${HF_BASE}/${path}`, `${HF_BASE}/${path}.json`]

  await Promise.all(urls.map(url => removeBlob(url)));
}

/**
 * Get all stored models
 */
export async function stored(): Promise<VoiceId[]> {
  const root = await navigator.storage.getDirectory();
  const dir = await root.getDirectoryHandle('piper', {
    create: true,
  });
  const result: VoiceId[] = [];

  // @ts-ignore
  for await (const name of dir.keys()) {
    const key = name.split('.')[0];
    if (name.endsWith('.onnx') && key in PATH_MAP) {
      result.push(key);
    }
  }

  return result;
}

/**
 * Delete the models directory
 */
export async function flush() {
  const root = await navigator.storage.getDirectory();
  const dir = await root.getDirectoryHandle('piper', {
    create: true,
  });

  // @ts-ignore
  await dir.remove({ recursive: true });
}
