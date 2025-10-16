import { Suspense, lazy } from 'react'
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'

import LoginRoute from '@/routes/LoginRoute'

const AppLayout = lazy(() => import('@/app/AppLayout'))
const HomePage = lazy(() => import('@/features/home/HomePage'))
const AboutPage = lazy(() => import('@/features/about/AboutPage'))
const ContactPage = lazy(() => import('@/features/contact/ContactPage'))
const MenuPage = lazy(() => import('@/features/menu/MenuPage'))
const MenuDetailsPage = lazy(() => import('@/features/menu/MenuDetailsPage'))
const ProfilePage = lazy(() => import('@/features/profile/ProfilePage'))
const BlogPage = lazy(() => import('@/features/blog/BlogPage'))
const CartPage = lazy(() => import('@/features/cart/CartPage'))
const RegisterUserPage = lazy(() => import('@/features/auth/RegisterUserPage'))
const PrivacyPage = lazy(() => import('@/features/legal/PrivacyPage'))
const TermsPage = lazy(() => import('@/features/legal/TermsPage'))
const ResetPasswordPage = lazy(() => import('@/features/auth/ResetPasswordPage'))

const router = createBrowserRouter([
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
])

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

