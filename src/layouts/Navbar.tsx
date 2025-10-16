import { NavLink, useLocation } from 'react-router-dom'

import { Button } from '@/components/common'
import { logoImage } from '@/assets'
import cx from '@/utils/cx'
import MobileNav from './MobileNav'
import type { PrimaryLink, SecondaryLink } from '@/types/navbar'
import useAuth from '@/hooks/useAuth'

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

const renderPrimaryLink = (link: PrimaryLink, currentPath: string) => (
	<NavLink
		key={link.label}
		to={link.to}
		className={({ isActive }) => cx('nav-link', { active: isActive && !link.icon })}
		aria-label={link.ariaLabel}
		end={link.to === '/'}
		onClick={(event) => {
			if (link.to === '/' && currentPath === '/' && typeof window !== 'undefined') {
				event.preventDefault()
				window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
			}
		}}
	>
		{link.icon ? <i className={cx('bi', link.icon, 'fs-5')} aria-hidden /> : link.label}
		{link.icon ? <span className="visually-hidden">{link.label}</span> : null}
	</NavLink>
)

const Navbar = () => {
	const { pathname } = useLocation()
	const { isAuthenticated, user } = useAuth()

	const profileLabel = (() => {
		if (!user) {
			return 'Mi perfil'
		}

		const segments = [user.firstName, user.lastName].filter(Boolean)
		const label = segments.length > 0 ? segments.join(' ') : user.name
		return label.trim() || 'Mi perfil'
	})()

	const closeMobileMenu = () => {
		if (typeof window === 'undefined') {
			return
		}

		const nav = document.getElementById('mainNav')
		if (!nav) {
			return
		}

		const bootstrapApi = (window as typeof window & {
			bootstrap?: {
				Collapse?: {
					getInstance: (element: Element) => { hide: () => void } | null
				}
			}
		}).bootstrap

		const collapseInstance = bootstrapApi?.Collapse?.getInstance(nav)
		collapseInstance?.hide()

		if (!collapseInstance) {
			nav.classList.remove('show')
		}

		const toggler = document.querySelector<HTMLButtonElement>('[data-bs-target="#mainNav"]')
		if (toggler) {
			toggler.classList.add('collapsed')
			toggler.setAttribute('aria-expanded', 'false')
		}
	}

	return (
		<nav className="navbar navbar-expand-lg navbar-light bg-white sticky-top primary-nav shadow-sm">
			<div className="container-fluid">
				<NavLink
					className="navbar-brand d-flex align-items-center"
					to="/"
					state={{ from: pathname }}
					onClick={(event) => {
						if (typeof window === 'undefined') {
							return
						}

						if (pathname === '/') {
							event.preventDefault()
							window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
						}
					}}
				>
					<img
						src={logoImage}
						alt="Pastelería Mil Sabores"
						width={80}
						className="rounded-pill me-2 logo"
					/>
					<span className="ms-2 fw-semibold d-none d-lg-inline brand-name">Pastelería Mil Sabores</span>
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
								{renderPrimaryLink(link, pathname)}
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
							{isAuthenticated ? (
								<Button
									as="link"
									to="/profile"
									size="sm"
									variant="mint"
									className="d-flex align-items-center gap-2 px-3 text-truncate"
									title="Ver mi perfil"
									aria-label="Ver mi perfil"
								>
									<i className="bi bi-person-circle" aria-hidden />
									<span className="text-truncate">{profileLabel}</span>
								</Button>
							) : (
								<Button
									type="button"
									size="sm"
									data-bs-toggle="offcanvas"
									data-bs-target="#offcanvasLogin"
									variant="strawberry"
								>
									Iniciar sesión
								</Button>
							)}
						</li>
					</ul>

					<MobileNav
						primaryLinks={primaryLinks}
						secondaryLinks={secondaryLinks}
						currentPath={pathname}
						onNavigate={closeMobileMenu}
						authAction={
							isAuthenticated
								? { type: 'profile', label: profileLabel, to: '/profile' as const }
								: { type: 'login', label: 'Iniciar sesión' }
						}
					/>
				</div>
			</div>
		</nav>
	)
}

export default Navbar
