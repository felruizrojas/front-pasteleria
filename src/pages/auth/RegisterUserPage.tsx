import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, FocusEvent, FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { Button, Input } from '@/components/common'
import { logoImage } from '@/assets'
import heroImage from '@/assets/images/carrusel/diversidad_pasteles.jpg'
import { LOCAL_STORAGE_KEYS, type RegionSeed } from '@/utils/storage/initLocalData'
import { getLocalData, setLocalItem } from '@/utils/storage/localStorageUtils'
import {
	MIN_AGE,
	mapFormToStoredUser,
	sanitizeNameField,
	saveUserRecord,
	validateUserForm,
} from '@/utils/validations/userValidations'
import type { UserFormValues } from '@/utils/validations/userValidations'
import type { ValidationErrors } from '@/utils/validations/types'
import useAuth from '@/hooks/useAuth'

const RegisterUserPage = () => {
	const location = useLocation()
	const currentPath = location.pathname
	const navigate = useNavigate()
	const { login } = useAuth()
	const [regions, setRegions] = useState<RegionSeed[]>([])
	const [values, setValues] = useState<UserFormValues>({
		run: '',
		runBody: '',
		runDigit: '',
		nombre: '',
		apellidos: '',
		correo: '',
		fechaNacimiento: '',
		regionId: '',
		comuna: '',
		direccion: '',
		password: '',
		confirmPassword: '',
		termsAccepted: false,
	})
	const [errors, setErrors] = useState<ValidationErrors<UserFormValues>>({})
	const [touched, setTouched] = useState<Partial<Record<keyof UserFormValues, boolean>>>({})
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
		const regionData = getLocalData<RegionSeed>(LOCAL_STORAGE_KEYS.regiones)
		setRegions(regionData)
	}, [])

	const runValidation = useCallback(
		(
			nextValues: UserFormValues,
			nextTouched: Partial<Record<keyof UserFormValues, boolean>>,
			validationOverride?: ReturnType<typeof validateUserForm>,
		) => {
			const validation = validationOverride ?? validateUserForm(nextValues, { mode: 'create' })
			const filtered: ValidationErrors<UserFormValues> = {}
			;(Object.keys(nextTouched) as Array<keyof UserFormValues>).forEach((key) => {
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

	const comunaOptions = useMemo(
		() => regions.find((region) => region.id === values.regionId)?.comunas ?? [],
		[regions, values.regionId],
	)

	const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.currentTarget
		const field = name as keyof UserFormValues
		const sanitizedValue = name === 'nombre' || name === 'apellidos' ? sanitizeNameField(value) : value
		const nextValues = { ...values, [field]: sanitizedValue }
		const validation = validateUserForm(nextValues, { mode: 'create' })
		const nextTouched: Partial<Record<keyof UserFormValues, boolean>> = { ...touched }
		if (touched[field] || validation.errors[field]) {
			nextTouched[field] = true
		}
		runValidation(nextValues, nextTouched, validation)
		setValues(nextValues)
		setTouched(nextTouched)
		setFormMessage(null)
	}

		const handleTermsChange = (event: ChangeEvent<HTMLInputElement>) => {
			const checked = event.currentTarget.checked
			const nextValues = { ...values, termsAccepted: checked }
			const validation = validateUserForm(nextValues, { mode: 'create' })
			const nextTouched: Partial<Record<keyof UserFormValues, boolean>> = { ...touched, termsAccepted: true }
			runValidation(nextValues, nextTouched, validation)
			setValues(nextValues)
			setTouched(nextTouched)
			setFormMessage(null)
		}

	const handleRunBodyChange = (event: ChangeEvent<HTMLInputElement>) => {
		const digits = event.currentTarget.value.replace(/\D/g, '').slice(0, 8)
		const combined = `${digits}${values.runDigit ?? ''}`
		const nextValues = { ...values, runBody: digits, run: combined }
		const validation = validateUserForm(nextValues, { mode: 'create' })
		const nextTouched: Partial<Record<keyof UserFormValues, boolean>> = { ...touched }
		if (touched.runBody || validation.errors.runBody) {
			nextTouched.runBody = true
		}
		if (touched.run || validation.errors.run) {
			nextTouched.run = true
		}
		runValidation(nextValues, nextTouched, validation)
		setValues(nextValues)
		setTouched(nextTouched)
		setFormMessage(null)
	}

	const handleRunDigitChange = (event: ChangeEvent<HTMLInputElement>) => {
		const verifier = event.currentTarget.value.replace(/[^0-9kK]/g, '').toUpperCase().slice(0, 1)
		const combined = `${values.runBody ?? ''}${verifier}`
		const nextValues = { ...values, runDigit: verifier, run: combined }
		const validation = validateUserForm(nextValues, { mode: 'create' })
		const nextTouched: Partial<Record<keyof UserFormValues, boolean>> = { ...touched }
		if (touched.runDigit || validation.errors.runDigit) {
			nextTouched.runDigit = true
		}
		if (validation.errors.runBody) {
			nextTouched.runBody = true
		}
		if (touched.run || validation.errors.run) {
			nextTouched.run = true
		}
		runValidation(nextValues, nextTouched, validation)
		setValues(nextValues)
		setTouched(nextTouched)
		setFormMessage(null)
	}

	const handleRunBlur = (field: 'runBody' | 'runDigit') => {
		const nextTouched: Partial<Record<keyof UserFormValues, boolean>> = {
			...touched,
			[field]: true,
			run: true,
		}
		runValidation(values, nextTouched)
		setTouched(nextTouched)
	}

	const handleInputBlur = (event: FocusEvent<HTMLInputElement>) => {
		const { name } = event.currentTarget
		if (!name) {
			return
		}
		const field = name as keyof UserFormValues
		const nextTouched = { ...touched, [field]: true }
		runValidation(values, nextTouched)
		setTouched(nextTouched)
	}

	const handleRegionChange = (event: ChangeEvent<HTMLSelectElement>) => {
		const nextRegion = event.currentTarget.value
		const nextValues = { ...values, regionId: nextRegion, comuna: '' }
		const nextTouched: Partial<Record<keyof UserFormValues, boolean>> = {
			...touched,
			regionId: true,
			comuna: true,
		}
		runValidation(nextValues, nextTouched)
		setValues(nextValues)
		setTouched(nextTouched)
		setFormMessage(null)
	}

	const handleComunaChange = (event: ChangeEvent<HTMLSelectElement>) => {
		const nextComuna = event.currentTarget.value
		const nextValues = { ...values, comuna: nextComuna }
		const nextTouched: Partial<Record<keyof UserFormValues, boolean>> = {
			...touched,
			comuna: true,
		}
		runValidation(nextValues, nextTouched)
		setValues(nextValues)
		setTouched(nextTouched)
		setFormMessage(null)
	}

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const fieldKeys = Object.keys(values) as Array<keyof UserFormValues>
		const allTouched: Partial<Record<keyof UserFormValues, boolean>> = {}
		fieldKeys.forEach((key) => {
			allTouched[key] = true
		})
		const validation = runValidation(values, allTouched)
		setTouched(allTouched)
		if (!validation.isValid) {
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
			<section
				className="position-relative overflow-hidden text-white"
				style={{
					backgroundImage: `linear-gradient(135deg, rgba(39, 12, 63, 0.75), rgba(233, 30, 99, 0.55)), url(${heroImage})`,
					backgroundSize: 'cover',
					backgroundPosition: 'center',
					backgroundRepeat: 'no-repeat',
				}}
			>
				<div className="container py-3 position-relative">
					<div className="row justify-content-center">
						<div className="col-11 col-md-10 col-lg-6">
							<div
								className="d-flex flex-column flex-lg-row align-items-center gap-3 text-center text-lg-start p-3 p-lg-4 rounded-4 shadow-lg"
								style={{
									background: 'rgba(31, 8, 56, 0.5)',
									backdropFilter: 'blur(18px)',
									border: '1px solid rgba(255, 255, 255, 0.2)',
								}}
							>
								<img
									src={logoImage}
									alt="Pastelería Mil Sabores"
									width={140}
									className="rounded-pill shadow border border-light border-opacity-50"
								/>
								<div>
									<span className="badge text-uppercase fw-semibold mb-3 bg-white text-body-secondary px-3 py-2">
										Tu pastelería favorita
									</span>
									<h1 className="mb-2 brand-name text-white">Pastelería Mil Sabores</h1>
									<h2 className="h4 mb-3" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
										Crea tu cuenta
									</h2>
									<p className="lead mb-0" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
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

									<div className="mb-3">
										<label className="form-label fw-semibold" htmlFor="runBody">
											RUN
										</label>
										<div className="d-flex align-items-center gap-2">
											<input
												type="text"
												id="runBody"
												name="runBody"
												className={`form-control${errors.runBody || errors.run ? ' is-invalid' : ''}`}
												inputMode="numeric"
												pattern="[0-9]*"
												placeholder="19011022"
												value={values.runBody}
												onChange={handleRunBodyChange}
												onBlur={() => handleRunBlur('runBody')}
												aria-describedby="runHelp"
												autoComplete="off"
												maxLength={8}
												style={{ flex: 1 }}
											/>
											<span className="fw-semibold" aria-hidden="true">
												-
											</span>
											<input
												type="text"
												id="runDigit"
												name="runDigit"
												className={`form-control${errors.runDigit || errors.run ? ' is-invalid' : ''}`}
												inputMode="text"
												pattern="[0-9Kk]"
												placeholder="K"
												value={values.runDigit}
												onChange={handleRunDigitChange}
												onBlur={() => handleRunBlur('runDigit')}
												maxLength={1}
												style={{ width: '4rem' }}
												autoComplete="off"
											/>
										</div>
										<div id="runHelp" className="form-text">
											Ingresa los 7 u 8 dígitos y luego el dígito verificador.
										</div>
										{errors.runBody ? <div className="invalid-feedback d-block">{errors.runBody}</div> : null}
										{errors.runDigit ? <div className="invalid-feedback d-block">{errors.runDigit}</div> : null}
										{!errors.runBody && !errors.runDigit && errors.run ? (
											<div className="invalid-feedback d-block">{errors.run}</div>
										) : null}
									</div>
									<Input
										name="nombre"
										label="Nombre"
										placeholder="María Luisa"
										value={values.nombre}
										onChange={handleInputChange}
										onBlur={handleInputBlur}
										errorText={errors.nombre}
									/>
									<Input
										name="apellidos"
										label="Apellidos"
										placeholder="Pérez González"
										value={values.apellidos}
										onChange={handleInputChange}
										onBlur={handleInputBlur}
										errorText={errors.apellidos}
									/>
									<Input
										name="correo"
										label="Correo electrónico"
										placeholder="usuario@dominio.com"
										type="email"
										value={values.correo}
										onChange={handleInputChange}
										onBlur={handleInputBlur}
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
												onBlur={handleInputBlur}
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
												onBlur={handleInputBlur}
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
														{region.region}
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
												onBlur={handleInputBlur}
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
												onBlur={handleInputBlur}
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
										<input
											type="checkbox"
											className={`form-check-input${errors.termsAccepted ? ' is-invalid' : ''}`}
											id="terms"
											name="termsAccepted"
											checked={Boolean(values.termsAccepted)}
											onChange={handleTermsChange}
											onBlur={() => {
												const nextTouched: Partial<Record<keyof UserFormValues, boolean>> = {
													...touched,
													termsAccepted: true,
												}
												runValidation(values, nextTouched)
												setTouched(nextTouched)
											}}
											required
										/>
										<label className="form-check-label" htmlFor="terms">
											Acepto los <a className="link-body-emphasis" href="/terminos">términos y condiciones</a>
										</label>
										{errors.termsAccepted ? (
											<div className="invalid-feedback d-block">{errors.termsAccepted}</div>
										) : null}
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

export default RegisterUserPage
