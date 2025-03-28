export class TalkToMeError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = false
  ) {
    super(message)
    this.name = 'TalkToMeError'
  }
}

export const MAX_RETRIES = 3
export const RETRY_DELAY = 1000 // 1 second

export const retry = async <T>(
  operation: () => Promise<T>,
  retries: number = MAX_RETRIES
): Promise<T> => {
  try {
    return await operation()
  } catch (error) {
    if (retries === 0 || !(error instanceof TalkToMeError) || !error.retryable) {
      throw error
    }

    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
    return retry(operation, retries - 1)
  }
}

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof TalkToMeError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'An unexpected error occurred'
}

export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    return (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('failed to fetch') ||
      message.includes('connection refused')
    )
  }
  return false
}
