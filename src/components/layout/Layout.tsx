import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import LoginOffcanvas from './LoginOffcanvas'
import Footer from './Footer'

const Layout = () => (
	<>
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

export default Layout
