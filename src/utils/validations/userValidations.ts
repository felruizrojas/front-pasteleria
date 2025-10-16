import type { StoredUser, UserRoleName } from '@/types/user'
import { LOCAL_STORAGE_KEYS } from '@/utils/storage/initLocalData'
import { getLocalData, setLocalData } from '@/utils/storage/localStorageUtils'

import { ALLOWED_EMAIL_DOMAINS } from './authValidations'
import { errorMessages } from './errorMessages'
import type { ValidationResult } from './types'

type RegionSeed = {
	id: string
	nombre: string
	comunas: string[]
}

export const MIN_AGE = 18

export type UserFormValues = {
	id?: string
	run: string
	nombre: string
	apellidos: string
	correo: string
	fechaNacimiento?: string
	regionId: string
	comuna: string
	direccion: string
	password: string
	confirmPassword?: string
}

export type ResetPasswordFormValues = {
	email: string
	password: string
	confirmPassword: string
}

type UserValidationOptions = {
	mode: 'create' | 'update'
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const sanitizeRun = (value: string) => value.replace(/[^0-9kK]/g, '').toUpperCase()

const calculateRunVerifier = (runNumbers: string): string => {
	let sum = 0
	let multiplier = 2

	for (let index = runNumbers.length - 1; index >= 0; index -= 1) {
		sum += Number(runNumbers[index]) * multiplier
		multiplier = multiplier === 7 ? 2 : multiplier + 1
	}

	const remainder = 11 - (sum % 11)
	if (remainder === 11) {
		return '0'
	}
	if (remainder === 10) {
		return 'K'
	}
	return String(remainder)
}

const isValidRun = (run: string): boolean => {
	const normalized = sanitizeRun(run)
	if (!/^[0-9]{7,8}[0-9K]$/.test(normalized)) {
		return false
	}

	const body = normalized.slice(0, -1)
	const verifier = normalized.slice(-1)
	return calculateRunVerifier(body) === verifier
}

export const validateAge = (value: string | undefined, minAge = MIN_AGE): boolean => {
	if (!value) {
		return true
	}

	const parsed = new Date(value)
	if (Number.isNaN(parsed.getTime())) {
		return false
	}

	const today = new Date()
	let age = today.getFullYear() - parsed.getFullYear()
	const monthDiff = today.getMonth() - parsed.getMonth()
	if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < parsed.getDate())) {
		age -= 1
	}

	return age >= minAge
}

export const determineUserType = (email: string): UserRoleName => {
	const domain = email.trim().toLowerCase().split('@')[1] ?? ''
	if (domain === 'profesor.duoc.cl') {
		return 'Vendedor'
	}
	if (domain === 'duoc.cl') {
		return 'Administrador'
	}
	return 'Cliente'
}

const getRegionById = (id: string): RegionSeed | undefined => {
	const regions = getLocalData<RegionSeed>(LOCAL_STORAGE_KEYS.regiones)
	return regions.find((region) => region.id === id)
}

const emailExists = (email: string, excludeId?: string): boolean => {
	const users = getLocalData<StoredUser>(LOCAL_STORAGE_KEYS.usuarios)
	const normalized = email.trim().toLowerCase()
	return users.some((user) => user.correo.toLowerCase() === normalized && user.id !== excludeId)
}

export const validateUserForm = (
	values: UserFormValues,
	options: UserValidationOptions,
): ValidationResult<UserFormValues> => {
	const errors: ValidationResult<UserFormValues>['errors'] = {}

	const run = values.run?.trim() ?? ''
	const nombre = values.nombre?.trim() ?? ''
	const apellidos = values.apellidos?.trim() ?? ''
	const correo = values.correo?.trim() ?? ''
	const direccion = values.direccion?.trim() ?? ''
	const regionId = values.regionId?.trim() ?? ''
	const comuna = values.comuna?.trim() ?? ''
	const password = values.password?.trim() ?? ''
	const confirmPassword = values.confirmPassword?.trim() ?? ''

	if (!run) {
		errors.run = errorMessages.required('El RUN')
	} else if (!isValidRun(run)) {
		errors.run = errorMessages.runFormat
	}

	if (!nombre) {
		errors.nombre = errorMessages.required('El nombre')
	} else if (nombre.length > 50) {
		errors.nombre = errorMessages.maxLength('El nombre', 50)
	}

	if (!apellidos) {
		errors.apellidos = errorMessages.required('Los apellidos')
	} else if (apellidos.length > 100) {
		errors.apellidos = errorMessages.maxLength('Los apellidos', 100)
	}

	if (!correo) {
		errors.correo = errorMessages.required('El correo')
	} else if (correo.length > 100) {
		errors.correo = errorMessages.maxLength('El correo', 100)
	} else if (!EMAIL_REGEX.test(correo)) {
		errors.correo = errorMessages.emailFormat
	} else {
		const correoDomain = correo.toLowerCase().split('@')[1] ?? ''
		const isAllowedDomain = ALLOWED_EMAIL_DOMAINS.some((allowed) => allowed === correoDomain)
		if (!isAllowedDomain) {
			errors.correo = errorMessages.emailDomain([...ALLOWED_EMAIL_DOMAINS])
		} else if (emailExists(correo, values.id)) {
			errors.correo = errorMessages.duplicateEmail
		}
	}

	if (values.fechaNacimiento) {
		if (!validateAge(values.fechaNacimiento)) {
			errors.fechaNacimiento = errorMessages.ageRestriction(MIN_AGE)
		}
	}

	if (!regionId) {
		errors.regionId = errorMessages.selectionRequired('región')
	} else if (!getRegionById(regionId)) {
		errors.regionId = 'La región seleccionada no es válida'
	}

	if (!comuna) {
		errors.comuna = errorMessages.selectionRequired('comuna')
	}

	if (!direccion) {
		errors.direccion = errorMessages.required('La dirección')
	} else if (direccion.length > 300) {
		errors.direccion = errorMessages.maxLength('La dirección', 300)
	}

	if (options.mode === 'create') {
		if (!password) {
			errors.password = errorMessages.required('La contraseña')
		} else if (password.length < 4 || password.length > 10) {
			errors.password = 'La contraseña debe tener entre 4 y 10 caracteres'
		}

		if (!confirmPassword) {
			errors.confirmPassword = errorMessages.required('La confirmación de contraseña')
		} else if (password && password !== confirmPassword) {
			errors.confirmPassword = errorMessages.passwordMismatch
		}
	} else {
		if (password) {
			if (password.length < 4 || password.length > 10) {
				errors.password = 'La contraseña debe tener entre 4 y 10 caracteres'
			}
			if (confirmPassword && password !== confirmPassword) {
				errors.confirmPassword = errorMessages.passwordMismatch
			}
		}
	}

	return {
		isValid: Object.keys(errors).length === 0,
		errors,
	}
}

export const validateResetPasswordForm = (
	values: ResetPasswordFormValues,
): ValidationResult<ResetPasswordFormValues> => {
	const errors: ValidationResult<ResetPasswordFormValues>['errors'] = {}

	const email = values.email?.trim() ?? ''
	const password = values.password?.trim() ?? ''
	const confirmPassword = values.confirmPassword?.trim() ?? ''

	if (!email) {
		errors.email = errorMessages.required('El correo')
	} else if (email.length > 100) {
		errors.email = errorMessages.maxLength('El correo', 100)
	} else if (!EMAIL_REGEX.test(email)) {
		errors.email = errorMessages.emailFormat
	} else {
		const correoDomain = email.toLowerCase().split('@')[1] ?? ''
		const isAllowedDomain = ALLOWED_EMAIL_DOMAINS.some((allowed) => allowed === correoDomain)
		if (!isAllowedDomain) {
			errors.email = errorMessages.emailDomain([...ALLOWED_EMAIL_DOMAINS])
		} else if (!findUserByEmail(email)) {
			errors.email = errorMessages.userNotFound
		}
	}

	if (!password) {
		errors.password = errorMessages.required('La contraseña')
	} else if (password.length < 4 || password.length > 10) {
		errors.password = 'La contraseña debe tener entre 4 y 10 caracteres'
	}

	if (!confirmPassword) {
		errors.confirmPassword = errorMessages.required('La confirmación de contraseña')
	} else if (password && password !== confirmPassword) {
		errors.confirmPassword = errorMessages.passwordMismatch
	}

	return {
		isValid: Object.keys(errors).length === 0,
		errors,
	}
}

const generateUserId = () => {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID()
	}
	return `user-${Date.now()}`
}

export const mapFormToStoredUser = (values: UserFormValues, current?: StoredUser | null): StoredUser => {
	const region = getRegionById(values.regionId)
	const timestamp = new Date().toISOString()
	const sanitizedPassword = values.password.trim() || current?.password || ''
	const identifier = values.id ?? current?.id ?? generateUserId()

	return {
		id: identifier,
		run: sanitizeRun(values.run),
		nombre: values.nombre.trim(),
		apellidos: values.apellidos.trim(),
		correo: values.correo.trim().toLowerCase(),
		fechaNacimiento: values.fechaNacimiento || current?.fechaNacimiento || undefined,
		tipoUsuario: determineUserType(values.correo),
		regionId: values.regionId,
		regionNombre: region?.nombre ?? values.regionId,
		comuna: values.comuna.trim(),
		direccion: values.direccion.trim(),
		password: sanitizedPassword,
		createdAt: current?.createdAt ?? timestamp,
		updatedAt: timestamp,
	}
}

export const saveUserRecord = (record: StoredUser): StoredUser[] => {
	const users = getLocalData<StoredUser>(LOCAL_STORAGE_KEYS.usuarios)
	const index = users.findIndex((user) => user.id === record.id)

	if (index === -1) {
		users.push(record)
	} else {
		users[index] = { ...users[index], ...record, createdAt: users[index].createdAt ?? record.createdAt }
	}

	setLocalData(LOCAL_STORAGE_KEYS.usuarios, users)
	return users
}

export const findUserById = (id: string): StoredUser | undefined => {
	const users = getLocalData<StoredUser>(LOCAL_STORAGE_KEYS.usuarios)
	return users.find((user) => user.id === id)
}

export const findUserByEmail = (email: string): StoredUser | undefined => {
	const users = getLocalData<StoredUser>(LOCAL_STORAGE_KEYS.usuarios)
	const normalized = email.trim().toLowerCase()
	return users.find((user) => user.correo.toLowerCase() === normalized)
}
