import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { authenticateCredentials } from '@/shared/utils/validations/authValidations'
import { LOCAL_STORAGE_KEYS } from '@/shared/utils/storage/initLocalData'
import { getLocalItem, removeLocalItem, setLocalItem } from '@/shared/utils/storage/localStorageUtils'
import type { StoredUser } from '@/shared/types/user'

import AuthContext from './auth-context'
import type { AuthContextValue, AuthCredentials, AuthUser, UserRole } from './auth.types'

export type { AuthCredentials, AuthUser, UserRole } from './auth.types'

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

const buildAuthUser = (stored: StoredUser): AuthUser => ({
	id: stored.id,
	name: `${stored.nombre} ${stored.apellidos}`.trim(),
	email: stored.correo,
	role: mapStoredRole(stored.tipoUsuario),
})

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

