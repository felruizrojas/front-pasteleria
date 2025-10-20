import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, FocusEvent, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button, Input } from '@/components/common'
import { defaultProfileImage } from '@/assets'
import useAuth from '@/hooks/useAuth'
import { cleanupOffcanvas, remountLoginOffcanvas } from '@/utils/offcanvas'
import { LOCAL_STORAGE_KEYS, type RegionSeed } from '@/utils/storage/initLocalData'
import { getLocalData, getLocalItem, setLocalItem } from '@/utils/storage/localStorageUtils'
import {
	mapFormToStoredUser,
	sanitizeNameField,
	saveUserRecord,
	validateUserForm,
} from '@/utils/validations/userValidations'
import type { UserFormValues } from '@/utils/validations/userValidations'
import type { ValidationErrors } from '@/utils/validations/types'
import type { StoredUser } from '@/types/user'

const splitRun = (value: string) => {
	const sanitized = value.replace(/[^0-9kK]/g, '').toUpperCase()
	if (!sanitized) {
		return { body: '', digit: '' }
	}
	if (sanitized.length === 1) {
		return { body: '', digit: sanitized }
	}
	return {
		body: sanitized.slice(0, -1).slice(0, 8),
		digit: sanitized.slice(-1),
	}
}

const createInitialValues = (user?: StoredUser | null): UserFormValues => {
	const { body, digit } = splitRun(user?.run ?? '')
	return {
		id: user?.id ?? '',
		run: body && digit ? `${body}${digit}` : '',
		runBody: body,
		runDigit: digit,
		nombre: user?.nombre ?? '',
		apellidos: user?.apellidos ?? '',
		correo: user?.correo ?? '',
		fechaNacimiento: user?.fechaNacimiento ?? '',
		regionId: user?.regionId ?? '',
		comuna: user?.comuna ?? '',
		direccion: user?.direccion ?? '',
		password: '',
		confirmPassword: '',
		termsAccepted: true,
		avatarUrl: user?.avatarUrl ?? defaultProfileImage,
		codigoDescuento: user?.codigoDescuento ?? '',
	}
}

const calculateAge = (isoDate?: string) => {
	if (!isoDate) {
		return null
	}

	const parsed = new Date(isoDate)
	if (Number.isNaN(parsed.getTime())) {
		return null
	}

	const today = new Date()
	let age = today.getFullYear() - parsed.getFullYear()
	const monthDiff = today.getMonth() - parsed.getMonth()
	if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < parsed.getDate())) {
		age -= 1
	}

	return age
}

const ProfilePage = () => {
	const navigate = useNavigate()
	const { logout, refreshUser } = useAuth()
	const [avatarUrl, setAvatarUrl] = useState<string>(defaultProfileImage)
	const [regions, setRegions] = useState<RegionSeed[]>([])
	const [currentUser, setCurrentUser] = useState<StoredUser | null>(null)
	const [values, setValues] = useState<UserFormValues>(createInitialValues())
	const [errors, setErrors] = useState<ValidationErrors<UserFormValues>>({})
	const [touched, setTouched] = useState<Partial<Record<keyof UserFormValues, boolean>>>({})
	const [feedback, setFeedback] = useState<{ type: 'success' | 'danger'; text: string } | null>(null)
	const isSuperAdmin = currentUser?.tipoUsuario === 'SuperAdmin'
	const [showToast, setShowToast] = useState(false)

	const benefits = useMemo(() => {
		const messages: Array<{ id: string; text: string }> = []
		const birthdate = values.fechaNacimiento || currentUser?.fechaNacimiento
		const age = calculateAge(birthdate)
		const promoCode = (currentUser?.codigoDescuento ?? values.codigoDescuento ?? '').trim().toUpperCase()
		const email = (values.correo || currentUser?.correo || '').toLowerCase()
		const domain = email.split('@')[1] ?? ''

		if (typeof age === 'number' && age >= 50) {
			messages.push({ id: 'senior-discount', text: 'Obtienes un 50% de descuento por ser mayor de 50 años.' })
		}

		if (promoCode === 'FELICES50') {
			messages.push({ id: 'felices50', text: 'Aplicamos un 10% de descuento gracias al código FELICES50.' })
		}

		if (domain === 'duoc.cl') {
			messages.push({
				id: 'duoc-birthday',
				text: 'Tienes derecho a una torta gratis en tu cumpleaños por pertenecer a la comunidad Duoc UC.',
			})
		}

		return messages
	}, [currentUser?.codigoDescuento, currentUser?.correo, currentUser?.fechaNacimiento, values.codigoDescuento, values.correo, values.fechaNacimiento])

	const runValidation = useCallback(
		(
			nextValues: UserFormValues,
			nextTouched: Partial<Record<keyof UserFormValues, boolean>>,
			validationOverride?: ReturnType<typeof validateUserForm>,
		) => {
			const validation = validationOverride ?? validateUserForm(nextValues, { mode: 'update' })
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

	const roleShortcut = useMemo(() => {
		const role = currentUser?.tipoUsuario

		if (role === 'Administrador' || role === 'SuperAdmin') {
			return {
				label: 'Ir a la vista de administrador',
				to: '/admin',
				icon: 'bi-speedometer2',
			}
		}

		if (role === 'Vendedor') {
			return {
				label: 'Ir a la vista de vendedor',
				to: '/seller',
				icon: 'bi-shop',
			}
		}

		return null
	}, [currentUser?.tipoUsuario])

	useEffect(() => {
		const regionData = getLocalData<RegionSeed>(LOCAL_STORAGE_KEYS.regiones)
		setRegions(regionData)
	}, [])

	useEffect(() => {
		const stored = getLocalItem<StoredUser>(LOCAL_STORAGE_KEYS.activeUser)
		if (!stored) {
			setFeedback({ type: 'danger', text: 'No encontramos tu sesión. Inicia sesión nuevamente.' })
			return
		}

		setCurrentUser(stored)
		setAvatarUrl(stored.avatarUrl ?? defaultProfileImage)
		setValues(createInitialValues(stored))
		setErrors({})
		setTouched({})
	}, [])

	const comunaOptions = useMemo(
		() => regions.find((region) => region.id === values.regionId)?.comunas ?? [],
		[regions, values.regionId],
	)

	const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.currentTarget.files?.[0]
		if (!file) {
			return
		}

		const reader = new FileReader()
		reader.addEventListener('load', () => {
			if (typeof reader.result === 'string') {
				setAvatarUrl(reader.result)
				setValues((prev) => ({ ...prev, avatarUrl: reader.result as string }))
				setTouched((prev) => ({ ...prev, avatarUrl: true }))
			}
		})
		reader.readAsDataURL(file)
	}

	const handleAvatarReset = () => {
		setAvatarUrl(defaultProfileImage)
		setValues((prev) => ({ ...prev, avatarUrl: defaultProfileImage }))
		setTouched((prev) => ({ ...prev, avatarUrl: true }))
	}

	const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.currentTarget
		const field = name as keyof UserFormValues
		let sanitizedValue = value
		if (name === 'nombre' || name === 'apellidos') {
			sanitizedValue = sanitizeNameField(value)
		} else if (name === 'codigoDescuento') {
			sanitizedValue = value.toUpperCase()
		}
		const nextValues = { ...values, [field]: sanitizedValue }
		const nextTouched = { ...touched, [field]: true }
		runValidation(nextValues, nextTouched)
		setValues(nextValues)
		setTouched(nextTouched)
		setFeedback(null)
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
		setFeedback(null)
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
		setFeedback(null)
	}

	const handleRunBodyChange = () => {}

	const handleRunDigitChange = () => {}

	const handleRunBlur = () => {}

	const handleSave = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (!currentUser) {
			setFeedback({ type: 'danger', text: 'No es posible actualizar el perfil sin sesión activa.' })
			return
		}
		// Permitir que la superadmin actualice todo excepto su RUN
		if (currentUser.tipoUsuario === 'SuperAdmin') {
			const originalRun = currentUser.run ?? ''
			const newRun = values.run ?? ''
			if (originalRun !== newRun) {
				setFeedback({ type: 'danger', text: 'La cuenta principal no permite modificar el RUN.' })
				return
			}
		}

		const fieldKeys = Object.keys(values) as Array<keyof UserFormValues>
		const allTouched: Partial<Record<keyof UserFormValues, boolean>> = {}
		fieldKeys.forEach((key) => {
			allTouched[key] = true
		})
		const validation = runValidation(values, allTouched)
		setTouched(allTouched)
		if (!validation.isValid) {
			setFeedback({ type: 'danger', text: 'Corrige los campos marcados e inténtalo nuevamente.' })
			return
		}

		const record = mapFormToStoredUser({ ...values, avatarUrl, password: values.password || '' }, currentUser)
		saveUserRecord(record)
		setLocalItem(LOCAL_STORAGE_KEYS.activeUser, record)
		setCurrentUser(record)
		setAvatarUrl(record.avatarUrl ?? defaultProfileImage)
		setValues(createInitialValues(record))
		setErrors({})
		setTouched({})
		setFeedback({ type: 'success', text: 'Datos actualizados con éxito.' })
		refreshUser(record)
		setShowToast(true)
	}

	return (
		<main className="py-5 bg-light-subtle">
			{showToast ? (
				<div className="position-fixed top-0 start-50 translate-middle-x mt-4" style={{ zIndex: 1055 }}>
					<div className="toast show align-items-center text-bg-success border-0" role="status" aria-live="assertive">
						<div className="d-flex">
							<div className="toast-body">
								<i className="bi bi-check-circle-fill me-2" aria-hidden="true" /> Cambios guardados con éxito.
							</div>
							<button
								type="button"
								className="btn-close btn-close-white me-2 m-auto"
								aria-label="Cerrar"
								onClick={() => setShowToast(false)}
							/>
						</div>
					</div>
				</div>
			) : null}
			<div className="container">
				<div className="row g-4 g-lg-5">
					<div className="col-12 col-lg-4">
						<div className="card border-0 shadow-sm">
							<div className="card-body p-4">
								<div className="text-center mb-4">
									<img
										src={avatarUrl}
										alt="Avatar del usuario"
										className="rounded-circle mb-3 mx-auto d-block"
										width={140}
										height={140}
										style={{ objectFit: 'cover' }}
									/>

									{isSuperAdmin ? (
										<span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle mb-3">
											Super administradora
										</span>
									) : null}

									<div className="d-grid gap-2">
										<label
											className={`btn btn-outline-secondary${isSuperAdmin ? ' disabled' : ''}`}
											htmlFor={isSuperAdmin ? undefined : 'profileAvatarUpload'}
											aria-disabled={isSuperAdmin}
											style={isSuperAdmin ? { pointerEvents: 'none' } : undefined}
										>
											<i className="bi bi-image me-1" aria-hidden="true" /> Cambiar foto
											<input
												id="profileAvatarUpload"
												type="file"
												accept="image/*"
												hidden
												onChange={handleAvatarChange}
											/>
										</label>
										<Button type="button" variant="mint" onClick={handleAvatarReset} disabled={isSuperAdmin}>
											<i className="bi bi-trash me-1" aria-hidden="true" /> Quitar foto
										</Button>
									</div>
								</div>

								<div className="d-grid gap-2 mt-3">
									<Button as="link" to="/cart" variant="mint">
										<i className="bi bi-receipt me-1" aria-hidden="true" /> Mis pedidos
									</Button>
									{roleShortcut ? (
										<Button as="link" to={roleShortcut.to} variant="mint">
											<i className={`bi ${roleShortcut.icon} me-1`} aria-hidden="true" /> {roleShortcut.label}
										</Button>
									) : null}
									<Button
										type="button"
										variant="strawberry"
										onClick={() => {
											cleanupOffcanvas('offcanvasLogin')
											logout()
											remountLoginOffcanvas()
											navigate('/', { replace: true })
										}}
									>
										<i className="bi bi-box-arrow-right me-1" aria-hidden="true" /> Cerrar sesión
									</Button>
								</div>
							</div>
						</div>

						{benefits.length > 0 ? (
							<div className="card border-0 shadow-sm mt-4">
								<div className="card-body p-4">
									<h2 className="h6 text-uppercase text-body-secondary fw-semibold mb-3">Beneficios disponibles</h2>
									<ul className="list-unstyled mb-0 small">
										{benefits.map((benefit) => (
											<li key={benefit.id} className="d-flex align-items-start gap-2 mb-2">
												<i className="bi bi-gift-fill text-success mt-1" aria-hidden="true" />
												<span>{benefit.text}</span>
											</li>
										))}
									</ul>
								</div>
							</div>
						) : null}
					</div>

					<div className="col-12 col-lg-8">
						<div className="card border-0 shadow-sm mb-4">
							<div className="card-body p-4 p-lg-5">
								<h1 className="h4 fw-bold mb-4">Datos personales</h1>
								<form className="row g-3" onSubmit={handleSave} noValidate>
									{feedback ? (
										<div className={`alert alert-${feedback.type}`} role="alert">
											{feedback.text}
										</div>
									) : null}
			
									<div className="col-12 col-md-6">
										<label className="form-label fw-semibold" htmlFor="profileRunBody">
											RUN
										</label>
										<div className="d-flex align-items-center gap-2">
											<input
												type="text"
												id="profileRunBody"
												name="runBody"
												className={`form-control${errors.runBody || errors.run ? ' is-invalid' : ''}`}
												inputMode="numeric"
												pattern="[0-9]*"
												placeholder="19011022"
												value={values.runBody}
												onChange={handleRunBodyChange}
												onBlur={handleRunBlur}
												maxLength={8}
												style={{ flex: 1 }}
												disabled
												readOnly
											/>
											<span className="fw-semibold" aria-hidden="true">
												-
											</span>
											<input
												type="text"
												id="profileRunDigit"
												name="runDigit"
												className={`form-control${errors.runDigit || errors.run ? ' is-invalid' : ''}`}
												inputMode="text"
												pattern="[0-9Kk]"
												placeholder="K"
												value={values.runDigit}
												onChange={handleRunDigitChange}
												onBlur={handleRunBlur}
												maxLength={1}
												style={{ width: '4rem' }}
												disabled
												readOnly
											/>
										</div>
										{errors.runBody ? <div className="invalid-feedback d-block">{errors.runBody}</div> : null}
										{errors.runDigit ? <div className="invalid-feedback d-block">{errors.runDigit}</div> : null}
										{!errors.runBody && !errors.runDigit && errors.run ? (
											<div className="invalid-feedback d-block">{errors.run}</div>
										) : null}
									</div>
									<div className="col-12 col-md-6">
										<label className="form-label" htmlFor="birthdate">
											Fecha de nacimiento (opcional)
										</label>
										<input
											type="date"
											id="birthdate"
											name="fechaNacimiento"
											className={`form-control${errors.fechaNacimiento ? ' is-invalid' : ''}`}
											value={values.fechaNacimiento ?? ''}
											onChange={handleInputChange}
											onBlur={handleInputBlur}
											/* superadmin puede editar excepto RUN */
										/>
										{errors.fechaNacimiento ? (
											<div className="invalid-feedback d-block">{errors.fechaNacimiento}</div>
										) : null}
									</div>
									<div className="col-12 col-md-6">
										<Input
											label="Nombre"
											name="nombre"
											placeholder="María"
											value={values.nombre}
											onChange={handleInputChange}
											onBlur={handleInputBlur}
											errorText={errors.nombre}
											/* editable por superadmin */
										/>
									</div>
									<div className="col-12 col-md-6">
										<Input
											label="Apellidos"
											name="apellidos"
											placeholder="Pérez González"
											value={values.apellidos}
											onChange={handleInputChange}
											onBlur={handleInputBlur}
											errorText={errors.apellidos}
											/* editable por superadmin */
										/>
									</div>
									<div className="col-12">
										<Input
											label="Correo"
											name="correo"
											type="email"
											placeholder="usuario@dominio.com"
											value={values.correo}
											onChange={handleInputChange}
											onBlur={handleInputBlur}
											errorText={errors.correo}
											/* editable por superadmin */
										/>
										<Input
											label="Código promocional (opcional)"
											name="codigoDescuento"
											placeholder="Ej: FELICES50"
											value={values.codigoDescuento ?? ''}
											onChange={handleInputChange}
											onBlur={handleInputBlur}
											helperText="Úsalo para activar beneficios disponibles."
											errorText={errors.codigoDescuento}
											/* editable por superadmin */
										/>
									</div>
									<div className="col-12 col-md-6">
										<label className="form-label" htmlFor="region">
											Región
										</label>
										<select
											id="region"
											className={`form-select${errors.regionId ? ' is-invalid' : ''}`}
											value={values.regionId}
											onChange={handleRegionChange}
											/* editable por superadmin */
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
									<div className="col-12 col-md-6">
										<label className="form-label" htmlFor="comuna">
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
									<div className="col-12">
										<Input
											label="Dirección"
											name="direccion"
											placeholder="Calle 123"
											value={values.direccion}
											onChange={handleInputChange}
											onBlur={handleInputBlur}
											errorText={errors.direccion}
											/* editable por superadmin */
										/>
									</div>
									<div className="col-12 col-md-6">
										<Input
											label="Contraseña"
											name="password"
											type="password"
											placeholder="••••"
											value={values.password}
											onChange={handleInputChange}
											onBlur={handleInputBlur}
											helperText="Déjalo en blanco para mantener tu contraseña actual."
											errorText={errors.password}
											/* editable por superadmin */
										/>
									</div>
									<div className="col-12 col-md-6">
										<Input
											label="Confirmar contraseña"
											name="confirmPassword"
											type="password"
											placeholder="••••"
											value={values.confirmPassword}
											onChange={handleInputChange}
											onBlur={handleInputBlur}
											errorText={errors.confirmPassword}
											/* editable por superadmin */
										/>
									</div>

									<div className="d-flex flex-wrap gap-2 mt-4">
										<Button type="submit" variant="strawberry">
											<i className="bi bi-save2 me-1" aria-hidden="true" /> Guardar cambios
										</Button>
									</div>
								</form>
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>
	)
}

export default ProfilePage
