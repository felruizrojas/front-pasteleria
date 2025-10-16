export type ValidationErrors<T extends Record<string, unknown>> = Partial<Record<keyof T, string>>

export type ValidationResult<T extends Record<string, unknown>> = {
	isValid: boolean
	errors: ValidationErrors<T>
}
