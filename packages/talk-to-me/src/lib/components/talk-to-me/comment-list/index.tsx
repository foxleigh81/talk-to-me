import { CommentListProps } from '@lib/types/component'
import DOMPurify from 'dompurify'
import './style.css'

export const CommentList = ({ comments, isAdmin, onApprove, onReject }: CommentListProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="t-t-m-comment-list">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className={`t-t-m-comment ${comment.status === 'pending' ? 't-t-m-comment-pending' : ''}`}
        >
          <div className="t-t-m-comment-header">
            <div className="t-t-m-comment-author">
              {comment.author?.user_metadata?.avatar_url && (
                <img
                  src={comment.author.user_metadata.avatar_url}
                  alt={`${comment.author.email}'s avatar`}
                  className="t-t-m-avatar"
                />
              )}
              <span className="t-t-m-author-email">{comment.author?.email}</span>
            </div>
            <span className="t-t-m-comment-date">{formatDate(comment.created_at)}</span>
          </div>
          <div
            className="t-t-m-comment-content"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(comment.content) }}
          />
          {isAdmin && comment.status === 'pending' && (
            <div className="t-t-m-moderation-actions">
              <button
                onClick={() => onApprove(comment.id)}
                className="t-t-m-approve-button"
                aria-label="Approve comment"
              >
                Approve
              </button>
              <button
                onClick={() => onReject(comment.id)}
                className="t-t-m-reject-button"
                aria-label="Reject comment"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
