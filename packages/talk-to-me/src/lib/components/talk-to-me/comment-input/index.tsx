import { useState } from 'react'
import DOMPurify from 'dompurify'
import { CommentInputProps } from '@lib/types/component'
import './style.css'

export const CommentInput = ({ onSubmit, isSubmitting, error }: CommentInputProps) => {
  const [content, setContent] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    const sanitizedContent = DOMPurify.sanitize(content.trim())
    await onSubmit(sanitizedContent)
    setContent('')
  }

  return (
    <form onSubmit={handleSubmit} className="t-t-m-comment-input-form">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a comment..."
        className="t-t-m-comment-input"
        disabled={isSubmitting}
        aria-label="Comment input"
      />
      {error && <div className="t-t-m-error">{error.message}</div>}
      <button
        type="submit"
        className="t-t-m-submit-button"
        disabled={isSubmitting || !content.trim()}
      >
        {isSubmitting ? 'Posting...' : 'Post Comment'}
      </button>
    </form>
  )
}
