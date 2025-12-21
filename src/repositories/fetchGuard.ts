export function createLoadGuard() {
  let inFlight = false;

  return async function runIfIdle<T>(task: () => Promise<T>): Promise<T | undefined> {
    if (inFlight) {
      return undefined;
    }

    inFlight = true;
    try {
      return await task();
    } finally {
      inFlight = false;
    }
  };
}

export function createQueuedLoadGuard() {
  let inFlight = false;
  let queuedTask: (() => Promise<unknown>) | null = null;

  return async function runLatest<T>(task: () => Promise<T>): Promise<T | undefined> {
    if (inFlight) {
      queuedTask = task as unknown as () => Promise<unknown>;
      return undefined;
    }

    inFlight = true;
    try {
      let result: Awaited<T> = await task();

      while (queuedTask) {
        const next = queuedTask;
        queuedTask = null;
        result = (await next()) as Awaited<T>;
      }

      return result as T;
    } finally {
      inFlight = false;
    }
  };
}
