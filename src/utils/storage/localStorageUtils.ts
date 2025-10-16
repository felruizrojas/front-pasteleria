const isBrowser = typeof window !== 'undefined'

const safeParse = <T>(value: string | null, fallback: T): T => {
	if (!value) {
		return fallback
	}

	try {
		return JSON.parse(value) as T
	} catch (error) {
		console.warn('No fue posible leer los datos desde localStorage', error)
		return fallback
	}
}

export const getLocalData = <T>(key: string): T[] => {
	if (!isBrowser) {
		return []
	}

	return safeParse<T[]>(window.localStorage.getItem(key), [])
}

export const setLocalData = <T>(key: string, data: T[]): void => {
	if (!isBrowser) {
		return
	}

	window.localStorage.setItem(key, JSON.stringify(data))
}

export const appendLocalData = <T>(key: string, item: T): void => {
	const data = getLocalData<T>(key)
	data.push(item)
	setLocalData(key, data)
}

export const getLocalItem = <T>(key: string): T | null => {
	if (!isBrowser) {
		return null
	}

	return safeParse<T | null>(window.localStorage.getItem(key), null)
}

export const setLocalItem = <T>(key: string, item: T): void => {
	if (!isBrowser) {
		return
	}

	window.localStorage.setItem(key, JSON.stringify(item))
}

export const removeLocalItem = (key: string): void => {
	if (!isBrowser) {
		return
	}

	window.localStorage.removeItem(key)
}
