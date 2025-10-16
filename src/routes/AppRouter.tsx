import { Suspense, lazy } from 'react'
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'

import LoginRoute from '@/routes/LoginRoute'

const AppLayout = lazy(() => import('@/layouts/AppLayout'))
const HomePage = lazy(() => import('@/pages/home/HomePage'))
const AboutPage = lazy(() => import('@/pages/about/AboutPage'))
const ContactPage = lazy(() => import('@/pages/contact/ContactPage'))
const MenuPage = lazy(() => import('@/pages/menu/MenuPage'))
const MenuDetailsPage = lazy(() => import('@/pages/menu/MenuDetailsPage'))
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage'))
const BlogPage = lazy(() => import('@/pages/blog/BlogPage'))
const CartPage = lazy(() => import('@/pages/cart/CartPage'))
const RegisterUserPage = lazy(() => import('@/pages/auth/RegisterUserPage'))
const PrivacyPage = lazy(() => import('@/pages/legal/PrivacyPage'))
const TermsPage = lazy(() => import('@/pages/legal/TermsPage'))
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'))

const basename = (import.meta.env.BASE_URL ?? '/').replace(/\/*$/, '') || '/'

const router = createBrowserRouter(
[
	{
		element: <AppLayout />,
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
],
{ basename },
)

const AppRouter = () => (
	<Suspense
		fallback={
			<div className="py-5 text-center">
				<span className="spinner-border" role="status" aria-hidden="true" />
			</div>
		}
	>
		<RouterProvider router={router} />
	</Suspense>
)

export default AppRouter

