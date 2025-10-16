import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { Button, Input } from '@/shared/components/common'
import { logoImage } from '@/assets'
import useAuth from '@/shared/hooks/useAuth'
import { validateLoginForm } from '@/shared/utils/validations/authValidations'
import type { LoginFormValues } from '@/shared/utils/validations/authValidations'
import type { ValidationErrors } from '@/shared/utils/validations/types'

const Login = () => {
	const { login, loading } = useAuth()
	const navigate = useNavigate()
	const location = useLocation()
	const [values, setValues] = useState<LoginFormValues>({ email: '', password: '' })
	const [errors, setErrors] = useState<ValidationErrors<LoginFormValues>>({})
	const [formError, setFormError] = useState<string | null>(null)

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.currentTarget
		setValues((previous) => ({ ...previous, [name]: value }))
		setErrors((previous) => ({ ...previous, [name]: undefined }))
		setFormError(null)
	}

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const validation = validateLoginForm(values)
		if (!validation.isValid) {
			setErrors(validation.errors)
			return
		}

		try {
			await login(values)
			const from = (location.state as { from?: string } | null)?.from ?? '/'
			const target = from === '/login' ? '/' : from
			navigate(target, { replace: true })
		} catch (error) {
			if (error instanceof Error) {
				setFormError(error.message)
			} else {
				setFormError('No fue posible iniciar sesión. Inténtalo nuevamente.')
			}
		}
	}

	return (
		<main className="mt-0">
			<section className="login-page bg-light py-5 py-lg-0">
				<div className="container-fluid">
					<div className="row g-0 min-vh-75">
						<div className="col-12 col-lg-7 d-none d-lg-flex align-items-center justify-content-center">
							<div className="text-center px-4">
								<img src={logoImage} alt="Pastelería Mil Sabores" width={140} className="rounded-pill mb-3" />
								<h1 className="mb-1 brand-name">Pastelería Mil Sabores</h1>
								<p className="mb-0">Celebra la dulzura de la vida</p>
							</div>
						</div>

						<div className="col-12 col-lg-5">
							<div className="login-panel h-100 border-top border-lg-start border-light-subtle">
								<div className="p-4 p-lg-5">
									<div className="d-flex align-items-center justify-content-between mb-4">
										<h5 className="mb-0">
											<i className="bi bi-person me-2" aria-hidden /> Iniciar sesión
										</h5>
										<Button as="link" to="/" size="sm" variant="mint">
											<i className="bi bi-x-lg" aria-hidden />
											<span className="visually-hidden">Cerrar</span>
										</Button>
									</div>

									<form className="auth-form mx-auto" noValidate onSubmit={handleSubmit}>
										{formError ? (
											<div className="alert alert-danger" role="alert">
												{formError}
											</div>
										) : null}

										<Input
											label="Correo electrónico"
											type="email"
											id="pageLoginEmail"
											name="email"
											placeholder="tucorreo@dominio.com"
											value={values.email}
											onChange={handleChange}
											errorText={errors.email}
										/>

										<Input
											label="Contraseña"
											type="password"
											id="pageLoginPassword"
											name="password"
											placeholder="••••"
											value={values.password}
											onChange={handleChange}
											autoComplete="current-password"
											errorText={errors.password}
										/>

										<div className="d-flex justify-content-between align-items-center mb-3">
											<div className="form-check">
												<input className="form-check-input" type="checkbox" id="pageRememberMe" />
												<label className="form-check-label" htmlFor="pageRememberMe">
													Recordarme
												</label>
											</div>
											<Link to="/reset-password" className="link-body-emphasis">
												¿Olvidaste tu contraseña?
											</Link>
										</div>

										<Button type="submit" block className="mb-2" variant="strawberry" disabled={loading}>
											{loading ? 'Ingresando...' : 'Ingresar'}
										</Button>

										<hr className="my-4" />

										<p className="mb-0 text-center">
											¿No tienes cuenta?
											<Link to="/register" className="ms-1 link-body-emphasis">
												Crear cuenta
											</Link>
										</p>
									</form>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		</main>
	)
}

export default Login
