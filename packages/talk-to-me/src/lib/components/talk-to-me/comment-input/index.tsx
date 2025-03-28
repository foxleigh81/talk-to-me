import { useState, useRef, useEffect } from 'react'
import { CommentInputProps } from '../../../types/component'
import { getAriaLabel, getAriaDescribedBy, focusElement } from '../../../utils/accessibility'
// CSS is now handled by a global stylesheet imported in the main index.ts file

export const CommentInput = ({ onSubmit, isSubmitting, error }: CommentInputProps) => {
  const [content, setContent] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const errorId = 'comment-input-error'
  const descriptionId = 'comment-input-description'

  useEffect(() => {
    if (error) {
      focusElement(errorId)
    }
  }, [error])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || isSubmitting) return

    await onSubmit(content)
    setContent('')
  }

  return (
    <form onSubmit={handleSubmit} className="t-t-m-comment-form">
      <div className="t-t-m-form-group">
        <textarea
          ref={textareaRef}
          id="comment-input"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your comment..."
          disabled={isSubmitting}
          aria-label={getAriaLabel('Comment input')}
          aria-describedby={getAriaDescribedBy('comment-input')}
          aria-invalid={!!error}
          aria-errormessage={error ? errorId : undefined}
          className={`t-t-m-textarea ${error ? 't-t-m-error' : ''}`}
        />
        <div
          id={descriptionId}
          className="t-t-m-textarea-description"
          aria-hidden="true"
        >
          Press Enter to submit, Shift + Enter for new line
        </div>
      </div>
      {error && (
        <div
          id={errorId}
          className="t-t-m-error-message"
          role="alert"
        >
          {error.message}
        </div>
      )}
      <button
        type="submit"
        disabled={!content.trim() || isSubmitting}
        className="t-t-m-button t-t-m-button-submit"
        aria-label={getAriaLabel('Submit comment')}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  )
}
