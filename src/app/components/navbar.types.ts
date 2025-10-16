export type PrimaryLink = {
	label: string
	to: string
	icon?: string
	ariaLabel?: string
}

export type SecondaryLink = {
	label: string
	to: string
	icon: string
	ariaLabel?: string
	external?: boolean
}
