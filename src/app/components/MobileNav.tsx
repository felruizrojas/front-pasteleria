import { Button } from '@/shared/components/common'

import type { PrimaryLink, SecondaryLink } from './navbar.types'

type MobileLink = PrimaryLink | SecondaryLink

type MobileNavProps = {
	primaryLinks: PrimaryLink[]
	secondaryLinks: SecondaryLink[]
	currentPath: string
	onNavigate: () => void
	loginLabel: string
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

const MobileNav = ({ primaryLinks, secondaryLinks, currentPath, onNavigate, loginLabel }: MobileNavProps) => (
	<div className="d-lg-none w-100">
		<div className="d-grid gap-2 mt-3">
			{primaryLinks.map((link, index) => renderMobileButton(link, index, currentPath, onNavigate))}
			{secondaryLinks.map((link, index) =>
				renderMobileButton(link, index + primaryLinks.length, currentPath, onNavigate),
			)}
			<Button
				type="button"
				block
				data-bs-toggle="offcanvas"
				data-bs-target="#offcanvasLogin"
				variant="strawberry"
				onClick={onNavigate}
			>
				{loginLabel}
			</Button>
		</div>
	</div>
)

export default MobileNav
