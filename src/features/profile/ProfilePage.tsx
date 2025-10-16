import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Button, Input } from '@/shared/components/common'
import { logoImage as defaultAvatar } from '@/assets'
import useAuth from '@/shared/hooks/useAuth'
import { LOCAL_STORAGE_KEYS } from '@/shared/utils/storage/initLocalData'
import { getLocalData, getLocalItem, setLocalItem } from '@/shared/utils/storage/localStorageUtils'
import {
	mapFormToStoredUser,
	saveUserRecord,
	validateUserForm,
} from '@/shared/utils/validations/userValidations'
import type { UserFormValues } from '@/shared/utils/validations/userValidations'
import type { ValidationErrors } from '@/shared/utils/validations/types'
import type { StoredUser } from '@/shared/types/user'

const createInitialValues = (user?: StoredUser | null): UserFormValues => ({
	id: user?.id ?? '',
	run: user?.run ?? '',
	nombre: user?.nombre ?? '',
	apellidos: user?.apellidos ?? '',
	correo: user?.correo ?? '',
	fechaNacimiento: user?.fechaNacimiento ?? '',
	regionId: user?.regionId ?? '',
	comuna: user?.comuna ?? '',
	direccion: user?.direccion ?? '',
	password: '',
	confirmPassword: '',
})

const Profile = () => {
	const location = useLocation()
	const navigate = useNavigate()
	const currentPath = `${location.pathname}${location.search}`
	const { login, logout, user } = useAuth()
	const [avatarUrl, setAvatarUrl] = useState<string>(defaultAvatar)
	const [regions, setRegions] = useState<Array<{ id: string; nombre: string; comunas: string[] }>>([])
	const [currentUser, setCurrentUser] = useState<StoredUser | null>(null)
	const [values, setValues] = useState<UserFormValues>(createInitialValues())
	const [errors, setErrors] = useState<ValidationErrors<UserFormValues>>({})
	const [feedback, setFeedback] = useState<{ type: 'success' | 'danger'; text: string } | null>(null)

	useEffect(() => {
		const regionData = getLocalData<typeof regions[number]>(LOCAL_STORAGE_KEYS.regiones)
		setRegions(regionData)
	}, [])

	useEffect(() => {
		const stored = getLocalItem<StoredUser>(LOCAL_STORAGE_KEYS.activeUser)
		if (!stored) {
			setFeedback({ type: 'danger', text: 'No encontramos tu sesión. Inicia sesión nuevamente.' })
			return
		}

		setCurrentUser(stored)
		setValues(createInitialValues(stored))
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
			}
		})
		reader.readAsDataURL(file)
	}

	const handleAvatarReset = () => {
		setAvatarUrl(defaultAvatar)
	}

	const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.currentTarget
		setValues((previous) => ({ ...previous, [name]: value }))
		setErrors((previous) => ({ ...previous, [name]: undefined }))
		setFeedback(null)
	}

	const handleRegionChange = (event: ChangeEvent<HTMLSelectElement>) => {
		const nextRegion = event.currentTarget.value
		setValues((previous) => ({ ...previous, regionId: nextRegion, comuna: '' }))
		setErrors((previous) => ({ ...previous, regionId: undefined, comuna: undefined }))
		setFeedback(null)
	}

	const handleComunaChange = (event: ChangeEvent<HTMLSelectElement>) => {
		const nextComuna = event.currentTarget.value
		setValues((previous) => ({ ...previous, comuna: nextComuna }))
		setErrors((previous) => ({ ...previous, comuna: undefined }))
		setFeedback(null)
	}

	const handleSave = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (!currentUser) {
			setFeedback({ type: 'danger', text: 'No es posible actualizar el perfil sin sesión activa.' })
			return
		}

		const validation = validateUserForm(values, { mode: 'update' })
		if (!validation.isValid) {
			setErrors(validation.errors)
			setFeedback({ type: 'danger', text: 'Corrige los campos marcados e inténtalo nuevamente.' })
			return
		}

		const record = mapFormToStoredUser({ ...values, password: values.password || currentUser.password }, currentUser)
		saveUserRecord(record)
		setLocalItem(LOCAL_STORAGE_KEYS.activeUser, record)
		setCurrentUser(record)
		setValues(createInitialValues(record))
		setFeedback({ type: 'success', text: 'Datos actualizados con éxito.' })

		await login({ email: record.correo, password: record.password })
	}

	return (
		<main className="py-5 bg-light-subtle">
			<div className="container">
				<div className="row g-4 g-lg-5">
					<div className="col-12 col-lg-4">
						<div className="card border-0 shadow-sm">
							<div className="card-body p-4">
								<div className="text-center mb-4">
									<img
										src={avatarUrl}
										alt="Avatar del usuario"
										className="rounded-circle mb-3"
										width={140}
										height={140}
										style={{ objectFit: 'cover' }}
									/>

									<div className="d-grid gap-2">
										<label className="btn btn-pastel btn-mint mb-0">
											<i className="bi bi-image me-1" aria-hidden="true" /> Cambiar foto
											<input type="file" accept="image/*" hidden onChange={handleAvatarChange} />
										</label>
										<Button type="button" variant="mint" onClick={handleAvatarReset}>
											<i className="bi bi-trash me-1" aria-hidden="true" /> Quitar foto
										</Button>
								</div>

								</div>

								<hr />

								<div className="text-start small">
									<div className="d-flex justify-content-between">
										<span>Correo</span>
										<span className="fw-semibold">{values.correo || user?.email || '—'}</span>
									</div>
								</div>

								<div className="d-grid gap-2 mt-3">
									<Button as="link" to="/cart" variant="mint">
										<i className="bi bi-receipt me-1" aria-hidden="true" /> Mis pedidos
									</Button>
									<Button
										type="button"
										variant="strawberry"
										onClick={() => {
											logout()
											navigate('/login', { replace: true, state: { from: currentPath } })
										}}
									>
										<i className="bi bi-box-arrow-right me-1" aria-hidden="true" /> Cerrar sesión
									</Button>
								</div>
							</div>
						</div>
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
										<Input
											label="RUN"
											name="run"
											placeholder="19011022K"
											value={values.run}
											onChange={handleInputChange}
											errorText={errors.run}
										/>
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
											errorText={errors.nombre}
										/>
									</div>
									<div className="col-12 col-md-6">
										<Input
											label="Apellidos"
											name="apellidos"
											placeholder="Pérez González"
											value={values.apellidos}
											onChange={handleInputChange}
											errorText={errors.apellidos}
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
											helperText="El rol se asigna automáticamente según el dominio."
											errorText={errors.correo}
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
											errorText={errors.direccion}
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
											helperText="Déjalo en blanco para mantener tu contraseña actual."
											errorText={errors.password}
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
											errorText={errors.confirmPassword}
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

export default Profile
