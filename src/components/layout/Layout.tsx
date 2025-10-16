import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

import Navbar from './Navbar'
import LoginOffcanvas from './LoginOffcanvas'
import Footer from './Footer'
import ScrollToTop from './ScrollToTop'
import { showOffcanvas } from '../../utils/offcanvas'

const Layout = () => {
	const location = useLocation()
	const navigate = useNavigate()

	useEffect(() => {
		const rawState = location.state
		if (!rawState || typeof rawState !== 'object') {
			return
		}

		const state = rawState as Record<string, unknown>
		if (!state.openLogin) {
			return
		}

		if (typeof window !== 'undefined') {
			window.scrollTo({ top: 0, left: 0 })
		}

		showOffcanvas('offcanvasLogin')
		const { openLogin: _openLogin, ...rest } = state
		navigate(`${location.pathname}${location.search}`, {
			replace: true,
			state: Object.keys(rest).length > 0 ? rest : undefined,
		})
	}, [location, navigate])

	return (
		<>
			<ScrollToTop />
			<Navbar />
			<LoginOffcanvas />
			<div className="app-shell">
				<main className="flex-grow-1">
					<Outlet />
				</main>
			</div>
			<Footer />
		</>
	)
}

export default Layout
