if (typeof (globalThis as any).File === 'undefined') {
  (globalThis as any).File = class File {};
}

if (typeof (globalThis as any).Blob === 'undefined') {
  (globalThis as any).Blob = class Blob {};
}

