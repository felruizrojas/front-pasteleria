import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import ThemeContext from './ThemeContext'
import type { ThemeContextValue, ThemeVariant } from './types'

export type { ThemeVariant } from './types'

const THEME_STORAGE_KEY = 'pasteleria.theme'

const readInitialTheme = (): ThemeVariant => {
	if (typeof window === 'undefined') {
		return 'light'
	}

	const persisted = window.localStorage.getItem(THEME_STORAGE_KEY)
	if (persisted === 'dark' || persisted === 'light') {
		return persisted
	}

	const prefersDarkScheme = window.matchMedia?.('(prefers-color-scheme: dark)').matches
	return prefersDarkScheme ? 'dark' : 'light'
}

type ThemeProviderProps = {
	children: ReactNode
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
	const [theme, setThemeState] = useState<ThemeVariant>(() => readInitialTheme())

	useEffect(() => {
		if (typeof document === 'undefined') {
			return
		}

		const root = document.documentElement
		root.dataset.theme = theme
		root.classList.remove(theme === 'dark' ? 'light' : 'dark')
		root.classList.add(theme)

		if (typeof window !== 'undefined') {
			window.localStorage.setItem(THEME_STORAGE_KEY, theme)
		}
	}, [theme])

	const setTheme = useCallback((nextTheme: ThemeVariant) => {
		setThemeState(nextTheme)
	}, [])

	const toggleTheme = useCallback(() => {
		setThemeState((current) => (current === 'dark' ? 'light' : 'dark'))
	}, [])

	const value = useMemo<ThemeContextValue>(
		() => ({
			theme,
			setTheme,
			toggleTheme,
		}),
		[setTheme, theme, toggleTheme],
	)

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
