import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'

import Layout from '../components/layout/Layout'
import HomePage from '../pages/Home/Home'
import AboutPage from '../pages/about/About'
import ContactPage from '../pages/contact/Contact'
import LoginPage from '../pages/login/Login'
import MenuPage from '../pages/menu/menu'
import ProfilePage from '../pages/profile/Profile'
import BlogPage from '../pages/blog/Blog'
import CartPage from '../pages/cart/Cart'

const router = createBrowserRouter([
	{
		element: <Layout />,
		children: [
			{ index: true, element: <HomePage /> },
			{ path: 'about', element: <AboutPage /> },
			{ path: 'contact', element: <ContactPage /> },
			{ path: 'menu', element: <MenuPage /> },
			{ path: 'blog', element: <BlogPage /> },
			{ path: 'cart', element: <CartPage /> },
			{ path: 'profile', element: <ProfilePage /> },
		],
	},
	{ path: '/login', element: <LoginPage /> },
	{ path: '*', element: <Navigate to="/" replace /> },
])

const AppRouter = () => <RouterProvider router={router} />

export default AppRouter

