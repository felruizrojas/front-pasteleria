export type ThemeVariant = 'light' | 'dark'

export interface ThemeContextValue {
	theme: ThemeVariant
	setTheme: (theme: ThemeVariant) => void
	toggleTheme: () => void
}
