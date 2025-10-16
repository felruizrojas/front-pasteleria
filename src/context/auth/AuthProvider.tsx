import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import AuthContext from './AuthContext'
import type { AuthContextValue, AuthCredentials, AuthUser, UserRole } from './types'
import { authenticateCredentials } from '@/utils/validations/authValidations'
import { LOCAL_STORAGE_KEYS } from '@/utils/storage/initLocalData'
import { getLocalItem, removeLocalItem, setLocalItem } from '@/utils/storage/localStorageUtils'
import type { StoredUser } from '@/types/user'

export type { AuthCredentials, AuthUser, UserRole } from './types'

const ACTIVE_USER_KEY = LOCAL_STORAGE_KEYS.activeUser

const mapStoredRole = (role: StoredUser['tipoUsuario']): UserRole => {
	switch (role) {
		case 'Administrador':
			return 'admin'
		case 'Vendedor':
			return 'seller'
		default:
			return 'customer'
	}
}

const extractFirstSegment = (value?: string) => {
	if (!value) {
		return ''
	}

	const [first = ''] = value.trim().split(/\s+/)
	return first
}

const buildAuthUser = (stored: StoredUser): AuthUser => {
	const firstName = extractFirstSegment(stored.nombre)
	const lastName = extractFirstSegment(stored.apellidos)

	return {
		id: stored.id,
		name: `${stored.nombre} ${stored.apellidos}`.trim(),
		firstName,
		lastName,
		email: stored.correo,
		role: mapStoredRole(stored.tipoUsuario),
	}
}

const readPersistedUser = (): AuthUser | null => {
	const stored = getLocalItem<StoredUser>(ACTIVE_USER_KEY)
	if (!stored) {
		return null
	}

	try {
		return buildAuthUser(stored)
	} catch {
		return null
	}
}

type AuthProviderProps = {
	children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
	const [user, setUser] = useState<AuthUser | null>(() => readPersistedUser())
	const [loading, setLoading] = useState<boolean>(false)

	useEffect(() => {
		if (!user) {
			removeLocalItem(ACTIVE_USER_KEY)
		}
	}, [user])

	const login = useCallback(async ({ email, password }: AuthCredentials) => {
		setLoading(true)

		try {
			await new Promise((resolve) => setTimeout(resolve, 350))

			const result = authenticateCredentials({ email, password })
			if (!result.success || !result.user) {
				throw new Error(result.error ?? 'Credenciales invalidas')
			}

			setLocalItem(ACTIVE_USER_KEY, result.user)
			setUser(buildAuthUser(result.user))
		} finally {
			setLoading(false)
		}
	}, [])

	const logout = useCallback(() => {
		setUser(null)
		removeLocalItem(ACTIVE_USER_KEY)
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
