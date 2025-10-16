import type { MouseEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { logoImage } from '@/assets'

interface FooterLink {
	label: string
	to: string
	external?: boolean
}

interface FooterSection {
	title: string
	links: FooterLink[]
}

const navigationSections: FooterSection[] = [
	{
		title: 'Secciones',
		links: [
			{ label: 'Inicio', to: '/' },
			{ label: 'Nosotros', to: '/about' },
			{ label: 'Blog', to: '/blog' },
		],
	},
]

const purchaseLinks: FooterLink[] = [
	{ label: 'Carta', to: '/menu' },
	{ label: 'Carrito', to: '/cart' },
]

const scheduleLines = ['Lunes a sábado', '10:00–19:00 hrs']

const Footer = () => {
	const location = useLocation()

	const handleHomeClick = (event: MouseEvent<HTMLAnchorElement>) => {
		if (typeof window === 'undefined') {
			return
		}

		if (location.pathname === '/') {
			event.preventDefault()
			window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
		}
	}

	const renderLink = ({ label, to, external }: FooterLink) => {
		if (external) {
			return (
				<a href={to} className="nav-link p-0 link-body-emphasis" target="_blank" rel="noreferrer">
					{label}
				</a>
			)
		}

		return (
			<Link
				to={to}
				className="nav-link p-0 link-body-emphasis"
				onClick={(event) => {
					if (typeof window === 'undefined') {
						return
					}

					if (to === '/' && location.pathname === '/') {
						event.preventDefault()
						window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
					}
				}}
			>
				{label}
			</Link>
		)
	}

	return (
		<footer className="site-footer border-top mt-5">
			<div className="container-fluid py-5 px-4 px-lg-5">
				<div className="row g-4">
					<div className="col-12 col-lg-5">
						<Link
							to="/"
							className="d-flex align-items-center w-100 mb-3 text-decoration-none link-body-emphasis"
							onClick={handleHomeClick}
						>
							<img
								src={logoImage}
								alt="Pastelería Mil Sabores"
								width={60}
								className="rounded-pill me-2 flex-shrink-0"
							/>
							<span className="fs-5 fw-semibold text-truncate brand-name">Pastelería Mil Sabores</span>
						</Link>
						<p className="mb-0">Celebra la dulzura de la vida con Pastelería Mil Sabores.</p>
						<div className="d-flex align-items-center gap-3 mt-3">
							<a
								href="https://maps.app.goo.gl/LA3bMz4KLmiopUho9"
								className="fs-4 link-body-emphasis"
								aria-label="Dirección"
								target="_blank"
								rel="noreferrer"
							>
								<i className="bi bi-geo-alt-fill" aria-hidden />
							</a>
							<a
								href="mailto:pasteleria.1000sabores@gmail.com"
								className="fs-4 link-body-emphasis"
								aria-label="Correo"
							>
								<i className="bi bi-envelope-fill" aria-hidden />
							</a>
							<a href="tel:+56912345678" className="fs-4 link-body-emphasis" aria-label="Teléfono">
								<i className="bi bi-telephone-fill" aria-hidden />
							</a>
							<a
								href="https://www.instagram.com/pasteleria1000sabores"
								className="fs-4 link-body-emphasis"
								aria-label="Instagram"
								target="_blank"
								rel="noreferrer"
							>
								<i className="bi bi-instagram" aria-hidden />
							</a>
						</div>
					</div>
					<div className="col-12 col-lg-7">
						<div className="row g-4 g-lg-3 row-cols-1 row-cols-md-3">
							{navigationSections.map((section) => (
								<div className="col" key={section.title}>
									<h6 className="fw-bold text-uppercase small">{section.title}</h6>
									<ul className="nav flex-column">
										{section.links.map((link) => (
											<li className="nav-item mb-2" key={link.label}>
												{renderLink(link)}
											</li>
										))}
									</ul>
								</div>
							))}
							<div className="col">
								<h6 className="fw-bold text-uppercase small">Compra</h6>
								<ul className="nav flex-column">
									{purchaseLinks.map((link) => (
										<li className="nav-item mb-2" key={link.label}>
											{renderLink(link)}
										</li>
									))}
								</ul>
							</div>
							<div className="col">
								<h6 className="fw-bold text-uppercase small">Horario</h6>
								<div className="d-flex flex-column gap-1">
									{scheduleLines.map((line) => (
										<span className="mb-0" key={line}>
											{line}
										</span>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>

				<hr className="my-4" />

				<div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
					<small>
						&copy; {new Date().getFullYear()} Pastelería Mil Sabores. Todos los derechos reservados.
					</small>
					<ul className="nav">
						<li className="nav-item">
							<Link to="/privacy" className="nav-link px-2 link-body-emphasis">
								Privacidad
							</Link>
						</li>
						<li className="nav-item">
							<Link to="/terms" className="nav-link px-2 link-body-emphasis">
								Términos
							</Link>
						</li>
					</ul>
				</div>
			</div>
		</footer>
	)
}

export default Footer
