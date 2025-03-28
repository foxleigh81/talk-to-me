import { useState, useEffect } from 'react'
import { useTalkToMe } from '@lib/hooks/use-talk-to-me'
import { CommentInput } from './comment-input'
import { CommentList } from './comment-list'
import { Comment, TalkToMeProps } from '@lib/types/component'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import './style.css'

export const TalkToMe = ({ postId, className = '' }: TalkToMeProps) => {
  const { user, isAdmin, supabase } = useTalkToMe()
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

      const { data, error } = await supabase
        .from('comments')
        .select('*, author:users(*)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (error) throw error

      setComments(data as Comment[])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load comments'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (content: string) => {
    if (!user) return

    try {
      setIsSubmitting(true)
      setError(null)

      const { error } = await supabase.from('comments').insert({
        post_id: postId,
        author_id: user.id,
        content,
        status: 'pending'
      })

      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to post comment'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApprove = async (commentId: string) => {
    try {
      setError(null)
      const { error } = await supabase
        .from('comments')
        .update({ status: 'approved' })
        .eq('id', commentId)

      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to approve comment'))
    }
  }

  const handleReject = async (commentId: string) => {
    try {
      setError(null)
      const { error } = await supabase
        .from('comments')
        .update({ status: 'rejected' })
        .eq('id', commentId)

      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to reject comment'))
    }
  }

  const filteredComments = comments.filter(
    (comment) => comment.status === 'approved' || (isAdmin && comment.status === 'pending')
  )

  return (
    <div className={`t-t-m-container ${className}`}>
      {isLoading ? (
        <div className="t-t-m-loading">Loading comments...</div>
      ) : (
        <>
          <CommentList
            comments={filteredComments}
            isAdmin={isAdmin}
            onApprove={handleApprove}
            onReject={handleReject}
          />
          {user && (
            <CommentInput
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              error={error}
            />
          )}
          {!user && (
            <div className="t-t-m-login-prompt">
              Please sign in to leave a comment
            </div>
          )}
        </>
      )}
    </div>
  )
}
