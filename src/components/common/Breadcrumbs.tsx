import { Link } from 'react-router-dom'

export type BreadcrumbItem = {
	label: string
	to?: string
}

type BreadcrumbsProps = {
	items: BreadcrumbItem[]
	className?: string
}

const Breadcrumbs = ({ items, className }: BreadcrumbsProps) => {
	const lastIndex = items.length - 1

	return (
		<nav aria-label="breadcrumb" className={className}>
			<ol className="breadcrumb small mb-0">
				{items.map((item, index) => {
					const isLast = index === lastIndex

					if (isLast || !item.to) {
						return (
							<li key={item.label} className="breadcrumb-item active" aria-current="page">
								{item.label}
							</li>
						)
					}

					// Apply pink style to all breadcrumb hyperlinks
					return (
						<li key={item.label} className="breadcrumb-item">
							<Link to={item.to} className="breadcrumb-link--pink">{item.label}</Link>
						</li>
					)
				})}
			</ol>
		</nav>
	)
}

export default Breadcrumbs
