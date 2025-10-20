type BootstrapOffcanvasInstance = {
	show?: () => void
	hide?: () => void
}

type BootstrapApi = {
	Offcanvas?: {
		getInstance?: (element: HTMLElement) => BootstrapOffcanvasInstance | null | undefined
		getOrCreateInstance?: (element: HTMLElement) => BootstrapOffcanvasInstance | null | undefined
	}
} | null

const getBootstrapApi = (): BootstrapApi => {
	if (typeof window === 'undefined') {
		return null
	}

	return (window as typeof window & { bootstrap?: BootstrapApi }).bootstrap ?? null
}

const getOffcanvasInstance = (element: HTMLElement | null) => {
	const bootstrapApi = getBootstrapApi()
	if (!element || !bootstrapApi) {
		return null
	}

	return (
		bootstrapApi.Offcanvas?.getInstance?.(element) ??
		bootstrapApi.Offcanvas?.getOrCreateInstance?.(element) ??
		null
	)
}

export const showOffcanvas = (id: string) => {
	const element = typeof document !== 'undefined' ? document.getElementById(id) : null
	const instance = getOffcanvasInstance(element)
	instance?.show?.()
}

export const hideOffcanvas = (id: string) => {
	const element = typeof document !== 'undefined' ? document.getElementById(id) : null
	const instance = getOffcanvasInstance(element)
	if (instance) {
		instance.hide?.()
	} else if (element) {
		element.classList.remove('show')
		element.setAttribute('aria-hidden', 'true')
		if (element.style) {
			element.style.visibility = 'hidden'
		}
	}

	if (typeof document !== 'undefined') {
		document.querySelectorAll('.offcanvas-backdrop').forEach((backdrop) => {
			if (backdrop instanceof HTMLElement) {
				backdrop.classList.remove('show')
				backdrop.remove()
			}
		})
	}

	if (typeof document !== 'undefined') {
		document.body.classList.remove('offcanvas-open')
		document.body.style.removeProperty('overflow')
		document.body.removeAttribute('data-bs-overflow')
		document.body.removeAttribute('data-bs-padding-right')
	}
}

export const cleanupOffcanvas = (id: string) => {
	// Try to ensure any bootstrap instance is present and hidden, then remove backdrops and body classes.
	const element = typeof document !== 'undefined' ? document.getElementById(id) : null
	const bootstrapApi = getBootstrapApi()
	if (element && bootstrapApi) {
		// Try to get or create instance and hide it
		const instance = bootstrapApi.Offcanvas?.getOrCreateInstance?.(element)
		instance?.hide?.()
	}

	// Remove any stray backdrops
	if (typeof document !== 'undefined') {
		document.querySelectorAll('.offcanvas-backdrop').forEach((backdrop) => {
			if (backdrop instanceof HTMLElement) {
				backdrop.classList.remove('show')
				backdrop.remove()
			}
		})

		// Reset body state
		document.body.classList.remove('offcanvas-open')
		document.body.style.removeProperty('overflow')
		document.body.removeAttribute('data-bs-overflow')
		document.body.removeAttribute('data-bs-padding-right')
	}
}

export const remountLoginOffcanvas = () => {
	if (typeof window === 'undefined') return
	window.dispatchEvent(new CustomEvent('remountLoginOffcanvas'))
}
