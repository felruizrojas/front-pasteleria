import { useCallback, useState } from 'react'
import type { ChangeEvent, FocusEvent, FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { Button, Input } from '@/components/common'
import { logoImage } from '@/assets'
import useAuth from '@/hooks/useAuth'
import { validateLoginForm } from '@/utils/validations/authValidations'
import type { LoginFormValues } from '@/utils/validations/authValidations'
import type { ValidationErrors } from '@/utils/validations/types'

const Login = () => {
	const { login, loading } = useAuth()
	const navigate = useNavigate()
	const location = useLocation()
	const [values, setValues] = useState<LoginFormValues>({ email: '', password: '' })
	const [errors, setErrors] = useState<ValidationErrors<LoginFormValues>>({})
	const [touched, setTouched] = useState<Partial<Record<keyof LoginFormValues, boolean>>>({})
	const [formError, setFormError] = useState<string | null>(null)

	const runValidation = useCallback(
		(nextValues: LoginFormValues, nextTouched: Partial<Record<keyof LoginFormValues, boolean>>) => {
			const validation = validateLoginForm(nextValues, { requireExistingEmail: true })
			const filtered: ValidationErrors<LoginFormValues> = {}
			;(Object.keys(nextTouched) as Array<keyof LoginFormValues>).forEach((key) => {
				if (!nextTouched[key]) {
					return
				}
				const message = validation.errors[key]
				if (message) {
					filtered[key] = message
				}
			})
			setErrors(filtered)
			return validation
		},
		[setErrors],
	)

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.currentTarget
		const field = name as keyof LoginFormValues
		const nextValues = { ...values, [field]: value }
		const nextTouched: Partial<Record<keyof LoginFormValues, boolean>> = {
			...touched,
			[field]: true,
		}
		runValidation(nextValues, nextTouched)
		setValues(nextValues)
		setTouched(nextTouched)
		setFormError(null)
	}

	const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
		const { name } = event.currentTarget
		if (!name) {
			return
		}
		const field = name as keyof LoginFormValues
		const nextTouched = { ...touched, [field]: true }
		runValidation(values, nextTouched)
		setTouched(nextTouched)
	}

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const allTouched: Partial<Record<keyof LoginFormValues, boolean>> = { email: true, password: true }
		const validation = runValidation(values, allTouched)
		setTouched(allTouched)
		if (!validation.isValid) {
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
											onBlur={handleBlur}
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
											onBlur={handleBlur}
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
