import { Link, useLocation } from 'react-router-dom'

import { logoImage } from '@/assets'

interface FooterLink {
	label: string
	to: string
	external?: boolean
}

interface FooterSocial {
	icon: string
	label: string
	href: string
}

interface FooterSection {
	title: string
	links?: FooterLink[]
	description?: string[]
	socials?: FooterSocial[]
}

const footerSections: FooterSection[] = [
	{
		title: 'Secciones',
		links: [
			{ label: 'Inicio', to: '/' },
			{ label: 'Nosotros', to: '/about' },
			{ label: 'Blog', to: '/blog' },
		],
	},
	{
		title: 'Compra',
		links: [
			{ label: 'Carta', to: '/menu' },
			{ label: 'Carrito', to: '/cart' },
		],
	},
	{
		title: 'Horario',
		description: ['Lunes a sabado', '10:00–19:00 hrs'],
	},
	{
		title: 'Contacto',
		links: [
			{
				label: 'Av. Paicavi 3280, Concepcion, Chile',
				to: 'https://maps.app.goo.gl/LA3bMz4KLmiopUho9',
				external: true,
			},
			{
				label: 'pasteleria.1000sabores@gmail.com',
				to: 'mailto:pasteleria.1000sabores@gmail.com',
				external: true,
			},
			{ label: '+56 9 1234 5678', to: 'tel:+56912345678', external: true },
		],
		socials: [
			{
				icon: 'bi-instagram',
				label: 'Instagram',
				href: 'https://www.instagram.com/pasteleria1000sabores',
			},
		],
	},
]

const Footer = () => {
	const location = useLocation()

	return (
		<footer className="site-footer bg-white border-top mt-5 text-body-secondary">
			<div className="container-fluid py-5 px-4 px-lg-5">
				<div className="row g-4">
					<div className="col-12 col-sm-6 col-md-4 col-lg-3">
						<Link
							to="/"
							className="d-flex align-items-center w-100 mb-3 text-decoration-none"
							onClick={(event) => {
								if (typeof window === 'undefined') {
									return
								}

								if (location.pathname === '/') {
									event.preventDefault()
									window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
								}
							}}
						>
							<img
								src={logoImage}
								alt="Pasteleria Mil Sabores"
								width={60}
								className="rounded-pill me-2 flex-shrink-0"
							/>
							<span className="fs-5 fw-semibold text-truncate text-primary">Pasteleria Mil Sabores</span>
						</Link>
						<p className="text-muted mb-0">Celebra la dulzura de la vida con Pasteleria 1000 Sabores.</p>
					</div>

					{footerSections.map((section) => (
						<div className="col-12 col-sm-6 col-md-4 col-lg" key={section.title}>
							<h6 className="fw-bold text-uppercase text-secondary small">{section.title}</h6>
							{section.links ? (
								<ul className="nav flex-column">
									{section.links.map((link) => {
										const { label, to, external } = link
										return (
											<li className="nav-item mb-2" key={label}>
												{external ? (
													<a
														href={to}
														className="nav-link p-0 text-secondary"
														target="_blank"
														rel="noreferrer"
													>
														{label}
													</a>
												) : (
													<Link
														to={to}
														className="nav-link p-0 text-secondary"
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
												)}
											</li>
										)
									})}
								</ul>
							) : null}

							{section.description
								? section.description.map((line) => (
									<p className="text-secondary mb-0" key={line}>
										{line}
									</p>
								))
								: null}

							{section.socials ? (
								<div className="d-flex gap-3 mt-3">
									{section.socials.map((social) => (
										<a
											key={social.label}
											href={social.href}
											className="text-secondary fs-4"
											aria-label={social.label}
											target="_blank"
											rel="noreferrer"
										>
											<i className={`bi ${social.icon}`} aria-hidden />
										</a>
									))}
								</div>
							) : null}
						</div>
					))}
				</div>

				<hr className="border-secondary my-4" />

				<div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
					<small className="text-secondary">
						&copy; {new Date().getFullYear()} Pasteleria Mil Sabores. Todos los derechos reservados.
					</small>
					<ul className="nav">
						<li className="nav-item">
							<Link to="/privacy" className="nav-link px-2 text-secondary">
								Privacidad
							</Link>
						</li>
						<li className="nav-item">
							<Link to="/terms" className="nav-link px-2 text-secondary">
								Terminos
							</Link>
						</li>
					</ul>
				</div>
			</div>
		</footer>
	)
}

export default Footer
