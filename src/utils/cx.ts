type ClassValue = string | Record<string, boolean> | false | null | undefined

const cx = (...values: ClassValue[]) => {
	const classes: string[] = []

	values.forEach((value) => {
		if (!value) {
			return
		}

		if (typeof value === 'string') {
			classes.push(value)
			return
		}

		Object.entries(value).forEach(([className, isActive]) => {
			if (isActive) {
				classes.push(className)
			}
		})
	})

	return classes.join(' ')
}

export default cx
export type { ClassValue }
