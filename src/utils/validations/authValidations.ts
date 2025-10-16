import { LOCAL_STORAGE_KEYS } from '@/utils/storage/initLocalData'
import { getLocalData } from '@/utils/storage/localStorageUtils'
import type { StoredUser } from '@/types/user'

import { errorMessages } from './errorMessages'
import type { ValidationResult } from './types'

export const ALLOWED_EMAIL_DOMAINS = ['duoc.cl', 'profesor.duoc.cl', 'gmail.com'] as const

export type LoginFormValues = {
	email: string
	password: string
}

type AuthenticationResult = {
	success: boolean
	error?: string
	user?: StoredUser
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const normalizeEmail = (value: string) => value.trim().toLowerCase()

const extractDomain = (email: string) => {
	const parts = normalizeEmail(email).split('@')
	return parts.length === 2 ? parts[1] : ''
}

const isAllowedDomain = (email: string) => ALLOWED_EMAIL_DOMAINS.some((domain) => extractDomain(email).endsWith(domain))

export const validateLoginForm = (values: LoginFormValues): ValidationResult<LoginFormValues> => {
	const errors: ValidationResult<LoginFormValues>['errors'] = {}

	const email = values.email?.trim() ?? ''
	const password = values.password?.trim() ?? ''

	if (!email) {
		errors.email = errorMessages.required('El correo')
	} else if (email.length > 100) {
		errors.email = errorMessages.maxLength('El correo', 100)
	} else if (!EMAIL_REGEX.test(email)) {
		errors.email = errorMessages.emailFormat
	} else if (!isAllowedDomain(email)) {
		errors.email = errorMessages.emailDomain([...ALLOWED_EMAIL_DOMAINS])
	}

	if (!password) {
		errors.password = errorMessages.required('La contraseña')
	} else if (password.length < 4 || password.length > 10) {
		errors.password = 'La contraseña debe tener entre 4 y 10 caracteres'
	}

	return {
		isValid: Object.keys(errors).length === 0,
		errors,
	}
}

export const authenticateCredentials = (values: LoginFormValues): AuthenticationResult => {
	const users = getLocalData<StoredUser>(LOCAL_STORAGE_KEYS.usuarios)
	if (!users.length) {
		return { success: false, error: errorMessages.credentials }
	}

	const normalizedEmail = normalizeEmail(values.email)
	const matchedUser = users.find(
		(user) => normalizeEmail(user.correo) === normalizedEmail && user.password === values.password.trim(),
	)

	if (!matchedUser) {
		return { success: false, error: errorMessages.credentials }
	}

	return { success: true, user: matchedUser }
}
