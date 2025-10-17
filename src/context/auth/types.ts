export type UserRole = 'superadmin' | 'admin' | 'customer' | 'seller'

export interface AuthUser {
	id: string
	name: string
	firstName: string
	lastName: string
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
