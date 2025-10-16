import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { Button, Input } from '../../components/common'
import { REGIONES_COMUNAS } from '../../data/region_comuna'

const RegisterUser = () => {
	const location = useLocation()
	const currentPath = `${location.pathname}${location.search}`
	const [regionId, setRegionId] = useState('')
	const [comuna, setComuna] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)

	useEffect(() => {
		if (typeof window === 'undefined' || typeof document === 'undefined') {
			return
		}

		const bootstrapApi = (window as typeof window & { bootstrap?: any }).bootstrap

		document.querySelectorAll<HTMLElement>('.offcanvas.show').forEach((element) => {
			const instance =
				bootstrapApi?.Offcanvas?.getInstance?.(element) ?? bootstrapApi?.Offcanvas?.getOrCreateInstance?.(element)
			instance?.hide?.()
		})

		document.querySelectorAll('.offcanvas-backdrop').forEach((backdrop) => backdrop.remove())

		document.body.style.removeProperty('overflow')
		document.body.removeAttribute('data-bs-overflow')
		document.body.removeAttribute('data-bs-padding-right')
	}, [])

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
	}

	const handleRegionChange = (event: ChangeEvent<HTMLSelectElement>) => {
		setRegionId(event.currentTarget.value)
		setComuna('')
	}

	const handleComunaChange = (event: ChangeEvent<HTMLSelectElement>) => {
		setComuna(event.currentTarget.value)
	}

	const comunaOptions = REGIONES_COMUNAS.find((region) => region.id === regionId)?.comunas ?? []

	return (
		<main className="register-page">
			<div className="container-fluid px-0">
				<div className="row g-0 flex-lg-row-reverse min-vh-100">
					<div className="col-12 col-lg-5 register-panel border-start">
						<div className="register-panel__inner">
							<header className="register-panel__header">
								<div className="d-flex align-items-center justify-content-between border-bottom pb-3">
									<div>
										<h1 className="h4 mb-1">
											<i className="bi bi-person-plus me-2" aria-hidden="true" />Crear cuenta
										</h1>
										<p className="text-muted-soft mb-0">Completa tus datos para acceder a la experiencia completa.</p>
									</div>
									<Link to="/" className="btn btn-sm btn-light" aria-label="Volver al inicio">
										<i className="bi bi-x-lg" aria-hidden="true" />
									</Link>
								</div>
							</header>

							<div className="register-panel__body">
								<form onSubmit={handleSubmit}>
									<Input
										name="firstName"
										label="Primer nombre"
										placeholder="Ej: María"
									/>
									<Input
										name="secondName"
										label="Segundo nombre (opcional)"
										placeholder="Ej: Luisa"
									/>
									<Input
										name="paternalLastName"
										label="Apellido paterno"
										placeholder="Ej: Pérez"
									/>
									<Input
										name="maternalLastName"
										label="Apellido materno (opcional)"
										placeholder="Ej: González"
									/>
									<Input
										name="run"
										label="RUN"
										placeholder="19011022K"
										inputMode="text"
									/>
									<Input
										name="birthdate"
										label="Fecha de nacimiento (opcional)"
										placeholder="dd/mm/aaaa"
										inputMode="numeric"
										helperText="Formato: dd/mm/aaaa"
									/>
									<Input
										name="phone"
										label="Teléfono (opcional)"
										placeholder="+56 9 1234 5678"
										inputMode="tel"
									/>
									<Input
										name="email"
										label="Correo electrónico"
										placeholder="usuario@dominio.com"
										type="email"
									/>
									<Input
										name="address"
										label="Dirección"
										placeholder="Calle 123"
									/>

									<div className="row g-3">
										<div className="col-12 col-lg-6">
											<label className="form-label fw-semibold" htmlFor="region">
												Región
											</label>
											<select
												id="region"
												name="region"
												className="form-select"
												value={regionId}
												onChange={handleRegionChange}
											>
												<option value="">Sin selección</option>
												{REGIONES_COMUNAS.map((region) => (
													<option key={region.id} value={region.id}>
														{region.nombre}
													</option>
												))}
											</select>
										</div>
										<div className="col-12 col-lg-6">
											<label className="form-label fw-semibold" htmlFor="comuna">
												Comuna
											</label>
											<select
												id="comuna"
												name="comuna"
												className="form-select"
												disabled={!regionId}
												value={comuna}
												onChange={handleComunaChange}
											>
												<option value="">Sin selección</option>
												{comunaOptions.map((comuna) => (
													<option key={comuna} value={comuna}>
														{comuna}
													</option>
												))}
											</select>
										</div>
									</div>

									<div className="mb-3">
										<label className="form-label fw-semibold" htmlFor="password">
											Contraseña
										</label>
										<div className="input-group">
											<input
												type={showPassword ? 'text' : 'password'}
												className="form-control"
												id="password"
												name="password"
												aria-describedby="passwordHelp"
											/>
											<button
												type="button"
												className="btn btn-outline-dark"
												onClick={() => setShowPassword((value) => !value)}
												aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
											>
												<i className={showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'} aria-hidden="true" />
											</button>
										</div>
										<div id="passwordHelp" className="form-text">
											Puedes crear una contraseña segura con letras y números.
										</div>
									</div>

									<div className="mb-3">
										<label className="form-label fw-semibold" htmlFor="confirmPassword">
											Confirmar contraseña
										</label>
										<div className="input-group">
											<input
												type={showConfirmPassword ? 'text' : 'password'}
												className="form-control"
												id="confirmPassword"
												name="confirmPassword"
											/>
											<button
												type="button"
												className="btn btn-outline-dark"
												onClick={() => setShowConfirmPassword((value) => !value)}
												aria-label={showConfirmPassword ? 'Ocultar confirmación' : 'Mostrar confirmación'}
											>
												<i className={showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'} aria-hidden="true" />
											</button>
										</div>
									</div>

									<Input
										name="welcomeCode"
										label="Código de bienvenida (opcional)"
										placeholder="Ej: MILSABORES2025"
										helperText="Si tienes un código, ingrésalo aquí. Puedes dejarlo en blanco."
									/>

									<div className="form-check mb-4">
										<input
											type="checkbox"
											className="form-check-input"
											id="terms"
											name="terms"
										/>
										<label className="form-check-label" htmlFor="terms">
											<a className="link-choco" href="/terminos">
												Acepto los términos y condiciones
											</a>
										</label>
									</div>

									<div className="d-grid">
										<Button type="submit" className="btn-app--brand" size="lg">
											Crear cuenta
										</Button>
									</div>

									<hr className="my-4" />

									<p className="mb-0 text-center">
										¿Ya tienes cuenta?{' '}
										<Link to="/login" className="link-choco" state={{ from: currentPath }}>
											Inicia sesión
										</Link>
									</p>
								</form>
							</div>
						</div>
					</div>
					<div className="col-lg-7 d-none d-lg-flex register-brand-panel">
						<div className="register-brand-panel__inner">
							<img
								src={new URL('../../assets/logo_tienda.png', import.meta.url).href}
								alt="Pastelería Mil Sabores"
								width={140}
								className="register-brand-panel__logo rounded-pill"
							/>
							<div className="register-brand-panel__copy">
								<h2 className="h4 mb-2">Pastelería Mil Sabores</h2>
								<p className="text-muted-soft mb-0">¡Celebra la dulzura de la vida!</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>
	)
}

export default RegisterUser

