import { Buffer } from 'buffer';
import assert from 'assert';
import process from 'process';

// Set up global polyfills for Node.js modules
if (typeof global !== 'undefined') {
  global.Buffer = Buffer;
  global.assert = assert;
  global.process = process;
}

// Also set up for window object in web environment
if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
  (window as any).assert = assert;
  (window as any).process = process;
}

export {}; 