# docling-serve-client

Type-safe TypeScript SDK for [docling-serve](https://github.com/docling-project/docling-serve) with first-class Bun support. The client is generated from the official OpenAPI schema and wraps every endpoint with a small, DX-focused API surface.

## Highlights
- 📦 Ready for publishing to npm (ESM + CJS bundles with declarations)
- 🔐 Built-in support for `X-Api-Key` authentication and custom fetch implementations
- 🧬 Regenerate types directly from the upstream OpenAPI document with `bun run generate`
- 🗂️ Ergonomic helpers for multipart uploads, including zero-copy handling of Bun `Blob`/`File`
- ⚙️ Works in Bun or Node.js ≥ 18.17 (requires global `fetch`)

## Installation

```bash
bun add @docling/serve-client
# or
npm install @docling/serve-client
```

## Quick start

```ts
import { createDoclingServeClient } from "@docling/serve-client";

const client = createDoclingServeClient({
  baseUrl: "https://docling.example.com",
  apiKey: process.env.DOCLING_API_KEY,
});

const conversion = await client.convertFromSource({
  sources: [
    {
      http_source: {
        url: "https://arxiv.org/pdf/2402.19433",
      },
    },
  ],
});

console.log(conversion.data[0]?.doc_id);
```

### Uploading files

```ts
import { DoclingServeClient } from "@docling/serve-client";
import { file } from "bun"; // Bun helper to read as File

const client = new DoclingServeClient({ baseUrl: "http://localhost:8000" });

const response = await client.convertFromFile(file("./sample.pdf"), {
  settings: {
    to_formats: ["md", "json"],
    include_images: true,
  },
});
```

The `FileInput` type accepts:
- native `File` / `Blob` instances (Bun, browsers, Node ≥ 20)
- `ArrayBuffer` or typed array views (`Uint8Array`, etc.)
- descriptors `{ data, filename?, contentType? }` for full control

### Handling async jobs

```ts
const { task_id } = await client.convertFromFileAsync(file("./large.pdf"));

let status;
do {
  status = await client.pollTask(task_id);
  await Bun.sleep(500);
} while (status.state !== "done");

const result = await client.getTaskResult(task_id, { responseType: "json" });
```

To download binary archives instead of JSON, set `responseType: "arrayBuffer"` on the conversion or result calls.

## Regenerating API types

The `schema/openapi.json` file is bundled so the generated types stay in source control. If the upstream API changes, overwrite the schema and regenerate:

```bash
curl -L https://gist.githubusercontent.com/majcheradam/53d773afbc3a5f61e636361dfebf620f/raw/0639708094aaedc4ec58e5c63030feb1320e4cdb/openapi.json \
  -o schema/openapi.json
bun run generate
```

## Development

- `bun install` – install dependencies & create `bun.lock`
- `bun run build` – produce `dist/` bundles (ESM, CJS, d.ts)
- `bun run dev` – watch mode rebuild with tsup
- `bun run lint` – format & lint with Biome

The build is wired as `prepublishOnly`, so publishing from npm or `bun publish` automatically ships the compiled output.

## License

[MIT](./LICENSE)
