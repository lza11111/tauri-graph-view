import type { InvokeArgs } from "@tauri-apps/api/tauri";
import type { appWindow as IAppWindow } from '@tauri-apps/api/window';

const isNode = (): boolean =>
  Object.prototype.toString.call(typeof process !== "undefined" ? process : 0) ===
  "[object process]";

export async function invoke<T>(
  cmd: string,
  args?: InvokeArgs | undefined,
): Promise<T> {
  if (isNode()) {
    // This shouldn't ever happen when React fully loads
    return Promise.resolve(undefined as unknown as T);
  }
  const tauriAppsApi = await import("@tauri-apps/api");
  const tauriInvoke = tauriAppsApi.invoke;
  return tauriInvoke(cmd, args);
}

export const appWindow: typeof IAppWindow = !isNode() && require("@tauri-apps/api/window").appWindow;