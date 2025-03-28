import DOMPurify from 'dompurify'

export const MAX_COMMENT_LENGTH = 1000
export const MIN_COMMENT_LENGTH = 1
export const RATE_LIMIT_WINDOW = 10000 // 10 seconds in milliseconds

export const sanitizeComment = (content: string): string => {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['b', 'i', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target']
  })
}

export const validateComment = (content: string): { isValid: boolean; error?: string } => {
  const sanitizedContent = sanitizeComment(content)

  if (sanitizedContent.length < MIN_COMMENT_LENGTH) {
    return { isValid: false, error: 'Comment cannot be empty' }
  }

  if (sanitizedContent.length > MAX_COMMENT_LENGTH) {
    return { isValid: false, error: `Comment cannot exceed ${MAX_COMMENT_LENGTH} characters` }
  }

  return { isValid: true }
}

export const isRateLimited = (lastSubmissionTime: number): boolean => {
  return Date.now() - lastSubmissionTime < RATE_LIMIT_WINDOW
}
