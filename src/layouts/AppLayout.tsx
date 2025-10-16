import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import Footer from '@/layouts/Footer'
import LoginOffcanvas from '@/layouts/LoginOffcanvas'
import Navbar from '@/layouts/Navbar'
import ScrollToTop from '@/components/ScrollToTop'
import { showOffcanvas } from '@/utils/offcanvas'

const AppLayout = () => {
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
		const restState = { ...state }
		delete restState.openLogin
		navigate(`${location.pathname}${location.search}`, {
			replace: true,
			state: Object.keys(restState).length > 0 ? restState : undefined,
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

export default AppLayout
