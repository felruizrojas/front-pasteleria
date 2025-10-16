import type { ReactNode } from 'react'

import cx from '@/utils/cx'

type AlertVariant =
	| 'primary'
	| 'secondary'
	| 'success'
	| 'danger'
	| 'warning'
	| 'info'
	| 'light'
	| 'dark'

interface AlertProps {
	children: ReactNode
	variant?: AlertVariant
	title?: ReactNode
	className?: string
}

const Alert = ({ children, variant = 'primary', title, className }: AlertProps) => (
	<div className={cx(`alert alert-${variant}`, className)} role="alert">
		{title ? <h6 className="alert-heading mb-2">{title}</h6> : null}
		<div>{children}</div>
	</div>
)

export default Alert
