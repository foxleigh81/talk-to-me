import { useContext } from 'react'
import { TalkToMeContext } from '../context/talk-to-me-context'

export const useTalkToMe = () => {
  const context = useContext(TalkToMeContext)
  if (!context) {
    throw new Error('useTalkToMe must be used within a TalkToMeProvider')
  }
  return context
}
