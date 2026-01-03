'use client'

import { createContext } from 'react'
import type { ThemeContextValue } from '@/lib/theme/types'

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)
