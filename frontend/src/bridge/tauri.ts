import { invoke as tauriInvoke } from '@tauri-apps/api/tauri'

/**
 * Generic invoke helper for Tauri commands
 */
export async function invoke<T>(cmd: string, args?: Record<string, any>): Promise<T> {
  try {
    return await tauriInvoke(cmd, args)
  } catch (error) {
    console.error(`Tauri command '${cmd}' failed:`, error)
    throw error
  }
}

/**
 * Get the application version from Tauri
 */
export async function getAppVersion(): Promise<string> {
  return invoke<string>('app_version')
}

/**
 * Get the current platform from Tauri
 */
export async function getPlatform(): Promise<string> {
  return invoke<string>('platform')
}

/**
 * Check if the app is running in Tauri
 */
export function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI__' in window
}
