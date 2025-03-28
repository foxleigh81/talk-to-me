import { createContext } from 'react'
import { TalkToMeContextType } from '@lib/types/context'

export const TalkToMeContext = createContext<TalkToMeContextType | null>(null)
