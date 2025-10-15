import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode, Ref } from 'react'
import { forwardRef } from 'react'
import type { LinkProps } from 'react-router-dom'
import { Link } from 'react-router-dom'

import cx from '../../utils/cx'

type ButtonSize = 'sm' | 'lg'

type BaseProps = {
	children: ReactNode
	size?: ButtonSize
	block?: boolean
	className?: string
}

type NativeButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { as?: 'button'; href?: never; to?: never }
type AnchorButtonProps = BaseProps & AnchorHTMLAttributes<HTMLAnchorElement> & { as: 'a'; href: string; to?: never }
type RouterButtonProps = BaseProps & Omit<LinkProps, 'className'> & { as: 'link' }

type ButtonProps = NativeButtonProps | AnchorButtonProps | RouterButtonProps

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
	({ children, size, block, className, as = 'button', ...rest }, ref) => {
		const baseClass = cx(
			'btn',
			'btn-app',
			size ? `btn-app--${size}` : null,
			block ? 'w-100' : null,
			className,
		)

		if (as === 'a') {
			const { href, ...anchorRest } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
			return (
				<a className={baseClass} ref={ref as Ref<HTMLAnchorElement>} href={href} {...anchorRest}>
					{children}
				</a>
			)
		}

		if (as === 'link') {
			const { to, ...linkRest } = rest as RouterButtonProps
			return (
				<Link className={baseClass} ref={ref as Ref<HTMLAnchorElement>} to={to} {...linkRest}>
					{children}
				</Link>
			)
		}

		const buttonProps = rest as ButtonHTMLAttributes<HTMLButtonElement>
		return (
			<button className={baseClass} ref={ref as Ref<HTMLButtonElement>} {...buttonProps}>
				{children}
			</button>
		)
	},
)

Button.displayName = 'Button'

export default Button
