import { createContext } from 'react'
import { TalkToMeContextType } from '../types/context'

export const TalkToMeContext = createContext<TalkToMeContextType | null>(null)
