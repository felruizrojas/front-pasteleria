export type UserRole = 'admin' | 'customer'

export interface AuthUser {
	id: string
	name: string
	email: string
	role: UserRole
}

export interface AuthCredentials {
	email: string
	password: string
}

export interface AuthContextValue {
	user: AuthUser | null
	loading: boolean
	isAuthenticated: boolean
	login: (credentials: AuthCredentials) => Promise<void>
	logout: () => void
}
