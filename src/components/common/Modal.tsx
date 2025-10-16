import type { ReactNode } from 'react'

import cx from '@/utils/cx'

type ModalSize = 'sm' | 'lg' | 'xl'

interface ModalProps {
	id: string
	children: ReactNode
	title?: ReactNode
	footer?: ReactNode
	size?: ModalSize
	centered?: boolean
	scrollable?: boolean
	staticBackdrop?: boolean
	className?: string
	showCloseButton?: boolean
}

const Modal = ({
	id,
	children,
	title,
	footer,
	size,
	centered,
	scrollable,
	staticBackdrop,
	className,
	showCloseButton = true,
}: ModalProps) => {
	const labelledBy = title ? `${id}-label` : undefined
	const dialogClass = cx(
		'modal-dialog',
		size ? `modal-${size}` : null,
		centered ? 'modal-dialog-centered' : null,
		scrollable ? 'modal-dialog-scrollable' : null,
	)
	const contentClass = cx('modal-content', className)

	return (
		<div
			className="modal fade"
			id={id}
			tabIndex={-1}
			aria-labelledby={labelledBy}
			aria-hidden="true"
			data-bs-backdrop={staticBackdrop ? 'static' : undefined}
			data-bs-keyboard={staticBackdrop ? 'false' : undefined}
		>
			<div className={dialogClass}>
				<div className={contentClass}>
					{title || showCloseButton ? (
						<div className="modal-header">
							{title ? (
								<h5 className="modal-title" id={labelledBy}>
									{title}
								</h5>
							) : null}
							{showCloseButton ? (
								<button
									type="button"
									className="btn-close"
									data-bs-dismiss="modal"
									aria-label="Close"
								/>
							) : null}
						</div>
					) : null}
					<div className="modal-body">{children}</div>
					{footer ? <div className="modal-footer">{footer}</div> : null}
				</div>
			</div>
		</div>
	)
}

export default Modal
