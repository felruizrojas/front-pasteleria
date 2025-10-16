import { useContext } from 'react'

import ThemeContext from '@/app/providers/theme-context'

const useTheme = () => {
	const context = useContext(ThemeContext)

	if (!context) {
		throw new Error('useTheme must be used within a ThemeProvider')
	}

	return context
}

export default useTheme
