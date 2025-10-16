import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { Button, Input } from '@/shared/components/common'
import { logoImage } from '@/assets'
import { LOCAL_STORAGE_KEYS } from '@/shared/utils/storage/initLocalData'
import { getLocalData } from '@/shared/utils/storage/localStorageUtils'
import {
	MIN_AGE,
	mapFormToStoredUser,
	saveUserRecord,
	validateUserForm,
} from '@/shared/utils/validations/userValidations'
import type { UserFormValues } from '@/shared/utils/validations/userValidations'
import type { ValidationErrors } from '@/shared/utils/validations/types'
import { setLocalItem } from '@/shared/utils/storage/localStorageUtils'
import useAuth from '@/shared/hooks/useAuth'

const RegisterUser = () => {
	const location = useLocation()
	const currentPath = location.pathname
	const navigate = useNavigate()
	const { login } = useAuth()
	const [regions, setRegions] = useState<Array<{ id: string; nombre: string; comunas: string[] }>>([])
	const [values, setValues] = useState<UserFormValues>({
		run: '',
		nombre: '',
		apellidos: '',
		correo: '',
		fechaNacimiento: '',
		regionId: '',
		comuna: '',
		direccion: '',
		password: '',
		confirmPassword: '',
	})
	const [errors, setErrors] = useState<ValidationErrors<UserFormValues>>({})
	const [formMessage, setFormMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null)
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)

	useEffect(() => {
		document.querySelectorAll('.offcanvas.show').forEach((element) => {
			if (!(element instanceof HTMLElement)) {
				return
			}

			element.classList.remove('show')
			element.style.removeProperty('visibility')
			element.setAttribute('aria-hidden', 'true')
		})

		document.querySelectorAll('.offcanvas-backdrop').forEach((backdrop) => backdrop.remove())

		document.body.style.removeProperty('overflow')
		document.body.removeAttribute('data-bs-overflow')
		document.body.removeAttribute('data-bs-padding-right')
	}, [])

	useEffect(() => {
		const regionData = getLocalData<typeof regions[number]>(LOCAL_STORAGE_KEYS.regiones)
		setRegions(regionData)
	}, [])

	const comunaOptions = useMemo(
		() => regions.find((region) => region.id === values.regionId)?.comunas ?? [],
		[regions, values.regionId],
	)

	const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.currentTarget
		setValues((previous) => ({ ...previous, [name]: value }))
		setErrors((previous) => ({ ...previous, [name]: undefined }))
		setFormMessage(null)
	}

	const handleRegionChange = (event: ChangeEvent<HTMLSelectElement>) => {
		const nextRegion = event.currentTarget.value
		setValues((previous) => ({ ...previous, regionId: nextRegion, comuna: '' }))
		setErrors((previous) => ({ ...previous, regionId: undefined, comuna: undefined }))
		setFormMessage(null)
	}

	const handleComunaChange = (event: ChangeEvent<HTMLSelectElement>) => {
		const nextComuna = event.currentTarget.value
		setValues((previous) => ({ ...previous, comuna: nextComuna }))
		setErrors((previous) => ({ ...previous, comuna: undefined }))
		setFormMessage(null)
	}

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const validation = validateUserForm(values, { mode: 'create' })
		if (!validation.isValid) {
			setErrors(validation.errors)
			setFormMessage({ type: 'danger', text: 'Por favor corrige los campos marcados.' })
			return
		}

		const record = mapFormToStoredUser(values)
		saveUserRecord(record)
		setLocalItem(LOCAL_STORAGE_KEYS.activeUser, record)
		setFormMessage({
			type: 'success',
			text: 'Cuenta creada con éxito. Iniciando sesión...',
		})

		await login({ email: values.correo, password: values.password })
		navigate('/', { replace: true })
	}

	return (
		<main className="mt-0">
			<section className="position-relative overflow-hidden">
				<div className="container py-5">
					<div className="row justify-content-center">
						<div className="col-12 col-lg-10">
							<div className="d-flex flex-column flex-lg-row align-items-center gap-4 text-center text-lg-start">
								<img src={logoImage} alt="Pastelería Mil Sabores" width={140} className="rounded-pill shadow" />
								<div>
									<span className="badge text-uppercase fw-semibold mb-2">Tu pastelería favorita</span>
									<h1 className="mb-2 brand-name">Pastelería Mil Sabores</h1>
									<h2 className="h4 mb-2">Crea tu cuenta</h2>
									<p className="lead mb-0">
										Accede a beneficios dulces, seguimiento de pedidos y novedades exclusivas.
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className="py-5">
				<div className="container">
					<div className="row justify-content-center">
						<div className="col-12 col-lg-8 col-xl-6">
							<div className="bg-body border rounded-3 shadow-sm p-4 p-lg-5">
								<header className="d-flex align-items-start justify-content-between mb-4">
									<div>
										<span className="badge text-uppercase fw-semibold mb-2">Nuevo registro</span>
										<h2 className="h4 mb-0">
											<i className="bi bi-person-plus me-2" aria-hidden="true" />Crear cuenta
										</h2>
									</div>
									<Button as="link" to="/" size="sm" variant="mint" aria-label="Volver al inicio">
										<i className="bi bi-x-lg" aria-hidden="true" />
									</Button>
								</header>
								<p className="mb-4">
									Completa tus datos para disfrutar de promociones personalizadas y un proceso de compra más ágil.
								</p>

								<form onSubmit={handleSubmit} noValidate>
									{formMessage ? (
										<div className={`alert alert-${formMessage.type}`} role="alert">
											{formMessage.text}
											{formMessage.type === 'success' ? (
												<span className="d-block small mt-2">
													Se asignará un rol automáticamente según el dominio de tu correo.
												</span>
											) : null}
										</div>
									) : null}

									<Input
										name="run"
										label="RUN"
										placeholder="19011022K"
										value={values.run}
										onChange={handleInputChange}
										helperText="Ingresa tu RUN sin puntos ni guion."
										errorText={errors.run}
									/>
									<Input
										name="nombre"
										label="Nombre"
										placeholder="María Luisa"
										value={values.nombre}
										onChange={handleInputChange}
										errorText={errors.nombre}
									/>
									<Input
										name="apellidos"
										label="Apellidos"
										placeholder="Pérez González"
										value={values.apellidos}
										onChange={handleInputChange}
										errorText={errors.apellidos}
									/>
									<Input
										name="correo"
										label="Correo electrónico"
										placeholder="usuario@dominio.com"
										type="email"
										value={values.correo}
										onChange={handleInputChange}
										helperText="Dominios permitidos: @duoc.cl, @profesor.duoc.cl, @gmail.com"
										errorText={errors.correo}
									/>
									<div className="row g-3">
										<div className="col-12 col-lg-6">
											<label className="form-label fw-semibold" htmlFor="birthdate">
												Fecha de nacimiento (opcional)
											</label>
											<input
												type="date"
												id="birthdate"
												name="fechaNacimiento"
												className={`form-control${errors.fechaNacimiento ? ' is-invalid' : ''}`}
												max={new Date().toISOString().split('T')[0]}
												value={values.fechaNacimiento ?? ''}
												onChange={handleInputChange}
											/>
											{errors.fechaNacimiento ? (
												<div className="invalid-feedback d-block">{errors.fechaNacimiento}</div>
											) : (
												<div className="form-text">Debes tener al menos {MIN_AGE} años.</div>
											)}
										</div>
										<div className="col-12 col-lg-6">
											<Input
												name="direccion"
												label="Dirección"
												placeholder="Calle 123"
												value={values.direccion}
												onChange={handleInputChange}
												errorText={errors.direccion}
											/>
										</div>
									</div>

									<div className="row g-3">
										<div className="col-12 col-lg-6">
											<label className="form-label fw-semibold" htmlFor="region">
												Región
											</label>
											<select
												id="region"
												className={`form-select${errors.regionId ? ' is-invalid' : ''}`}
												value={values.regionId}
												onChange={handleRegionChange}
											>
												<option value="">Selecciona una región</option>
												{regions.map((region) => (
													<option key={region.id} value={region.id}>
														{region.nombre}
													</option>
												))}
											</select>
											{errors.regionId ? (
												<div className="invalid-feedback d-block">{errors.regionId}</div>
											) : null}
										</div>
										<div className="col-12 col-lg-6">
											<label className="form-label fw-semibold" htmlFor="comuna">
												Comuna
											</label>
											<select
												id="comuna"
												className={`form-select${errors.comuna ? ' is-invalid' : ''}`}
												disabled={!values.regionId}
												value={values.comuna}
												onChange={handleComunaChange}
											>
												<option value="">Selecciona una comuna</option>
												{comunaOptions.map((option) => (
													<option key={option} value={option}>
														{option}
													</option>
												))}
											</select>
											{errors.comuna ? (
												<div className="invalid-feedback d-block">{errors.comuna}</div>
											) : null}
										</div>
									</div>

									<div className="mb-3">
										<label className="form-label fw-semibold" htmlFor="password">
											Contraseña
										</label>
										<div className="input-group">
											<input
												type={showPassword ? 'text' : 'password'}
												className={`form-control${errors.password ? ' is-invalid' : ''}`}
												id="password"
												name="password"
												value={values.password}
												onChange={handleInputChange}
												aria-describedby="passwordHelp"
											/>
											<button
												type="button"
												className="btn btn-pastel btn-mint"
												onClick={() => setShowPassword((value) => !value)}
												aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
											>
												<i className={showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'} aria-hidden="true" />
											</button>
										</div>
										<div id="passwordHelp" className="form-text">
											Debe tener entre 4 y 10 caracteres.
										</div>
										{errors.password ? (
											<div className="invalid-feedback d-block">{errors.password}</div>
										) : null}
									</div>

									<div className="mb-3">
										<label className="form-label fw-semibold" htmlFor="confirmPassword">
											Confirmar contraseña
										</label>
										<div className="input-group">
											<input
												type={showConfirmPassword ? 'text' : 'password'}
												className={`form-control${errors.confirmPassword ? ' is-invalid' : ''}`}
												id="confirmPassword"
												name="confirmPassword"
												value={values.confirmPassword}
												onChange={handleInputChange}
											/>
											<button
												type="button"
												className="btn btn-pastel btn-mint"
												onClick={() => setShowConfirmPassword((value) => !value)}
												aria-label={showConfirmPassword ? 'Ocultar confirmación' : 'Mostrar confirmación'}
											>
												<i className={showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'} aria-hidden="true" />
											</button>
										</div>
										{errors.confirmPassword ? (
											<div className="invalid-feedback d-block">{errors.confirmPassword}</div>
										) : null}
									</div>

									<div className="form-check mb-4">
										<input type="checkbox" className="form-check-input" id="terms" name="terms" required />
										<label className="form-check-label" htmlFor="terms">
											Acepto los <a className="link-body-emphasis" href="/terminos">términos y condiciones</a>
										</label>
									</div>

									<div className="d-grid">
										<Button type="submit" variant="strawberry" size="lg">
											Crear cuenta
										</Button>
									</div>

									<hr className="my-4" />

									<p className="mb-0 text-center">
										¿Ya tienes cuenta?{' '}
										<Link to="/login" className="link-body-emphasis" state={{ from: currentPath }}>
											Inicia sesión
										</Link>
									</p>
								</form>
							</div>
						</div>
					</div>
				</div>
			</section>
		</main>
	)
}

export default RegisterUser
