import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import AuthContext from './auth-context'
import type { AuthContextValue, AuthCredentials, AuthUser } from './auth.types'

export type { AuthCredentials, AuthUser, UserRole } from './auth.types'

const AUTH_STORAGE_KEY = 'pasteleria.auth.user'

const usersDirectory: Record<string, AuthUser & { password: string }> = {
	'admin@mil-sabores.com': {
		id: '1',
		name: 'Administrador',
		email: 'admin@mil-sabores.com',
		role: 'admin',
		password: 'admin123',
	},
	'cliente@mil-sabores.com': {
		id: '2',
		name: 'Cliente Demo',
		email: 'cliente@mil-sabores.com',
		role: 'customer',
		password: 'cliente123',
	},
}

const readPersistedUser = (): AuthUser | null => {
	if (typeof window === 'undefined') {
		return null
	}

	try {
		const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
		if (!raw) {
			return null
		}

		const parsed: AuthUser = JSON.parse(raw)
		if (parsed && parsed.id && parsed.email && parsed.role) {
			return parsed
		}
	} catch (error) {
		console.warn('Failed to read persisted user.', error)
	}

	return null
}

type AuthProviderProps = {
	children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
	const [user, setUser] = useState<AuthUser | null>(() => readPersistedUser())
	const [loading, setLoading] = useState<boolean>(false)

	useEffect(() => {
		if (typeof window === 'undefined') {
			return
		}

		if (user) {
			window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
		} else {
			window.localStorage.removeItem(AUTH_STORAGE_KEY)
		}
	}, [user])

	const login = useCallback(async ({ email, password }: AuthCredentials) => {
		setLoading(true)

		try {
			await new Promise((resolve) => setTimeout(resolve, 400))

			const normalizedEmail = email.trim().toLowerCase()
			const registeredUser = usersDirectory[normalizedEmail] || null

			if (!registeredUser || registeredUser.password !== password) {
				throw new Error('Credenciales invalidas')
			}

			setUser({
				id: registeredUser.id,
				name: registeredUser.name,
				email: registeredUser.email,
				role: registeredUser.role,
			})
		} finally {
			setLoading(false)
		}
	}, [])

	const logout = useCallback(() => {
		setUser(null)
	}, [])

	const value = useMemo<AuthContextValue>(
		() => ({
			user,
			loading,
			isAuthenticated: Boolean(user),
			login,
			logout,
		}),
		[loading, login, logout, user],
	)

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

