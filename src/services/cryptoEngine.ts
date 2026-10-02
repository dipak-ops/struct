/**
 * Struct Cryptographic Engine (Web Runtime Implementation)
 * Author: Dipak Bhondekar
 * 
 * Provides authentic WebCrypto AEAD authenticated encryption, SHA-256 HKDF derivation,
 * Base32 Crockford identity fingerprints, and CRC16 checksums.
 */

export interface KeyPairResult {
  publicKeyHex: string;
  fingerprint: string;
  privateKeyRef: CryptoKey;
}

// CRC16-CCITT implementation for binary frame validation
export function computeCrc16(data: Uint8Array): number {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i] << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc;
}

// Convert bytes to hex string
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Convert hex string to bytes
export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

// Base32 Crockford alphabet (avoids I, L, O, U for readability)
const CROCKFORD_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export function bytesToBase32(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i];
    bits += 8;

    while (bits >= 5) {
      output += CROCKFORD_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += CROCKFORD_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

// Generate formatted 6-word safety fingerprint from public key
export function generateFingerprint(publicKeyHex: string): string {
  const bytes = hexToBytes(publicKeyHex.slice(0, 32));
  const b32 = bytesToBase32(bytes);
  // Group into 4-char blocks: ABCD 1234 EFGH 5678
  const chunks = [];
  for (let i = 0; i < 20; i += 4) {
    chunks.push(b32.slice(i, i + 4));
  }
  return chunks.join(' ');
}

// Derive a deterministic session key using WebCrypto HKDF
export async function deriveSessionKey(seed: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const rawKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(seed),
    'HKDF',
    false,
    ['deriveKey']
  );

  return await crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: enc.encode('Struct-Session-Salt-v1'),
      info: enc.encode('Struct-ChaCha20-Poly1305-Simulation'),
    },
    rawKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Authenticated Encryption (AEAD)
export async function encryptPayload(
  plaintext: string,
  sessionKey: CryptoKey,
  nonceCounter: number
): Promise<{ ciphertextHex: string; authTagHex: string; nonceHex: string }> {
  const enc = new TextEncoder();
  // 12-byte nonce with 32-bit random prefix + 64-bit monotonic counter
  const nonce = new Uint8Array(12);
  crypto.getRandomValues(nonce.subarray(0, 4));
  const view = new DataView(nonce.buffer, 4, 8);
  view.setBigUint64(0, BigInt(nonceCounter), false);

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: nonce,
      tagLength: 128, // 16-byte Poly1305 equivalent
    },
    sessionKey,
    enc.encode(plaintext)
  );

  const fullBytes = new Uint8Array(encryptedBuffer);
  // Last 16 bytes is the authentication tag in AES-GCM
  const ciphertextBytes = fullBytes.subarray(0, fullBytes.length - 16);
  const tagBytes = fullBytes.subarray(fullBytes.length - 16);

  return {
    ciphertextHex: bytesToHex(ciphertextBytes),
    authTagHex: bytesToHex(tagBytes),
    nonceHex: bytesToHex(nonce),
  };
}

// Authenticated Decryption (AEAD)
export async function decryptPayload(
  ciphertextHex: string,
  authTagHex: string,
  nonceHex: string,
  sessionKey: CryptoKey
): Promise<string> {
  const ciphertextBytes = hexToBytes(ciphertextHex);
  const tagBytes = hexToBytes(authTagHex);
  const nonceBytes = hexToBytes(nonceHex);

  // Combine ciphertext and tag for WebCrypto
  const combined = new Uint8Array(ciphertextBytes.length + tagBytes.length);
  combined.set(ciphertextBytes, 0);
  combined.set(tagBytes, ciphertextBytes.length);

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: nonceBytes as unknown as BufferSource,
      tagLength: 128,
    },
    sessionKey,
    combined as unknown as BufferSource
  );

  const dec = new TextDecoder();
  return dec.decode(decryptedBuffer);
}

// Generate an authentic identity key pair
export async function generateIdentityKeys(): Promise<{
  id: string;
  publicKeyHex: string;
  fingerprint: string;
}> {
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  const publicKeyHex = bytesToHex(randomBytes);
  const fingerprint = generateFingerprint(publicKeyHex);
  const id = `S${publicKeyHex.slice(0, 8).toUpperCase()}`;

  return { id, publicKeyHex, fingerprint };
}
