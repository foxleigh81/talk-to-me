import { describe, it, expect } from 'vitest'
import { sanitizeComment, validateComment, isRateLimited } from './security'

describe('security utils', () => {
  describe('sanitizeComment', () => {
    it('should sanitize HTML content', () => {
      const input = '<script>alert("xss")</script><p>Hello</p>'
      const output = sanitizeComment(input)
      expect(output).toBe('<p>Hello</p>')
    })

    it('should allow basic formatting tags', () => {
      const input = '<b>bold</b> <i>italic</i> <a href="https://example.com">link</a>'
      const output = sanitizeComment(input)
      expect(output).toBe('<b>bold</b> <i>italic</i> <a href="https://example.com">link</a>')
    })
  })

  describe('validateComment', () => {
    it('should reject empty comments', () => {
      const result = validateComment('')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Comment cannot be empty')
    })

    it('should reject comments exceeding max length', () => {
      const longComment = 'a'.repeat(1001)
      const result = validateComment(longComment)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Comment cannot exceed 1000 characters')
    })

    it('should accept valid comments', () => {
      const result = validateComment('Valid comment')
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })
  })

  describe('isRateLimited', () => {
    it('should return true if within rate limit window', () => {
      const lastSubmissionTime = Date.now() - 5000 // 5 seconds ago
      expect(isRateLimited(lastSubmissionTime)).toBe(true)
    })

    it('should return false if outside rate limit window', () => {
      const lastSubmissionTime = Date.now() - 11000 // 11 seconds ago
      expect(isRateLimited(lastSubmissionTime)).toBe(false)
    })
  })
})
