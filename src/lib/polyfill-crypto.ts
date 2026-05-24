import * as ExpoCrypto from 'expo-crypto';
import type { IntBasedTypedArray, UintBasedTypedArray } from 'expo-modules-core';

function hasWebCryptoDigestSupport(): boolean {
  return (
    typeof globalThis.crypto !== 'undefined' &&
    typeof globalThis.crypto.subtle !== 'undefined' &&
    typeof globalThis.crypto.subtle.digest === 'function'
  );
}

function getDigestAlgorithmName(algorithm: AlgorithmIdentifier): string {
  return typeof algorithm === 'string' ? algorithm : algorithm.name;
}

function toUint8Array(data: BufferSource): Uint8Array {
  if (data instanceof ArrayBuffer) {
    return new Uint8Array(data);
  }

  return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
}

function polyfillBtoa(): void {
  if (typeof globalThis.btoa === 'function') {
    return;
  }

  globalThis.btoa = (input: string): string => {
    const bytes = Uint8Array.from(input, (char) => char.charCodeAt(0));
    const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let output = '';

    for (let index = 0; index < bytes.length; index += 3) {
      const byte1 = bytes[index] ?? 0;
      const byte2 = bytes[index + 1] ?? 0;
      const byte3 = bytes[index + 2] ?? 0;
      const triplet = (byte1 << 16) | (byte2 << 8) | byte3;

      output += base64Chars[(triplet >> 18) & 63];
      output += base64Chars[(triplet >> 12) & 63];
      output += index + 1 < bytes.length ? base64Chars[(triplet >> 6) & 63] : '=';
      output += index + 2 < bytes.length ? base64Chars[triplet & 63] : '=';
    }

    return output;
  };
}

function polyfillGetRandomValues(cryptoObject: Crypto): void {
  if (typeof cryptoObject.getRandomValues === 'function') {
    return;
  }

  cryptoObject.getRandomValues = <T extends ArrayBufferView>(array: T): T => {
    ExpoCrypto.getRandomValues(array as unknown as IntBasedTypedArray | UintBasedTypedArray);
    return array;
  };
}

function polyfillSubtleDigest(cryptoObject: Crypto): void {
  if (typeof cryptoObject.subtle?.digest === 'function') {
    return;
  }

  const subtleCrypto = {
    async digest(algorithm: AlgorithmIdentifier, data: BufferSource): Promise<ArrayBuffer> {
      const algorithmName = getDigestAlgorithmName(algorithm);

      if (algorithmName !== 'SHA-256') {
        throw new Error(`Unsupported digest algorithm: ${algorithmName}`);
      }

      const input = toUint8Array(data);
      const normalizedInput = new Uint8Array(input);

      return ExpoCrypto.digest(ExpoCrypto.CryptoDigestAlgorithm.SHA256, normalizedInput);
    },
  } as SubtleCrypto;

  Object.defineProperty(cryptoObject, 'subtle', {
    configurable: true,
    enumerable: true,
    value: subtleCrypto,
  });
}

export function installCryptoPolyfill(): void {
  if (hasWebCryptoDigestSupport()) {
    return;
  }

  polyfillBtoa();

  if (typeof globalThis.crypto === 'undefined') {
    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      enumerable: true,
      value: {},
    });
  }

  const cryptoObject = globalThis.crypto;
  polyfillGetRandomValues(cryptoObject);
  polyfillSubtleDigest(cryptoObject);
}

installCryptoPolyfill();
