import { NavLink, useLocation } from 'react-router-dom'

import { Button } from '../common'
import { logoImage } from '../../assets/index.ts'
import cx from '../../utils/cx'

type PrimaryLink = {
	label: string
	to: string
	icon?: string
	ariaLabel?: string
}

type SecondaryLink = {
	label: string
	to: string
	icon: string
	ariaLabel?: string
	external?: boolean
}

const primaryLinks: PrimaryLink[] = [
	{ label: 'Inicio', to: '/', icon: 'bi-house-door', ariaLabel: 'Inicio' },
	{ label: 'Nosotros', to: '/about' },
	{ label: 'Carta', to: '/menu' },
	{ label: 'Blog', to: '/blog' },
	{ label: 'Contacto', to: '/contact' },
]

const secondaryLinks: SecondaryLink[] = [
	{
		label: 'Instagram',
		to: 'https://www.instagram.com/pasteleria1000sabores',
		icon: 'bi-instagram',
		ariaLabel: 'Instagram',
		external: true,
	},
	{ label: 'Carrito', to: '/cart', icon: 'bi-cart3', ariaLabel: 'Carrito' },
]

const renderPrimaryLink = (link: PrimaryLink) => (
	<NavLink
		key={link.label}
		to={link.to}
		className={({ isActive }) => cx('nav-link', { active: isActive && !link.icon })}
		aria-label={link.ariaLabel}
		end={link.to === '/'}
	>
		{link.icon ? <i className={cx('bi', link.icon, 'fs-5')} aria-hidden /> : link.label}
		{link.icon ? <span className="visually-hidden">{link.label}</span> : null}
	</NavLink>
)

const renderMobileButton = (link: PrimaryLink | SecondaryLink, index: number, currentPath: string) => {
	const target = link.to
	const key = `${link.label}-${index}`
	const isExternal = 'external' in link && Boolean(link.external)

	if (isExternal) {
		return (
			<Button key={key} as="a" href={target} target="_blank" rel="noreferrer" block>
				{link.label}
			</Button>
		)
	}

	const isActive = target === '/' ? currentPath === target : currentPath.startsWith(target)

	return (
		<Button key={key} as="link" to={target} block className={isActive ? 'active' : undefined}>
			{link.label}
		</Button>
	)
}

const Navbar = () => {
	const { pathname } = useLocation()

	return (
		<nav className="navbar navbar-expand-lg navbar-light bg-white sticky-top primary-nav shadow-sm">
			<div className="container-fluid">
				<NavLink className="navbar-brand d-flex align-items-center" to="/">
					<img
						src={logoImage}
						alt="Pasteleria Mil Sabores"
						width={80}
						className="rounded-pill me-2 logo"
					/>
					<span className="ms-2 fw-semibold d-none d-lg-inline brand-script">Pasteleria Mil Sabores</span>
				</NavLink>

				<button
					className="navbar-toggler"
					type="button"
					data-bs-toggle="collapse"
					data-bs-target="#mainNav"
					aria-controls="mainNav"
					aria-expanded="false"
					aria-label="Alternar navegacion"
				>
					<span className="navbar-toggler-icon" />
				</button>

				<div className="collapse navbar-collapse" id="mainNav">
					<ul className="navbar-nav mx-auto d-none d-lg-flex">
						{primaryLinks.map((link) => (
							<li className="nav-item" key={link.label}>
								{renderPrimaryLink(link)}
							</li>
						))}
					</ul>

					<ul className="navbar-nav ms-auto align-items-lg-center gap-2 d-none d-lg-flex">
						{secondaryLinks.map((link) => (
							<li className="nav-item" key={link.label}>
								{link.external ? (
									<a
										className="nav-link"
										href={link.to}
										target="_blank"
										rel="noreferrer"
										aria-label={link.ariaLabel}
									>
										<i className={cx('bi', link.icon, 'fs-5')} aria-hidden />
										<span className="visually-hidden">{link.label}</span>
									</a>
								) : (
									<NavLink
										to={link.to}
										className={({ isActive }) => cx('nav-link', { active: isActive })}
										aria-label={link.ariaLabel}
									>
										<i className={cx('bi', link.icon, 'fs-5')} aria-hidden />
										<span className="visually-hidden">{link.label}</span>
									</NavLink>
								)}
							</li>
						))}
						<li className="nav-item ms-2">
							<Button type="button" size="sm" data-bs-toggle="offcanvas" data-bs-target="#offcanvasLogin">
								Iniciar sesion
							</Button>
						</li>
					</ul>

					<div className="d-lg-none w-100">
						<div className="d-grid gap-2 mt-3">
							{primaryLinks.map((link, index) => renderMobileButton(link, index, pathname))}
							{secondaryLinks.map((link, index) =>
								renderMobileButton(link, index + primaryLinks.length, pathname),
							)}
							<Button type="button" block data-bs-toggle="offcanvas" data-bs-target="#offcanvasLogin">
								Iniciar sesion
							</Button>
						</div>
					</div>
				</div>
			</div>
		</nav>
	)
}

export default Navbar

