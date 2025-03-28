import { describe, it, expect, vi } from 'vitest'
import { TalkToMeError, retry, getErrorMessage, isNetworkError } from './error'

describe('error utils', () => {
  describe('TalkToMeError', () => {
    it('should create error with code and retryable flag', () => {
      const error = new TalkToMeError('Test error', 'TEST_ERROR', true)
      expect(error.message).toBe('Test error')
      expect(error.code).toBe('TEST_ERROR')
      expect(error.retryable).toBe(true)
      expect(error.name).toBe('TalkToMeError')
    })
  })

  describe('retry', () => {
    it('should retry failed operations', async () => {
      const mockOperation = vi.fn()
        .mockRejectedValueOnce(new TalkToMeError('Retry me', 'RETRY_ERROR', true))
        .mockResolvedValueOnce('success')

      const result = await retry(mockOperation)
      expect(result).toBe('success')
      expect(mockOperation).toHaveBeenCalledTimes(2)
    })

    it('should not retry non-retryable errors', async () => {
      const mockOperation = vi.fn()
        .mockRejectedValueOnce(new TalkToMeError('Don\'t retry', 'NON_RETRY_ERROR', false))

      await expect(retry(mockOperation)).rejects.toThrow('Don\'t retry')
      expect(mockOperation).toHaveBeenCalledTimes(1)
    })

    it('should stop retrying after max retries', async () => {
      const mockOperation = vi.fn()
        .mockRejectedValue(new TalkToMeError('Retry me', 'RETRY_ERROR', true))

      await expect(retry(mockOperation, 2)).rejects.toThrow('Retry me')
      expect(mockOperation).toHaveBeenCalledTimes(3)
    })
  })

  describe('getErrorMessage', () => {
    it('should return TalkToMeError message', () => {
      const error = new TalkToMeError('Test error', 'TEST_ERROR')
      expect(getErrorMessage(error)).toBe('Test error')
    })

    it('should return Error message', () => {
      const error = new Error('Test error')
      expect(getErrorMessage(error)).toBe('Test error')
    })

    it('should return default message for unknown errors', () => {
      expect(getErrorMessage('string')).toBe('An unexpected error occurred')
    })
  })

  describe('isNetworkError', () => {
    it('should detect network errors', () => {
      const networkError = new Error('Network request failed')
      expect(isNetworkError(networkError)).toBe(true)
    })

    it('should detect timeout errors', () => {
      const timeoutError = new Error('Request timeout')
      expect(isNetworkError(timeoutError)).toBe(true)
    })

    it('should return false for non-network errors', () => {
      const otherError = new Error('Other error')
      expect(isNetworkError(otherError)).toBe(false)
    })

    it('should handle non-Error objects', () => {
      expect(isNetworkError('string')).toBe(false)
    })
  })
})
