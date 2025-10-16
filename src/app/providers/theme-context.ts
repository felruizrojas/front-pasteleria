import { createContext } from 'react'

import type { ThemeContextValue } from './theme.types'

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export default ThemeContext
