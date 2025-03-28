import { User } from '@supabase/supabase-js'

export interface Comment {
  id: string
  post_id: string
  author_id: string
  content: string
  status: 'pending' | 'approved' | 'rejected' | 'deleted'
  created_at: string
  parent_id?: string
  author?: User
}

export interface TalkToMeProps {
  postId: string
  className?: string
}

export interface CommentListProps {
  comments: Comment[]
  isAdmin: boolean
  onApprove: (commentId: string) => Promise<void>
  onReject: (commentId: string) => Promise<void>
}

export interface CommentInputProps {
  onSubmit: (content: string) => Promise<void>
  isSubmitting: boolean
  error: Error | null
}
