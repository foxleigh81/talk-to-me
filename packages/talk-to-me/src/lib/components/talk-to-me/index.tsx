import { useState, useEffect, useRef } from 'react'
import { useTalkToMe } from '../../hooks/use-talk-to-me'
import { CommentInput } from './comment-input'
import { CommentList } from './comment-list'
import { Comment, TalkToMeProps } from '../../types/component'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { sanitizeComment, validateComment, isRateLimited } from '../../utils/security'
import { paginateComments, cacheComments, getCachedComments } from '../../utils/performance'
import { retry, getErrorMessage, TalkToMeError } from '../../utils/error'
import { getAriaLabel, getAriaDescribedBy, announceToScreenReader } from '../../utils/accessibility'
import { LoginForm } from '../login-form'

export const TalkToMe = ({ postId, className = '' }: TalkToMeProps) => {
  const { user, isAdmin, supabase } = useTalkToMe()
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const lastSubmissionTime = useRef<number>(0)

  useEffect(() => {
    loadComments()

    // Subscribe to new comments
    const subscription = supabase
      .channel('comments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`
        },
        (payload: RealtimePostgresChangesPayload<Comment>) => {
          if (payload.eventType === 'INSERT') {
            setComments((prev) => [...prev, payload.new])
            announceToScreenReader('New comment received')
          } else if (payload.eventType === 'UPDATE') {
            setComments((prev) =>
              prev.map((comment) =>
                comment.id === payload.new.id ? payload.new : comment
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setComments((prev) => prev.filter((comment) => comment.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [postId, supabase])

  const loadComments = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Try to get cached comments first
      const cachedComments = getCachedComments(postId)
      if (cachedComments) {
        setComments(cachedComments)
        setIsLoading(false)
        return
      }

      const { data, error } = await retry(async () => {
        const result = await supabase
          .from('comments')
          .select('*, author:users(*)')
          .eq('post_id', postId)
          .order('created_at', { ascending: true })
        return result
      })

      if (error) throw error

      const loadedComments = data as Comment[]
      setComments(loadedComments)
      cacheComments(postId, loadedComments)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load comments')
      setError(error)
      announceToScreenReader(getErrorMessage(error), 'assertive')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (content: string) => {
    if (!user) return

    try {
      // Validate and sanitize content
      const validation = validateComment(content)
      if (!validation.isValid) {
        throw new TalkToMeError(validation.error || 'Invalid comment', 'VALIDATION_ERROR')
      }

      // Check rate limiting
      if (isRateLimited(lastSubmissionTime.current)) {
        throw new TalkToMeError(
          'Please wait a moment before posting another comment',
          'RATE_LIMIT_ERROR'
        )
      }

      setIsSubmitting(true)
      setError(null)

      const sanitizedContent = sanitizeComment(content)

      const { error } = await retry(async () => {
        const result = await supabase.from('comments').insert({
          post_id: postId,
          author_id: user.id,
          content: sanitizedContent,
          status: 'pending'
        })
        return result
      })

      if (error) throw error

      lastSubmissionTime.current = Date.now()
      announceToScreenReader('Comment submitted successfully')
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to post comment')
      setError(error)
      announceToScreenReader(getErrorMessage(error), 'assertive')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApprove = async (commentId: string) => {
    try {
      setError(null)
      const { error } = await retry(async () => {
        const result = await supabase
          .from('comments')
          .update({ status: 'approved' })
          .eq('id', commentId)
        return result
      })

      if (error) throw error
      announceToScreenReader('Comment approved')
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to approve comment')
      setError(error)
      announceToScreenReader(getErrorMessage(error), 'assertive')
    }
  }

  const handleReject = async (commentId: string) => {
    try {
      setError(null)
      const { error } = await retry(async () => {
        const result = await supabase
          .from('comments')
          .update({ status: 'rejected' })
          .eq('id', commentId)
        return result
      })

      if (error) throw error
      announceToScreenReader('Comment rejected')
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to reject comment')
      setError(error)
      announceToScreenReader(getErrorMessage(error), 'assertive')
    }
  }

  const filteredComments = comments.filter(
    (comment) => comment.status === 'approved' || (isAdmin && comment.status === 'pending')
  )

  const { comments: paginatedComments, hasMore: hasMoreComments, nextPage } = paginateComments(
    filteredComments,
    currentPage
  )

  const loadMore = () => {
    setCurrentPage(nextPage)
    setHasMore(hasMoreComments)
  }

  return (
    <div
      className={`t-t-m-container ${className}`}
      role="region"
      aria-label={getAriaLabel('Comments section')}
      aria-describedby={getAriaDescribedBy('comments')}
    >
      <div id="t-t-m-live-region" aria-live="polite" className="t-t-m-sr-only" />
      {isLoading ? (
        <div className="t-t-m-loading" role="status">Loading comments...</div>
      ) : (
        <>
          <CommentList
            comments={paginatedComments}
            isAdmin={isAdmin}
            onApprove={handleApprove}
            onReject={handleReject}
            hasMore={hasMore}
            onLoadMore={loadMore}
          />
          {user ? (
            <CommentInput
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              error={error}
            />
          ) : (
            <LoginForm />
          )}
        </>
      )}
    </div>
  )
}
