import { ALLOWED_EMAIL_DOMAINS } from './authValidations'
import { errorMessages } from './errorMessages'
import type { ValidationResult } from './types'

export type ContactFormValues = {
	nombre: string
	correo: string
	comentario: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const validateContactForm = (values: ContactFormValues): ValidationResult<ContactFormValues> => {
	const errors: ValidationResult<ContactFormValues>['errors'] = {}

	const nombre = values.nombre?.trim() ?? ''
	const correo = values.correo?.trim() ?? ''
	const comentario = values.comentario?.trim() ?? ''

	if (!nombre) {
		errors.nombre = errorMessages.required('El nombre')
	} else if (nombre.length > 100) {
		errors.nombre = errorMessages.maxLength('El nombre', 100)
	}

	if (!correo) {
		errors.correo = errorMessages.required('El correo')
	} else if (correo.length > 100) {
		errors.correo = errorMessages.maxLength('El correo', 100)
	} else if (!EMAIL_REGEX.test(correo)) {
		errors.correo = errorMessages.emailFormat
	} else if (!ALLOWED_EMAIL_DOMAINS.some((domain) => correo.toLowerCase().endsWith(domain))) {
		errors.correo = errorMessages.emailDomain([...ALLOWED_EMAIL_DOMAINS])
	}

	if (!comentario) {
		errors.comentario = errorMessages.required('El comentario')
	} else if (comentario.length > 500) {
		errors.comentario = errorMessages.maxLength('El comentario', 500)
	}

	return {
		isValid: Object.keys(errors).length === 0,
		errors,
	}
}
