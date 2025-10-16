import { Suspense, lazy } from 'react'
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'

import LoginRoute from '@/routes/LoginRoute'

const Layout = lazy(() => import('@/components/layout/Layout'))
const HomePage = lazy(() => import('@/pages/Home/Home'))
const AboutPage = lazy(() => import('@/pages/about/About'))
const ContactPage = lazy(() => import('@/pages/contact/Contact'))
const MenuPage = lazy(() => import('@/pages/menu/menu'))
const MenuDetailsPage = lazy(() => import('@/pages/menu/menu_details'))
const ProfilePage = lazy(() => import('@/pages/profile/Profile'))
const BlogPage = lazy(() => import('@/pages/blog/Blog'))
const CartPage = lazy(() => import('@/pages/cart/Cart'))
const RegisterUserPage = lazy(() => import('@/pages/registerUser/registerUser'))
const PrivacyPage = lazy(() => import('@/pages/privacy/Privacy'))
const TermsPage = lazy(() => import('@/pages/terms/Terms'))
const ResetPasswordPage = lazy(() => import('@/pages/resetPassword/ResetPassword'))

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

