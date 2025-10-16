import { Button } from '@/components/common'

import type { PrimaryLink, SecondaryLink } from '@/types/navbar'

type MobileLink = PrimaryLink | SecondaryLink

type MobileNavProps = {
	primaryLinks: PrimaryLink[]
	secondaryLinks: SecondaryLink[]
	currentPath: string
	onNavigate: () => void
	authAction:
		| { type: 'login'; label: string }
		| {
				type: 'profile'
				label: string
				to: string
		  }
}

const renderMobileButton = (
	link: MobileLink,
	index: number,
	currentPath: string,
	onNavigate: () => void,
) => {
	const target = link.to
	const key = `${link.label}-${index}`
	const isExternal = 'external' in link && Boolean(link.external)

	if (isExternal) {
		return (
			<Button
				key={key}
				as="a"
				href={target}
				target="_blank"
				rel="noreferrer"
				block
				variant="strawberry"
				onClick={() => onNavigate()}
			>
				{link.label}
			</Button>
		)
	}

	const isActive = target === '/' ? currentPath === target : currentPath.startsWith(target)

	return (
		<Button
			key={key}
			as="link"
			to={target}
			block
			className={isActive ? 'active' : undefined}
			variant="strawberry"
			onClick={(event) => {
				if (target === '/' && currentPath === '/' && typeof window !== 'undefined') {
					event.preventDefault()
					window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
				}
				onNavigate()
			}}
		>
			{link.label}
		</Button>
	)
}

const MobileNav = ({ primaryLinks, secondaryLinks, currentPath, onNavigate, authAction }: MobileNavProps) => (
	<div className="d-lg-none w-100">
		<div className="d-grid gap-2 mt-3">
			{primaryLinks.map((link, index) => renderMobileButton(link, index, currentPath, onNavigate))}
			{secondaryLinks.map((link, index) =>
				renderMobileButton(link, index + primaryLinks.length, currentPath, onNavigate),
			)}
			{authAction.type === 'login' ? (
				<Button
					type="button"
					block
					data-bs-toggle="offcanvas"
					data-bs-target="#offcanvasLogin"
					variant="strawberry"
					onClick={onNavigate}
				>
					{authAction.label}
				</Button>
			) : (
				<Button
					as="link"
					to={authAction.to}
					block
					variant="strawberry"
					onClick={onNavigate}
					className="d-flex align-items-center justify-content-center gap-2"
					title="Ver mi perfil"
					aria-label="Ver mi perfil"
				>
					<i className="bi bi-person-circle" aria-hidden />
					<span>{authAction.label}</span>
				</Button>
			)}
		</div>
	</div>
)

export default MobileNav
