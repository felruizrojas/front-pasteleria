import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'

import Layout from '../components/layout/Layout'
import HomePage from '../pages/Home/Home'
import AboutPage from '../pages/about/About'
import ContactPage from '../pages/contact/Contact'
import MenuPage from '../pages/menu/menu'
import MenuDetailsPage from '../pages/menu/menu_details'
import ProfilePage from '../pages/profile/Profile'
import BlogPage from '../pages/blog/Blog'
import CartPage from '../pages/cart/Cart'
import RegisterUserPage from '../pages/registerUser/registerUser'
import PrivacyPage from '../pages/privacy/Privacy'
import TermsPage from '../pages/terms/Terms'
import ResetPasswordPage from '../pages/resetPassword/ResetPassword'
import LoginRoute from './LoginRoute'

const router = createBrowserRouter([
	{
		element: <Layout />,
		children: [
			{ index: true, element: <HomePage /> },
			{ path: 'about', element: <AboutPage /> },
			{ path: 'contact', element: <ContactPage /> },
			{ path: 'menu', element: <MenuPage /> },
			{ path: 'menu/:productCode', element: <MenuDetailsPage /> },
			{ path: 'blog', element: <BlogPage /> },
			{ path: 'cart', element: <CartPage /> },
			{ path: 'profile', element: <ProfilePage /> },
			{ path: 'privacy', element: <PrivacyPage /> },
			{ path: 'terms', element: <TermsPage /> },
			{ path: 'reset-password', element: <ResetPasswordPage /> },
		],
	},
	{ path: '/login', element: <LoginRoute /> },
	{ path: '/register', element: <RegisterUserPage /> },
	{ path: '*', element: <Navigate to="/" replace /> },
])

const AppRouter = () => <RouterProvider router={router} />

export default AppRouter

