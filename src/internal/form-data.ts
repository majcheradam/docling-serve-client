export type BinaryLike = Blob | File | ArrayBuffer | ArrayBufferView;

export interface FileDescriptor {
  data: BinaryLike;
  filename?: string;
  contentType?: string;
}

export type FileInput = BinaryLike | FileDescriptor;

export interface MultipartPayloadOptions<TSettings extends Record<string, unknown>> {
  fileField: string;
  files: FileInput | FileInput[];
  settings?: Partial<TSettings>;
}

export function createMultipartBody<TSettings extends Record<string, unknown>>(
  options: MultipartPayloadOptions<TSettings>,
): FormData {
  const { fileField, files, settings } = options;
  const entries = Array.isArray(files) ? files : [files];
  if (entries.length === 0) {
    throw new TypeError("At least one file must be provided");
  }
  const form = new FormData();
  entries.forEach((entry, index) => {
    const descriptor = toDescriptor(entry);
    const blob = toBlob(descriptor.data, descriptor.contentType);
    const filename = descriptor.filename ?? inferFilename(descriptor.data, index);
    form.append(fileField, blob, filename);
  });

  if (settings) {
    for (const [key, value] of Object.entries(settings)) {
      appendFormValue(form, key, value);
    }
  }

  return form;
}

function toDescriptor(input: FileInput): FileDescriptor {
  if (isFileDescriptor(input)) {
    return input;
  }
  return { data: input };
}

function isFileDescriptor(value: FileInput): value is FileDescriptor {
  if (!value || typeof value !== "object") {
    return false;
  }
  if (isBinaryLike(value)) {
    return false;
  }
  if (!("data" in value)) {
    return false;
  }
  const candidate = (value as { data?: unknown }).data;
  return isBinaryLike(candidate);
}

function isBinaryLike(value: unknown): value is BinaryLike {
  if (typeof Blob !== "undefined" && value instanceof Blob) {
    return true;
  }
  if (value instanceof ArrayBuffer) {
    return true;
  }
  return ArrayBuffer.isView(value);
}

function toBlob(data: BinaryLike, contentType?: string): Blob {
  if (typeof Blob !== "undefined" && data instanceof Blob) {
    if (contentType && data.type !== contentType) {
      return new Blob([data], { type: contentType });
    }
    return data;
  }

  if (data instanceof ArrayBuffer) {
    return new Blob([data], {
      type: contentType ?? "application/octet-stream",
    });
  }

  if (ArrayBuffer.isView(data)) {
    const view = data as ArrayBufferView;
    const copy = new Uint8Array(view.byteLength);
    copy.set(new Uint8Array(view.buffer, view.byteOffset, view.byteLength));
    return new Blob([copy], {
      type: contentType ?? "application/octet-stream",
    });
  }

  throw new TypeError("Unsupported binary input provided to multipart payload");
}

function inferFilename(data: BinaryLike, index: number): string {
  if (typeof File !== "undefined" && data instanceof File && data.name) {
    return data.name;
  }
  return `file-${index + 1}`;
}

function appendFormValue(form: FormData, key: string, value: unknown): void {
  if (value === undefined || value === null) {
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      appendFormValue(form, key, item);
    }
    return;
  }

  if (value instanceof Date) {
    form.append(key, value.toISOString());
    return;
  }

  if (typeof value === "object") {
    form.append(key, JSON.stringify(value));
    return;
  }

  form.append(key, String(value));
}
