import { useEffect, useRef } from 'react'
import { CommentListProps } from '../../../types/component'
import { getAriaLabel } from '../../../utils/accessibility'
// CSS is now handled by a global stylesheet imported in the main index.ts file

export const CommentList = ({
  comments,
  isAdmin,
  onApprove,
  onReject,
  hasMore,
  onLoadMore
}: CommentListProps) => {
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hasMore) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore()
        }
      },
      { threshold: 0.5 }
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMore, onLoadMore])

  return (
    <div
      className="t-t-m-comment-list"
      role="list"
      aria-label={getAriaLabel('Comments')}
    >
      {comments.map((comment) => (
        <div
          key={comment.id}
          className={`t-t-m-comment ${comment.status === 'pending' ? 't-t-m-pending' : ''}`}
          role="listitem"
        >
          <div className="t-t-m-comment-content">
            <div className="t-t-m-comment-header">
              <span className="t-t-m-comment-author">
                {comment.author?.email || 'Anonymous'}
              </span>
              <span className="t-t-m-comment-date">
                {new Date(comment.created_at).toLocaleDateString()}
              </span>
            </div>
            <div
              className="t-t-m-comment-text"
              dangerouslySetInnerHTML={{ __html: comment.content }}
            />
          </div>
          {isAdmin && comment.status === 'pending' && (
            <div className="t-t-m-comment-actions">
              <button
                onClick={() => onApprove(comment.id)}
                className="t-t-m-button t-t-m-button-approve"
                aria-label={getAriaLabel('Approve comment')}
              >
                Approve
              </button>
              <button
                onClick={() => onReject(comment.id)}
                className="t-t-m-button t-t-m-button-reject"
                aria-label={getAriaLabel('Reject comment')}
              >
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
      {hasMore && (
        <div
          ref={loadMoreRef}
          className="t-t-m-load-more"
          role="status"
          aria-label="Loading more comments"
        >
          Loading more comments...
        </div>
      )}
    </div>
  )
}
