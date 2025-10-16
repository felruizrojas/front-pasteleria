import type { InputHTMLAttributes, ReactNode } from 'react'
import { forwardRef, useId } from 'react'

import cx from '@/utils/cx'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
	label?: ReactNode
	helperText?: ReactNode
	errorText?: ReactNode
	containerClassName?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
	({ label, helperText, errorText, className, containerClassName, id, name, ...rest }, ref) => {
		const generatedId = useId()
		const fieldId = id ?? name ?? generatedId
		const helperId = helperText ? `${fieldId}-help` : undefined
		const errorId = errorText ? `${fieldId}-error` : undefined
		const describedBy = [helperId, errorId].filter(Boolean).join(' ') || undefined
		const hasError = Boolean(errorText)
		const inputClass = cx('form-control', hasError ? 'is-invalid' : null, className)

		return (
			<div className={cx('mb-3', containerClassName)}>
				{label ? (
					<label className="form-label" htmlFor={fieldId}>
						{label}
					</label>
				) : null}
				<input
					id={fieldId}
					name={name}
					className={inputClass}
					aria-invalid={hasError || undefined}
					aria-describedby={describedBy}
					ref={ref}
					{...rest}
				/>
				{helperText ? (
					<div id={helperId} className="form-text">
						{helperText}
					</div>
				) : null}
				{errorText ? (
					<div id={errorId} className="invalid-feedback d-block">
						{errorText}
					</div>
				) : null}
			</div>
		)
	},
)

Input.displayName = 'Input'

export default Input
