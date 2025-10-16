import { createContext } from 'react'

import type { ThemeContextValue } from './types'

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export default ThemeContext
