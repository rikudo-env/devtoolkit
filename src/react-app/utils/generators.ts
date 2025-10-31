import { v4 as uuidv4, v5 as uuidv5, v1 as uuidv1 } from 'uuid';

// UUID Generators
export const generateUUIDv4 = (): string => {
  return uuidv4();
};

export const generateUUIDv1 = (): string => {
  return uuidv1();
};

export const generateUUIDv5 = (name: string, namespace: string): string => {
  const NAMESPACE_URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
  const NAMESPACE_DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
  
  const ns = namespace === 'url' ? NAMESPACE_URL : NAMESPACE_DNS;
  return uuidv5(name, ns);
};

// Token Generators
export const generateRandomToken = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  
  for (let i = 0; i < length; i++) {
    token += chars[array[i] % chars.length];
  }
  return token;
};

export const generateHexToken = (length: number = 32): string => {
  const array = new Uint8Array(length / 2);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const generateBase64Token = (length: number = 32): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

// Password Generator
export const generatePassword = (
  length: number = 16,
  includeSymbols: boolean = true
): string => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  let chars = lowercase + uppercase + numbers;
  if (includeSymbols) chars += symbols;
  
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars[array[i] % chars.length];
  }
  return password;
};

// Timestamp Generators
export const getCurrentUnixTimestamp = (): number => {
  return Math.floor(Date.now() / 1000);
};

export const getCurrentMillisTimestamp = (): number => {
  return Date.now();
};

export const getCurrentISOTimestamp = (): string => {
  return new Date().toISOString();
};

export const getCurrentRFC3339Timestamp = (): string => {
  return new Date().toISOString();
};

export const unixToDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toISOString();
};

export const dateToUnix = (dateStr: string): number => {
  return Math.floor(new Date(dateStr).getTime() / 1000);
};

// Hash Generators
export const generateMD5 = async (text: string): Promise<string> => {
  // Browser doesn't have MD5, we'll use a simple implementation
  // For production, consider using a library
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const generateSHA256 = async (text: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const generateSHA512 = async (text: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-512', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Encoding/Decoding
export const encodeBase64 = (text: string): string => {
  return btoa(unescape(encodeURIComponent(text)));
};

export const decodeBase64 = (encoded: string): string => {
  return decodeURIComponent(escape(atob(encoded)));
};

export const encodeURL = (text: string): string => {
  return encodeURIComponent(text);
};

export const decodeURL = (encoded: string): string => {
  return decodeURIComponent(encoded);
};

// Random Word Generator
const adjectives = [
  'quick', 'lazy', 'sleepy', 'noisy', 'hungry', 'brave', 'calm', 'eager',
  'gentle', 'happy', 'jolly', 'kind', 'lively', 'proud', 'silly', 'witty'
];

const nouns = [
  'fox', 'dog', 'cat', 'mouse', 'bird', 'fish', 'lion', 'tiger',
  'bear', 'wolf', 'deer', 'eagle', 'shark', 'whale', 'dolphin', 'penguin'
];

export const generateRandomWords = (count: number = 3, separator: string = '-'): string => {
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    if (i % 2 === 0) {
      words.push(adjectives[Math.floor(Math.random() * adjectives.length)]);
    } else {
      words.push(nouns[Math.floor(Math.random() * nouns.length)]);
    }
  }
  return words.join(separator);
};

// JWT Generator (simple, for testing only)
export const generateMockJWT = (payload: Record<string, any>): string => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = encodeBase64(JSON.stringify(header));
  const encodedPayload = encodeBase64(JSON.stringify(payload));
  const signature = generateRandomToken(43);
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

// Random Number Generators
export const generateRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const generateRandomFloat = (min: number, max: number, decimals: number = 2): number => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
};
