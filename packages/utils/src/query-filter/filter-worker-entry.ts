import type {
  DataItem,
  FilterWorkerHost,
  FilterWorkerRequest,
  FilterWorkerResponse,
} from './filter-contract'
import { filterDataset } from './filter-expression-evaluator'

export function handleQueryFilterWorkerRequest<T extends DataItem>(
  payload: FilterWorkerRequest<T>,
): FilterWorkerResponse<T> {
  try {
    return {
      ok: true,
      requestId: payload.requestId,
      items: filterDataset(payload.data, payload.rules, payload.expression),
    }
  } catch (error) {
    return {
      ok: false,
      requestId: payload.requestId,
      message: error instanceof Error ? error.message : 'Unknown query filter worker error',
    }
  }
}

export function attachQueryFilterWorker<T extends DataItem>(host: FilterWorkerHost<T>): void {
  host.addEventListener('message', (event) => {
    host.postMessage(handleQueryFilterWorkerRequest(event.data), [])
  })
}

const workerGlobal = globalThis as Partial<FilterWorkerHost> & {
  constructor?: { name?: string }
  importScripts?: unknown
}
const looksLikeWorkerGlobalScope =
  typeof workerGlobal.importScripts === 'function' ||
  workerGlobal.constructor?.name?.endsWith('WorkerGlobalScope') === true

if (
  looksLikeWorkerGlobalScope &&
  typeof workerGlobal.addEventListener === 'function' &&
  typeof workerGlobal.postMessage === 'function'
) {
  attachQueryFilterWorker(workerGlobal)
}
