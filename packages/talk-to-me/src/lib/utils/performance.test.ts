import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { paginateComments, cacheComments, getCachedComments } from './performance'
import { Comment } from '../types/component'
import { User } from '@supabase/supabase-js'

describe('performance utils', () => {
  const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString()
  }

  const mockComments: Comment[] = Array.from({ length: 25 }, (_, i) => ({
    id: `comment-${i}`,
    post_id: 'test-post',
    author_id: 'user-1',
    content: `Comment ${i}`,
    status: 'approved',
    created_at: new Date().toISOString(),
    author: mockUser
  }))

  describe('paginateComments', () => {
    it('should return first page of comments', () => {
      const result = paginateComments(mockComments)
      expect(result.comments).toHaveLength(20)
      expect(result.hasMore).toBe(true)
      expect(result.nextPage).toBe(2)
    })

    it('should return second page of comments', () => {
      const result = paginateComments(mockComments, 2)
      expect(result.comments).toHaveLength(5)
      expect(result.hasMore).toBe(false)
      expect(result.nextPage).toBe(3)
    })

    it('should handle empty comments array', () => {
      const result = paginateComments([])
      expect(result.comments).toHaveLength(0)
      expect(result.hasMore).toBe(false)
      expect(result.nextPage).toBe(2)
    })
  })

  describe('comment caching', () => {
    beforeEach(() => {
      localStorage.clear()
    })

    afterEach(() => {
      localStorage.clear()
    })

    it('should cache and retrieve comments', () => {
      cacheComments('test-post', mockComments)
      const cached = getCachedComments('test-post')
      expect(cached).toEqual(mockComments)
    })

    it('should return null for non-existent cache', () => {
      const cached = getCachedComments('non-existent')
      expect(cached).toBeNull()
    })

    it('should handle invalid cache data', () => {
      localStorage.setItem('t-t-m-comments-test-post', 'invalid-json')
      const cached = getCachedComments('test-post')
      expect(cached).toBeNull()
    })
  })
})
