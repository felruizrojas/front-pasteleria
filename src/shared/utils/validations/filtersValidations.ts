import { errorMessages } from './errorMessages'
import type { ValidationResult } from './types'

export type FilterValues = {
	precioMin: string
	precioMax: string
}

const parsePrice = (value: string) => {
	const trimmed = value.trim()
	if (!trimmed) {
		return null
	}

	const parsed = Number(trimmed)
	return Number.isNaN(parsed) ? null : parsed
}

export const validatePriceFilters = (values: FilterValues): ValidationResult<FilterValues> => {
	const errors: ValidationResult<FilterValues>['errors'] = {}

	const minValue = parsePrice(values.precioMin)
	const maxValue = parsePrice(values.precioMax)

	if (minValue !== null && minValue < 0) {
		errors.precioMin = errorMessages.negativePrice
	}

	if (maxValue !== null && maxValue < 0) {
		errors.precioMax = errorMessages.negativePrice
	}

	if (minValue !== null && maxValue !== null && minValue > maxValue) {
		errors.precioMax = errorMessages.priceOrder
	}

	return {
		isValid: Object.keys(errors).length === 0,
		errors,
	}
}
