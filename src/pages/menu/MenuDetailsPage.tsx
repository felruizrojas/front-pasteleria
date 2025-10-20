import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { Link, useParams } from 'react-router-dom'

import { Breadcrumbs, Button } from '@/components/common'
import type { BreadcrumbItem } from '@/components/common'
import menuData from '@/data/menu_datos.json'
type Producto = (typeof menuData)['categorias'][number]['productos'][number]
const catalogoDatos = menuData
import cx from '@/utils/cx'

const KEY_CART = 'carrito'
const KEY_MSGS = 'mensajesCarrito'
const MAX_MESSAGE_LENGTH = 25

type StoredCartItem = {
	codigo: string
	nombre?: string
	precio?: number
	imagen?: string
	cantidad: number
	mensaje?: string
	[id: string]: unknown
}

type FeedbackState = {
	text: string
	tone: 'success' | 'danger' | 'info'
}

const catalogImages = import.meta.glob('@/assets/images/catalog/**/*', {
	import: 'default',
	eager: true,
}) as Record<string, string>

const catalogImageMap = Object.entries(catalogImages).reduce<Record<string, string>>((accumulator, [path, src]) => {
	const key = path.split('/').pop()
	if (key) {
		accumulator[key] = src
	}
	return accumulator
}, {})

const formatImagePath = (relativePath: string) => {
	const fileName = relativePath.split('/').pop()
	if (fileName && catalogImageMap[fileName]) {
		return catalogImageMap[fileName]
	}
	const normalized = relativePath.replace(/^img\//, 'images/').replace('catalogo', 'catalog')
	return new URL(`@/assets/${normalized}`, import.meta.url).href
}

const detailImages = import.meta.glob('@/assets/images/catalog_detail/**/*', {
	import: 'default',
	eager: true,
}) as Record<string, string>

const detailImageMap = Object.entries(detailImages).reduce<Record<string, string[]>>((accumulator, [path, src]) => {
	const fileName = path.split('/').pop()
	if (!fileName) return accumulator
	const base = fileName.replace(/\.[^/.]+$/, '')
	const slug = base.replace(/_\d.*$/, '')
	if (!accumulator[slug]) {
		accumulator[slug] = []
	}
	accumulator[slug].push(src)
	return accumulator
}, {})

const toSlug = (value: string) =>
	value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '_')
		.replace(/^_+|_+$/g, '')

const formatPrice = (value: number) =>
	value.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })

const isBrowser = typeof window !== 'undefined'

const readJson = <T,>(key: string, fallback: T): T => {
	if (!isBrowser) return fallback
	try {
		const raw = window.localStorage.getItem(key)
		return raw ? (JSON.parse(raw) as T) : fallback
	} catch {
		return fallback
	}
}

const writeJson = (key: string, value: unknown) => {
	if (!isBrowser) return
	try {
		window.localStorage.setItem(key, JSON.stringify(value))
	} catch {
		// noop
	}
}

const upsertCartItem = (producto: Producto, cantidad: number, mensaje: string) => {
	const cart = readJson<StoredCartItem[]>(KEY_CART, [] as StoredCartItem[])
	const normalizedCartCode = producto.codigo_producto.toLowerCase()
	const cleanMsg = (mensaje ?? '').trim()
	const stockLimit = producto.stock ?? Infinity

	// Suma total actualmente almacenada para este codigo (todas las variantes de mensaje)
	const totalForCode = cart
		.filter((it) => typeof it === 'object' && it.codigo?.toLowerCase() === normalizedCartCode)
		.reduce((acc, it) => acc + Number(it.cantidad ?? 0), 0)

	// Buscar entrada exactamente igual (codigo + mensaje)
	const existingIndex = cart.findIndex(
		(it) => it.codigo?.toLowerCase() === normalizedCartCode && ((it.mensaje ?? '').trim() === cleanMsg),
	)

	if (existingIndex >= 0) {
		const existing = { ...cart[existingIndex] }
		const prev = Number(existing.cantidad ?? 0)
		// Cuánto queda disponible sin contar la cantidad previa de esta misma entrada
		const remaining = Math.max(0, stockLimit - (totalForCode - prev))
		const addable = Math.min(cantidad, remaining)
		existing.cantidad = prev + addable
		if (cleanMsg) existing.mensaje = cleanMsg
		else delete existing.mensaje
		cart[existingIndex] = existing
	} else {
		const remaining = Math.max(0, stockLimit - totalForCode)
		const toAdd = Math.min(cantidad, remaining)
		if (toAdd <= 0) {
			// nothing to add
			writeJson(KEY_CART, cart)
			return
		}
		const baseItem: StoredCartItem = {
			codigo: producto.codigo_producto,
			nombre: producto.nombre_producto,
			precio: producto.precio_producto,
			imagen: producto.imagen_producto,
			cantidad: toAdd,
		}
		if (cleanMsg) baseItem.mensaje = cleanMsg
		cart.push(baseItem)
	}

	writeJson(KEY_CART, cart)
}

const getAllProducts = () => catalogoDatos.categorias.flatMap((categoria) => categoria.productos)

const useRecommendedProducts = (productos: Producto[], currentProducto?: Producto) =>
	useMemo(() => {
		const pool = productos.filter((producto) => producto.codigo_producto !== currentProducto?.codigo_producto)
		if (!pool.length) return []
		const shuffled = [...pool].sort(() => Math.random() - 0.5)
		return shuffled.slice(0, Math.min(3, shuffled.length))
	}, [productos, currentProducto])

const MenuDetailsPage = () => {
	const { productCode } = useParams<{ productCode: string }>()
	const normalizedCode = productCode?.toUpperCase() ?? ''

	const allProducts = useMemo(getAllProducts, [])
	const producto = useMemo(
		() => allProducts.find((item) => item.codigo_producto.toUpperCase() === normalizedCode),
		[allProducts, normalizedCode],
	)

	const categoria = useMemo(
		() =>
			catalogoDatos.categorias.find((cat) =>
				cat.productos.some((item) => item.codigo_producto === producto?.codigo_producto),
			),
		[producto],
	)

	const recommended = useRecommendedProducts(allProducts, producto)

	const breadcrumbItems = useMemo(() => {
		const base: BreadcrumbItem[] = [
			{ label: 'Inicio', to: '/' },
			{ label: 'Nuestra carta', to: '/menu' },
		]

		if (!producto) {
			return base
		}

		if (categoria) {
			base.push({ label: categoria.nombre_categoria, to: `/menu?categoria=${categoria.id_categoria}` })
		}

		base.push({ label: producto.nombre_producto })

		return base
	}, [categoria, producto])

	const maxQuantity = producto?.stock ?? 1

	const clampQuantity = useCallback(
		(value: number) => {
			if (Number.isNaN(value) || value <= 0) {
				return 0
			}
			return Math.min(Math.floor(value), maxQuantity)
		},
		[maxQuantity],
	)

	const handleQuantityInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		const rawValue = event.target.value
		// Permitir campo vacío mientras el usuario escribe
		if (rawValue === '') {
			setQuantity('')
			return
		}
		const parsed = Number(rawValue)
		if (Number.isNaN(parsed)) return
		// Limitar el máximo al stock definido en data
		if (parsed > maxQuantity && maxQuantity > 0) {
			setQuantity(maxQuantity)
			scheduleFeedback({
				text: `Sin stock suficiente. Máximo ${maxQuantity} ${maxQuantity === 1 ? 'unidad disponible' : 'unidades disponibles'}.`,
				tone: 'danger',
			})
			return
		}
		setQuantity(parsed)
	}

	const handleQuantityBlur = () => {
		// Corregir y normalizar al perder el foco
		const parsed = Number(quantity)
		if (Number.isNaN(parsed) || parsed < 1) {
			// restablecer a 1 si no hay entrada válida
			setQuantity('')
			return
		}
		setQuantity(clampQuantity(parsed))
	}

	const galleryImages = useMemo(() => {
		if (!producto) return []
		const slug = toSlug(producto.nombre_producto)
		const detailList = [...(detailImageMap[slug] ?? [])].sort()
		const main = formatImagePath(producto.imagen_producto)
		const unique = new Set<string>([main, ...detailList])
		return Array.from(unique)
	}, [producto])

	const [mensaje, setMensaje] = useState('')
	// Mostrar el campo vacío por defecto; permitimos number | string para manejar el input vacío ('')
	const [quantity, setQuantity] = useState<number | string>('')
	const [feedback, setFeedback] = useState<FeedbackState | null>(null)
	const [selectedImage, setSelectedImage] = useState<string | null>(null)
	const feedbackTimeout = useRef<number | null>(null)

	const scheduleFeedback = useCallback((next: FeedbackState) => {
		setFeedback(next)
		if (feedbackTimeout.current) {
			window.clearTimeout(feedbackTimeout.current)
		}
		feedbackTimeout.current = window.setTimeout(() => setFeedback(null), 3500)
	}, [])

	useEffect(() => {
		if (!producto) return

		const storedItems = readJson<StoredCartItem[]>(KEY_CART, [] as StoredCartItem[])
		const current = storedItems.find((item) => item.codigo?.toLowerCase() === producto.codigo_producto.toLowerCase())
		if (current?.cantidad) {
			setQuantity(clampQuantity(current.cantidad))
			return
		}

		// Por defecto dejamos el campo vacío
		setQuantity('')
	}, [producto, clampQuantity])

	useEffect(() => {
		if (!producto) return
		const drafts = readJson<Record<string, string>>(KEY_MSGS, {})
		setMensaje(drafts[producto.codigo_producto] ?? '')
	}, [producto])

	useEffect(() => {
		if (!producto) {
			setSelectedImage(null)
			return
		}
		if (!galleryImages.length) {
			setSelectedImage(formatImagePath(producto.imagen_producto))
			return
		}
		setSelectedImage((current) => (current && galleryImages.includes(current) ? current : galleryImages[0]))
	}, [galleryImages, producto])

	const persistMessage = (codigo: string, value: string) => {
		const drafts = readJson<Record<string, string>>(KEY_MSGS, {})
		if (value) {
			drafts[codigo] = value
		} else {
			delete drafts[codigo]
		}
		writeJson(KEY_MSGS, drafts)
	}

	const handleMessageChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
		if (!producto) return
		const value = event.target.value.slice(0, MAX_MESSAGE_LENGTH)
		setMensaje(value)
		persistMessage(producto.codigo_producto, value)
	}

	const handleAddToCart = () => {
		if (!producto) return

		const availableUnits = producto.stock ?? 0
		const parsedQty = Number(quantity)
		const safeQuantity = clampQuantity(Number.isNaN(parsedQty) ? 0 : parsedQty)

		if (availableUnits <= 0 || safeQuantity <= 0) {
			scheduleFeedback({
				text: 'Sin stock disponible para este producto en este momento.',
				tone: 'danger',
			})
			// limpiar cantidad en la UI cuando no se puede agregar
			setQuantity('')
			return
		}

		if (safeQuantity < parsedQty) {
			setQuantity(safeQuantity)
			scheduleFeedback({
				text: `Sin stock suficiente. Máximo ${availableUnits} ${availableUnits === 1 ? 'unidad disponible' : 'unidades disponibles'}.`,
				tone: 'danger',
			})
			// dejar el campo vacío para que el usuario reingrese
			setQuantity('')
			return
		}

		if (safeQuantity !== parsedQty) {
			setQuantity(safeQuantity)
		}
		// Verificar cantidad ya almacenada en localStorage antes de agregar (sumando todas las entradas con mismo código)
		const storedItems = readJson<StoredCartItem[]>(KEY_CART, [] as StoredCartItem[])
		const normalized = producto.codigo_producto.toLowerCase()
		const totalForCode = storedItems
			.filter((it) => it.codigo?.toLowerCase() === normalized)
			.reduce((acc, it) => acc + Number(it.cantidad ?? 0), 0)
		if (totalForCode + safeQuantity > availableUnits) {
			scheduleFeedback({
				text: `Sin stock suficiente. Ya tienes ${totalForCode} en el carrito. Máximo ${availableUnits} ${availableUnits === 1 ? 'unidad disponible' : 'unidades disponibles'}.`,
				tone: 'danger',
			})
			// limpiar campo para que el usuario vea que debe reingresar
			setQuantity('')
			return
		}
		const trimmed = mensaje.trim()
		persistMessage(producto.codigo_producto, trimmed)
		upsertCartItem(producto, safeQuantity, trimmed)
		const quantityLabel = safeQuantity === 1 ? '1 unidad' : `${safeQuantity} unidades`
		const messageFeedback = trimmed
			? 'Mensaje personalizado guardado. Puedes revisarlo en tu carrito.'
			: 'Mensaje eliminado para este producto.'
		scheduleFeedback({
			text: `Cantidad seleccionada: ${quantityLabel}. ${messageFeedback}`,
			tone: 'success',
		})
		// Limpiar campos en pantalla tras agregar: mensaje y dejar cantidad vacía
		setMensaje('')
		persistMessage(producto.codigo_producto, '')
		setQuantity('')
	}

	useEffect(() => () => {
		if (feedbackTimeout.current) {
			window.clearTimeout(feedbackTimeout.current)
		}
	}, [])

	if (!producto) {
		return (
			<section className="container py-5">
				<div className="card card-soft shadow-soft p-5 text-center">
					<h1 className="section-title mb-3">Producto no encontrado</h1>
					<p className="mb-4">Es posible que el código ingresado no exista o que el producto haya sido actualizado.</p>
					<Button as="link" to="/menu" variant="mint">
						Volver a la carta
					</Button>
				</div>
			</section>
		)
	}

	return (
		<section className="container py-4 py-lg-5">
			<Breadcrumbs items={breadcrumbItems} className="mb-4" />

			<div className="row g-4">
				<div className="col-lg-7">
					<div className="card card-soft shadow-soft h-100 d-flex">
						<div className="card-body p-3 d-flex flex-column flex-lg-row gap-3 h-100">
							<div className="flex-grow-1 d-flex align-items-center justify-content-center">
								<div className="ratio ratio-4x3 w-100">
									<img
										src={selectedImage ?? formatImagePath(producto.imagen_producto)}
										alt={producto.nombre_producto}
										className="w-100 h-100 object-fit-cover rounded"
									/>
								</div>
							</div>
							{galleryImages.length > 1 ? (
								<div className="menu-gallery__thumbs menu-gallery__thumbs--vertical" role="list">
									{galleryImages.map((imageSrc) => {
										const isActive = imageSrc === selectedImage
										return (
											<button
												type="button"
												key={imageSrc}
												className={cx('menu-gallery__thumb', { active: isActive })}
												onClick={() => setSelectedImage(imageSrc)}
												aria-pressed={isActive}
												role="listitem"
												aria-label={isActive ? 'Imagen seleccionada' : 'Ver esta imagen'}
											>
												<img
													src={imageSrc}
													alt={`${producto.nombre_producto} vista adicional`}
													className="object-fit-cover"
													loading="lazy"
												/>
											</button>
										)
									})}
								</div>
							) : null}
						</div>
					</div>
				</div>

				<div className="col-lg-5">
					<div className="card card-soft card-soft--compact shadow-soft h-100">
						<div className="card-body d-flex flex-column gap-1">
							<div>
								<h1 className="h3 mb-1">{producto.nombre_producto}</h1>
								<div className="small mb-1">
									<span className="me-2">Código:</span>
									<code>{producto.codigo_producto}</code>
								</div>
								<p className="h4 mb-2">{formatPrice(producto.precio_producto)}</p>
							</div>
							<p className="mb-2">{producto.descripción_producto}</p>
							<hr className="my-2" />
							<div>
								<label className="form-label" htmlFor="customMessage">
									Mensaje personalizado (opcional)
								</label>
								<textarea
									id="customMessage"
									className="form-control"
									rows={2}
									maxLength={MAX_MESSAGE_LENGTH}
									placeholder="¡Feliz cumpleaños, Marta!"
									value={mensaje}
									onChange={handleMessageChange}
								/>
								<div className="form-text text-end mt-0">
									{mensaje.length}/{MAX_MESSAGE_LENGTH} caracteres
								</div>
							</div>
							<div className="mt-1">
								<div className="row g-3 align-items-end">
									<div className="col-12 col-sm-6">
										<label className="form-label" htmlFor="productQuantity">
											Cantidad
										</label>
										<input
											type="number"
											id="productQuantity"
											className="form-control"
											min={1}
											max={maxQuantity}
											value={quantity}
											onChange={handleQuantityInputChange}
											onBlur={handleQuantityBlur}
										/>
									</div>
									<div className="col-12 col-sm-6 d-grid">
										<Button type="button" size="lg" variant="mint" onClick={handleAddToCart} block>
											Añadir al carrito
										</Button>
									</div>
								</div>
								<div className="form-text text-end text-sm-start mt-1">
									Máximo {maxQuantity} {maxQuantity === 1 ? 'unidad disponible' : 'unidades disponibles'}
								</div>
							</div>
						{feedback ? (
							<div
								className={cx('small mt-1', {
									'text-success': feedback.tone === 'success',
									'text-danger': feedback.tone === 'danger',
								})}
								role="status"
								aria-live="polite"
							>
								{feedback.text}
							</div>
						) : null}
						<hr className="my-2" />
							<ul className="list-unstyled small mb-0">
								<li>
									<i className="bi bi-check2-circle me-2" aria-hidden="true" />Decoración personalizable
								</li>
								<li>
									<i className="bi bi-truck me-2" aria-hidden="true" />Envíos en Concepción y alrededores
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>

			<section className="mt-5">
				<h2 className="h5 mb-3">Productos recomendados</h2>
				{recommended.length === 0 ? (
					<p className="mb-0">Pronto añadiremos más recomendaciones.</p>
				) : (
					<div className="row row-cols-1 row-cols-md-3 g-3">
						{recommended.map((item) => (
							<div className="col" key={item.codigo_producto}>
								<div className="card card-soft h-100 shadow-soft product-card">
									<Link to={`/menu/${item.codigo_producto}`} className="ratio ratio-4x3">
										<img
											src={formatImagePath(item.imagen_producto)}
											alt={item.nombre_producto}
											className="rounded-top w-100 h-100 object-fit-cover"
											loading="lazy"
										/>
									</Link>
									<div className="card-body d-flex flex-column gap-2">
										<h3 className="h6 mb-0">{item.nombre_producto}</h3>
										<p className="mb-0">{formatPrice(item.precio_producto)}</p>
										<Button as="link" to={`/menu/${item.codigo_producto}`} size="sm" variant="strawberry">
											Ver detalle
										</Button>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</section>
		</section>
	)
}

export default MenuDetailsPage
