import type { CredentialEncryption } from '@siwc/local'
import type { SafeStorage } from 'electron'

type Storage = Pick<SafeStorage, 'isEncryptionAvailable' | 'getSelectedStorageBackend' | 'encryptString' | 'decryptString'>

// Deliberately use the stable synchronous safeStorage format for this spike.
// The async API's Linux backend/rotation semantics require separate verification.
export function credentialEncryption(storage: Storage, ready: () => boolean, platform = process.platform): CredentialEncryption {
  function isAvailable(): boolean {
    if (!ready() || !storage.isEncryptionAvailable()) return false
    return platform !== 'linux' || new Set(['gnome_libsecret', 'kwallet', 'kwallet5', 'kwallet6']).has(storage.getSelectedStorageBackend())
  }
  function guard(): void {
    if (!isAvailable()) throw new Error('Protected OS credential storage is unavailable.')
  }
  return {
    id: 'tutor-safe-storage-v1',
    isAvailable,
    encrypt(value) { guard(); return storage.encryptString(value) },
    decrypt(value) { guard(); return storage.decryptString(Buffer.from(value)) }
  }
}
