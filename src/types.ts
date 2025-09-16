import type { components, paths } from "./generated/docling-serve";

export type { paths } from "./generated/docling-serve";

export type ConvertDocumentsRequest = components["schemas"]["ConvertDocumentsRequest"];
export type ConvertDocumentResponse = components["schemas"]["ConvertDocumentResponse"];
export type PresignedUrlConvertDocumentResponse = components["schemas"]["PresignedUrlConvertDocumentResponse"];
export type ConvertDocumentsRequestOptions = components["schemas"]["ConvertDocumentsRequestOptions"];
export type ConvertResult = ConvertDocumentResponse | PresignedUrlConvertDocumentResponse;

export type HybridChunkerOptions = components["schemas"]["HybridChunkerOptions"];
export type HybridChunkerOptionsDocumentsRequest = components["schemas"]["HybridChunkerOptionsDocumentsRequest"];
export type HierarchicalChunkerOptions = components["schemas"]["HierarchicalChunkerOptions"];
export type HierarchicalChunkerOptionsDocumentsRequest =
  components["schemas"]["HierarchicalChunkerOptionsDocumentsRequest"];

export type ChunkDocumentResponse = components["schemas"]["ChunkDocumentResponse"];
export type TaskStatusResponse = components["schemas"]["TaskStatusResponse"];
export type ClearResponse = components["schemas"]["ClearResponse"];
export type HealthCheckResponse = components["schemas"]["HealthCheckResponse"];
export type HTTPValidationError = components["schemas"]["HTTPValidationError"];

export type PollTaskResponse = TaskStatusResponse;
export type ResultResponse = ConvertResult | ChunkDocumentResponse;

export type BodyProcessFile = components["schemas"]["Body_process_file_v1_convert_file_post"];
export type BodyProcessFileAsync = components["schemas"]["Body_process_file_async_v1_convert_file_async_post"];
export type BodyChunkHybridFile =
  components["schemas"]["Body_Chunk_files_with_HybridChunker_v1_chunk_hybrid_file_post"];
export type BodyChunkHybridFileAsync =
  components["schemas"]["Body_Chunk_files_with_HybridChunker_as_async_task_v1_chunk_hybrid_file_async_post"];
export type BodyChunkHierarchicalFile =
  components["schemas"]["Body_Chunk_files_with_HierarchicalChunker_v1_chunk_hierarchical_file_post"];
export type BodyChunkHierarchicalFileAsync =
  components["schemas"]["Body_Chunk_files_with_HierarchicalChunker_as_async_task_v1_chunk_hierarchical_file_async_post"];
