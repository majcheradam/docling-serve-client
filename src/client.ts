import { DoclingError } from "./error";
import { createMultipartBody } from "./internal/form-data";
import type { FileInput } from "./internal/form-data";
import type {
  BodyChunkHierarchicalFile,
  BodyChunkHierarchicalFileAsync,
  BodyChunkHybridFile,
  BodyChunkHybridFileAsync,
  BodyProcessFile,
  BodyProcessFileAsync,
  ChunkDocumentResponse,
  ClearResponse,
  ConvertDocumentsRequest,
  ConvertResult,
  HealthCheckResponse,
  HierarchicalChunkerOptionsDocumentsRequest,
  HybridChunkerOptionsDocumentsRequest,
  TaskStatusResponse,
} from "./types";

export type { FileInput } from "./internal/form-data";

export interface DoclingServeClientOptions {
  baseUrl?: string;
  apiKey?: string;
  fetch?: typeof fetch;
  headers?: HeadersInit;
}

export interface RequestOptions {
  signal?: AbortSignal;
  headers?: HeadersInit;
}

type ResponseMode = "json" | "arrayBuffer";

type ConvertSyncResponse<M extends ResponseMode> = M extends "arrayBuffer" ? ArrayBuffer : ConvertResult;

type ConvertAsyncResponse = TaskStatusResponse;

type ChunkSyncResponse<M extends ResponseMode> = M extends "arrayBuffer" ? ArrayBuffer : ChunkDocumentResponse;

type ChunkAsyncResponse = TaskStatusResponse;

type ResultResponse<M extends ResponseMode> = M extends "arrayBuffer"
  ? ArrayBuffer
  : ConvertResult | ChunkDocumentResponse;

export interface ConvertSourceOptions<M extends ResponseMode = "json"> extends RequestOptions {
  responseType?: M;
}

export interface ConvertFileOptions<M extends ResponseMode = "json"> extends RequestOptions {
  responseType?: M;
  settings?: Partial<Omit<BodyProcessFile, "files">>;
}

export interface ConvertFileAsyncOptions extends RequestOptions {
  settings?: Partial<Omit<BodyProcessFileAsync, "files">>;
}

export interface ChunkHybridSourceOptions<M extends ResponseMode = "json"> extends RequestOptions {
  responseType?: M;
}

export interface ChunkHybridFileOptions<M extends ResponseMode = "json"> extends RequestOptions {
  responseType?: M;
  settings?: Partial<Omit<BodyChunkHybridFile, "files">>;
}

export interface ChunkHybridFileAsyncOptions extends RequestOptions {
  settings?: Partial<Omit<BodyChunkHybridFileAsync, "files">>;
}

export interface ChunkHierarchicalSourceOptions<M extends ResponseMode = "json"> extends RequestOptions {
  responseType?: M;
}

export interface ChunkHierarchicalFileOptions<M extends ResponseMode = "json"> extends RequestOptions {
  responseType?: M;
  settings?: Partial<Omit<BodyChunkHierarchicalFile, "files">>;
}

export interface ChunkHierarchicalFileAsyncOptions extends RequestOptions {
  settings?: Partial<Omit<BodyChunkHierarchicalFileAsync, "files">>;
}

export interface TaskResultOptions<M extends ResponseMode = "json"> extends RequestOptions {
  responseType?: M;
}

const DEFAULT_BASE_URL = "http://localhost:8000/";

type ResponseParser = "json" | "arrayBuffer" | "blob" | "text" | "void";

type BodyCandidate = BodyInit | Record<string, unknown> | undefined;

export class DoclingServeClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;
  private readonly defaultHeaders: Array<[string, string]>;

  constructor(options: DoclingServeClientOptions = {}) {
    const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
    this.baseUrl = normalizeBaseUrl(baseUrl);
    const baseHeaders = new Headers(options.headers);
    if (options.apiKey) {
      baseHeaders.set("X-Api-Key", options.apiKey);
    }
    this.defaultHeaders = Array.from(baseHeaders.entries());
    this.fetchImpl = options.fetch ?? globalThis.fetch;
    if (!this.fetchImpl) {
      throw new Error("A fetch implementation must be available in this environment");
    }
  }

  async health(options: RequestOptions = {}): Promise<HealthCheckResponse> {
    return this.request<HealthCheckResponse>("GET", "/health", {
      parseAs: "json",
      signal: options.signal,
      headers: options.headers,
      defaultAccept: "application/json",
    });
  }

  async getOpenApiDocument(options: RequestOptions = {}): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>("GET", "/openapi-3.0.json", {
      parseAs: "json",
      signal: options.signal,
      headers: options.headers,
      defaultAccept: "application/json",
    });
  }

  async convertFromSource<M extends ResponseMode = "json">(
    body: ConvertDocumentsRequest,
    options: ConvertSourceOptions<M> = {},
  ): Promise<ConvertSyncResponse<M>> {
    const responseType = options.responseType ?? "json";
    return this.request<ConvertSyncResponse<M>>("POST", "/v1/convert/source", {
      body,
      signal: options.signal,
      headers: options.headers,
      parseAs: responseType,
      defaultAccept: responseType === "arrayBuffer" ? "application/zip" : "application/json",
    });
  }

  async convertFromSourceAsync(
    body: ConvertDocumentsRequest,
    options: RequestOptions = {},
  ): Promise<ConvertAsyncResponse> {
    return this.request<ConvertAsyncResponse>("POST", "/v1/convert/source/async", {
      body,
      signal: options.signal,
      headers: options.headers,
      parseAs: "json",
      defaultAccept: "application/json",
    });
  }

  async convertFromFile<M extends ResponseMode = "json">(
    files: FileInput | FileInput[],
    options: ConvertFileOptions<M> = {},
  ): Promise<ConvertSyncResponse<M>> {
    const responseType = options.responseType ?? "json";
    const form = createMultipartBody<Omit<BodyProcessFile, "files">>({
      fileField: "files",
      files,
      settings: options.settings,
    });
    return this.request<ConvertSyncResponse<M>>("POST", "/v1/convert/file", {
      body: form,
      signal: options.signal,
      headers: options.headers,
      parseAs: responseType,
      defaultAccept: responseType === "arrayBuffer" ? "application/zip" : "application/json",
    });
  }

  async convertFromFileAsync(
    files: FileInput | FileInput[],
    options: ConvertFileAsyncOptions = {},
  ): Promise<ConvertAsyncResponse> {
    const form = createMultipartBody<Omit<BodyProcessFileAsync, "files">>({
      fileField: "files",
      files,
      settings: options.settings,
    });
    return this.request<ConvertAsyncResponse>("POST", "/v1/convert/file/async", {
      body: form,
      signal: options.signal,
      headers: options.headers,
      parseAs: "json",
      defaultAccept: "application/json",
    });
  }

  async chunkHybridFromSource<M extends ResponseMode = "json">(
    body: HybridChunkerOptionsDocumentsRequest,
    options: ChunkHybridSourceOptions<M> = {},
  ): Promise<ChunkSyncResponse<M>> {
    const responseType = options.responseType ?? "json";
    return this.request<ChunkSyncResponse<M>>("POST", "/v1/chunk/hybrid/source", {
      body,
      signal: options.signal,
      headers: options.headers,
      parseAs: responseType,
      defaultAccept: responseType === "arrayBuffer" ? "application/zip" : "application/json",
    });
  }

  async chunkHybridFromSourceAsync(
    body: HybridChunkerOptionsDocumentsRequest,
    options: RequestOptions = {},
  ): Promise<ChunkAsyncResponse> {
    return this.request<ChunkAsyncResponse>("POST", "/v1/chunk/hybrid/source/async", {
      body,
      signal: options.signal,
      headers: options.headers,
      parseAs: "json",
      defaultAccept: "application/json",
    });
  }

  async chunkHybridFromFile<M extends ResponseMode = "json">(
    files: FileInput | FileInput[],
    options: ChunkHybridFileOptions<M> = {},
  ): Promise<ChunkSyncResponse<M>> {
    const responseType = options.responseType ?? "json";
    const form = createMultipartBody<Omit<BodyChunkHybridFile, "files">>({
      fileField: "files",
      files,
      settings: options.settings,
    });
    return this.request<ChunkSyncResponse<M>>("POST", "/v1/chunk/hybrid/file", {
      body: form,
      signal: options.signal,
      headers: options.headers,
      parseAs: responseType,
      defaultAccept: responseType === "arrayBuffer" ? "application/zip" : "application/json",
    });
  }

  async chunkHybridFromFileAsync(
    files: FileInput | FileInput[],
    options: ChunkHybridFileAsyncOptions = {},
  ): Promise<ChunkAsyncResponse> {
    const form = createMultipartBody<Omit<BodyChunkHybridFileAsync, "files">>({
      fileField: "files",
      files,
      settings: options.settings,
    });
    return this.request<ChunkAsyncResponse>("POST", "/v1/chunk/hybrid/file/async", {
      body: form,
      signal: options.signal,
      headers: options.headers,
      parseAs: "json",
      defaultAccept: "application/json",
    });
  }

  async chunkHierarchicalFromSource<M extends ResponseMode = "json">(
    body: HierarchicalChunkerOptionsDocumentsRequest,
    options: ChunkHierarchicalSourceOptions<M> = {},
  ): Promise<ChunkSyncResponse<M>> {
    const responseType = options.responseType ?? "json";
    return this.request<ChunkSyncResponse<M>>("POST", "/v1/chunk/hierarchical/source", {
      body,
      signal: options.signal,
      headers: options.headers,
      parseAs: responseType,
      defaultAccept: responseType === "arrayBuffer" ? "application/zip" : "application/json",
    });
  }

  async chunkHierarchicalFromSourceAsync(
    body: HierarchicalChunkerOptionsDocumentsRequest,
    options: RequestOptions = {},
  ): Promise<ChunkAsyncResponse> {
    return this.request<ChunkAsyncResponse>("POST", "/v1/chunk/hierarchical/source/async", {
      body,
      signal: options.signal,
      headers: options.headers,
      parseAs: "json",
      defaultAccept: "application/json",
    });
  }

  async chunkHierarchicalFromFile<M extends ResponseMode = "json">(
    files: FileInput | FileInput[],
    options: ChunkHierarchicalFileOptions<M> = {},
  ): Promise<ChunkSyncResponse<M>> {
    const responseType = options.responseType ?? "json";
    const form = createMultipartBody<Omit<BodyChunkHierarchicalFile, "files">>({
      fileField: "files",
      files,
      settings: options.settings,
    });
    return this.request<ChunkSyncResponse<M>>("POST", "/v1/chunk/hierarchical/file", {
      body: form,
      signal: options.signal,
      headers: options.headers,
      parseAs: responseType,
      defaultAccept: responseType === "arrayBuffer" ? "application/zip" : "application/json",
    });
  }

  async chunkHierarchicalFromFileAsync(
    files: FileInput | FileInput[],
    options: ChunkHierarchicalFileAsyncOptions = {},
  ): Promise<ChunkAsyncResponse> {
    const form = createMultipartBody<Omit<BodyChunkHierarchicalFileAsync, "files">>({
      fileField: "files",
      files,
      settings: options.settings,
    });
    return this.request<ChunkAsyncResponse>("POST", "/v1/chunk/hierarchical/file/async", {
      body: form,
      signal: options.signal,
      headers: options.headers,
      parseAs: "json",
      defaultAccept: "application/json",
    });
  }

  async pollTask(taskId: string, options: RequestOptions = {}): Promise<TaskStatusResponse> {
    return this.request<TaskStatusResponse>("GET", `/v1/status/poll/${encodeURIComponent(taskId)}`, {
      parseAs: "json",
      signal: options.signal,
      headers: options.headers,
      defaultAccept: "application/json",
    });
  }

  async getTaskResult<M extends ResponseMode = "json">(
    taskId: string,
    options: TaskResultOptions<M> = {},
  ): Promise<ResultResponse<M>> {
    const responseType = options.responseType ?? "json";
    return this.request<ResultResponse<M>>("GET", `/v1/result/${encodeURIComponent(taskId)}`, {
      parseAs: responseType,
      signal: options.signal,
      headers: options.headers,
      defaultAccept: responseType === "arrayBuffer" ? "application/zip" : "application/json",
    });
  }

  async clearConverters(options: RequestOptions = {}): Promise<ClearResponse> {
    return this.request<ClearResponse>("GET", "/v1/clear/converters", {
      parseAs: "json",
      signal: options.signal,
      headers: options.headers,
      defaultAccept: "application/json",
    });
  }

  async clearResults(options: RequestOptions = {}): Promise<ClearResponse> {
    return this.request<ClearResponse>("GET", "/v1/clear/results", {
      parseAs: "json",
      signal: options.signal,
      headers: options.headers,
      defaultAccept: "application/json",
    });
  }

  private async request<T>(
    method: string,
    path: string,
    init: {
      body?: BodyCandidate;
      signal?: AbortSignal;
      headers?: HeadersInit;
      parseAs: ResponseParser;
      defaultAccept?: string;
    },
  ): Promise<T> {
    const url = this.resolve(path);
    const headers = this.mergeHeaders(init.headers);
    if (init.defaultAccept && !headers.has("Accept")) {
      headers.set("Accept", init.defaultAccept);
    }

    const preparedBody = this.prepareBody(init.body, headers);
    const response = await this.fetchImpl(url, {
      method,
      body: preparedBody,
      headers,
      signal: init.signal,
    });

    if (!response.ok) {
      throw await this.createError(method, path, response);
    }

    return this.parseResponse<T>(response, init.parseAs);
  }

  private mergeHeaders(extra?: HeadersInit): Headers {
    const headers = new Headers(this.defaultHeaders);
    if (extra) {
      const extraHeaders = new Headers(extra);
      extraHeaders.forEach((value, key) => {
        headers.set(key, value);
      });
    }
    return headers;
  }

  private resolve(path: string): string {
    if (/^https?:\/\//i.test(path)) {
      return path;
    }
    const base = this.baseUrl.endsWith("/") ? this.baseUrl : `${this.baseUrl}/`;
    const relative = path.startsWith("/") ? path.slice(1) : path;
    return new URL(relative, base).toString();
  }

  private prepareBody(body: BodyCandidate, headers: Headers): BodyInit | undefined {
    if (body === undefined || body === null) {
      return undefined;
    }

    if (isBodyInit(body)) {
      if (body instanceof FormData) {
        return body;
      }
      if (body instanceof URLSearchParams && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/x-www-form-urlencoded");
      }
      if (typeof body === "string" && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
      return body;
    }

    headers.set("Content-Type", "application/json");
    return JSON.stringify(body);
  }

  private async createError(method: string, path: string, response: Response): Promise<DoclingError> {
    const headers = new Headers(response.headers);
    const contentType = headers.get("content-type") ?? "";
    let parsed: unknown;
    try {
      if (contentType.includes("application/json")) {
        parsed = await response.json();
      } else {
        const text = await response.text();
        parsed = text.length ? text : undefined;
      }
    } catch (error) {
      parsed = undefined;
    }

    const message = `Request to ${path} failed with status ${response.status}`;
    return new DoclingError(message, {
      status: response.status,
      statusText: response.statusText,
      body: parsed,
      headers,
      method,
      path,
    });
  }

  private async parseResponse<T>(response: Response, mode: ResponseParser): Promise<T> {
    switch (mode) {
      case "arrayBuffer": {
        const buffer = await response.arrayBuffer();
        return buffer as T;
      }
      case "blob": {
        const blob = await response.blob();
        return blob as T;
      }
      case "text": {
        const text = await response.text();
        return text as T;
      }
      case "void": {
        return undefined as T;
      }
      default: {
        if (response.status === 204) {
          return undefined as T;
        }
        if (response.headers.get("content-length") === "0") {
          return undefined as T;
        }
        return (await response.json()) as T;
      }
    }
  }
}

export function createDoclingServeClient(options?: DoclingServeClientOptions): DoclingServeClient {
  return new DoclingServeClient(options);
}

function normalizeBaseUrl(url: string): string {
  if (url.endsWith("/")) {
    return url;
  }
  return `${url}/`;
}

function isBodyInit(value: unknown): value is BodyInit {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === "string") {
    return true;
  }
  if (typeof Blob !== "undefined" && value instanceof Blob) {
    return true;
  }
  if (typeof FormData !== "undefined" && value instanceof FormData) {
    return true;
  }
  if (value instanceof ArrayBuffer) {
    return true;
  }
  if (ArrayBuffer.isView(value)) {
    return true;
  }
  if (typeof URLSearchParams !== "undefined" && value instanceof URLSearchParams) {
    return true;
  }
  if (typeof ReadableStream !== "undefined" && value instanceof ReadableStream) {
    return true;
  }
  return false;
}
