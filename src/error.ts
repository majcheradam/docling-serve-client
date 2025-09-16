export interface DoclingErrorOptions {
  status: number;
  statusText: string;
  body?: unknown;
  headers: Headers;
  path: string;
  method: string;
}

export class DoclingError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly body?: unknown;
  readonly headers: Headers;
  readonly path: string;
  readonly method: string;

  constructor(message: string, options: DoclingErrorOptions) {
    super(message);
    this.name = "DoclingError";
    this.status = options.status;
    this.statusText = options.statusText;
    this.body = options.body;
    this.headers = options.headers;
    this.path = options.path;
    this.method = options.method.toUpperCase();
  }
}
