import { Comment } from '../types/component'

export const COMMENTS_PER_PAGE = 20

export interface PaginatedComments {
  comments: Comment[]
  hasMore: boolean
  nextPage: number
}

export const paginateComments = (
  comments: Comment[],
  currentPage: number = 1
): PaginatedComments => {
  const startIndex = (currentPage - 1) * COMMENTS_PER_PAGE
  const endIndex = startIndex + COMMENTS_PER_PAGE
  const paginatedComments = comments.slice(startIndex, endIndex)

  return {
    comments: paginatedComments,
    hasMore: endIndex < comments.length,
    nextPage: currentPage + 1
  }
}

export const cacheComments = (postId: string, comments: Comment[]): void => {
  try {
    localStorage.setItem(`t-t-m-comments-${postId}`, JSON.stringify({
      comments,
      timestamp: Date.now()
    }))
  } catch (error) {
    console.error('Failed to cache comments:', error)
  }
}

export const getCachedComments = (postId: string): Comment[] | null => {
  try {
    const cached = localStorage.getItem(`t-t-m-comments-${postId}`)
    if (!cached) return null

    const { comments, timestamp } = JSON.parse(cached)
    const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(`t-t-m-comments-${postId}`)
      return null
    }

    return comments
  } catch (error) {
    console.error('Failed to retrieve cached comments:', error)
    return null
  }
}
