import { createContext, useContext } from 'react'
import { TalkToMeContextType } from '../../types/context'

export const TalkToMeContext = createContext<TalkToMeContextType | undefined>(undefined)

export const useTalkToMe = () => {
  const context = useContext(TalkToMeContext)
  if (context === undefined) {
    throw new Error('useTalkToMe must be used within a TalkToMeProvider')
  }
  return context
}
