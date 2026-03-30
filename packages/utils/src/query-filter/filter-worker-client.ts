import type {
  DataItem,
  FilterExpressionInput,
  FilterRule,
  FilterWorkerResponse,
} from './filter-contract'

export interface FilterWorkerClient<T extends DataItem> {
  run(data: T[], rules: FilterRule[], expression?: FilterExpressionInput): Promise<T[]>
  terminate(): void
}

interface PendingWorkerRequest<T extends DataItem> {
  reject: (reason?: unknown) => void
  resolve: (items: T[]) => void
}

/**
 * Browser-side helper that reuses a single worker for large query filter workloads.
 */
export function createQueryFilterWorkerClient<T extends DataItem>(): FilterWorkerClient<T> {
  const worker = new Worker(new URL('./filter-worker-entry.ts', import.meta.url), {
    type: 'module',
  })
  const pendingRequests = new Map<string, PendingWorkerRequest<T>>()

  worker.addEventListener('message', (event: MessageEvent<FilterWorkerResponse<T>>) => {
    const response = event.data
    const pendingRequest = pendingRequests.get(response.requestId)

    if (!pendingRequest) {
      return
    }

    pendingRequests.delete(response.requestId)

    if (response.ok) {
      pendingRequest.resolve(response.items)
      return
    }

    pendingRequest.reject(new Error(response.message))
  })

  return {
    run(data, rules, expression) {
      const requestId = crypto.randomUUID()

      return new Promise<T[]>((resolve, reject) => {
        pendingRequests.set(requestId, { resolve, reject })
        worker.postMessage(
          {
            requestId,
            data,
            rules,
            expression,
          },
          [],
        )
      })
    },
    terminate() {
      for (const pendingRequest of pendingRequests.values()) {
        pendingRequest.reject(
          new Error('Query filter worker terminated before completing pending work'),
        )
      }

      pendingRequests.clear()
      worker.terminate()
    },
  }
}
