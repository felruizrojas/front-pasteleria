import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'

import { Button, Input } from '@/shared/components/common'
import { LOCAL_STORAGE_KEYS } from '@/shared/utils/storage/initLocalData'
import { appendLocalData } from '@/shared/utils/storage/localStorageUtils'
import {
	validateContactForm,
	type ContactFormValues,
} from '@/shared/utils/validations/contactValidations'
import type { ValidationErrors } from '@/shared/utils/validations/types'

type ContactMessage = ContactFormValues & {
	fecha: string
}

const Contact = () => {
	const [values, setValues] = useState<ContactFormValues>({ nombre: '', correo: '', comentario: '' })
	const [errors, setErrors] = useState<ValidationErrors<ContactFormValues>>({})
	const [feedback, setFeedback] = useState<{ type: 'success' | 'danger'; text: string } | null>(null)

	const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = event.currentTarget
		setValues((previous) => ({ ...previous, [name]: value }))
		setErrors((previous) => ({ ...previous, [name]: undefined }))
		setFeedback(null)
	}

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const validation = validateContactForm(values)
		if (!validation.isValid) {
			setErrors(validation.errors)
			setFeedback({ type: 'danger', text: 'Revisa los campos marcados e inténtalo nuevamente.' })
			return
		}

		const message: ContactMessage = {
			...values,
			fecha: new Date().toISOString(),
		}

		appendLocalData<ContactMessage>(LOCAL_STORAGE_KEYS.contactMessages, message)
		setFeedback({ type: 'success', text: '¡Mensaje enviado! Te contactaremos a la brevedad.' })
		setValues({ nombre: '', correo: '', comentario: '' })
	}

	return (
		<section className="contact-page py-4">
			<div className="d-flex align-items-center justify-content-center pb-5 px-4">
				<div className="card shadow-sm border-0 p-4 contact-card w-100" style={{ maxWidth: 540 }}>
					<h2 className="text-center mb-3 text-uppercase">Contáctanos</h2>
					<form noValidate onSubmit={handleSubmit}>
						{feedback ? (
							<div className={`alert alert-${feedback.type}`} role="alert">
								{feedback.text}
							</div>
						) : null}
						<Input
							label="Nombre completo"
							name="nombre"
							placeholder="Juan Pérez Soto"
							value={values.nombre}
							onChange={handleInputChange}
							errorText={errors.nombre}
						/>
						<Input
							label="Correo electrónico"
							type="email"
							name="correo"
							placeholder="tucorreo@dominio.com"
							value={values.correo}
							onChange={handleInputChange}
							helperText="Dominios permitidos: @duoc.cl, @profesor.duoc.cl, @gmail.com"
							errorText={errors.correo}
						/>
						<div className="mb-3">
							<label className="form-label" htmlFor="contactComment">
								Comentario
							</label>
							<textarea
								className={`form-control${errors.comentario ? ' is-invalid' : ''}`}
								id="contactComment"
								name="comentario"
								rows={4}
								placeholder="Máximo 500 caracteres"
								value={values.comentario}
								onChange={handleInputChange}
							/>
							{errors.comentario ? (
								<div className="invalid-feedback d-block">{errors.comentario}</div>
							) : null}
						</div>
						<Button type="submit" block variant="strawberry">
							Enviar
						</Button>
					</form>
				</div>
			</div>
		</section>
	)
}

export default Contact
