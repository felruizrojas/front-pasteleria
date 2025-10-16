import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { Link, useParams } from 'react-router-dom'

import { Button } from '@/shared/components/common'
import type { Producto } from '@/shared/data/menu_datos'
import { catalogoDatos } from '@/shared/data/menu_datos'
import cx from '@/shared/utils/cx'

const KEY_CART = 'carrito'
const KEY_MSGS = 'mensajesCarrito'
const MAX_MESSAGE_LENGTH = 25

const catalogImages = import.meta.glob('../../assets/images/catalog/**/*', {
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
	return new URL(`../../assets/${normalized}`, import.meta.url).href
}

const detailImages = import.meta.glob('../../assets/images/catalog_detail/**/*', {
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

const updateCartMessages = (codigo: string, mensaje: string) => {
	const cart = readJson<unknown[]>(KEY_CART, [])
	if (!cart.length) return
	const normalizedCartCode = codigo.toLowerCase()

	const matches = (item: Record<string, unknown>) => {
		const ids = ['codigo', 'id', 'sku'].map((key) => item[key])
		return ids
			.filter((value): value is string => typeof value === 'string')
			.some((value) => value.toLowerCase() === normalizedCartCode)
	}

	const updated = cart.map((item) => {
		if (typeof item !== 'object' || item === null) return item
		const product = item as Record<string, unknown>
		if (!matches(product)) return item
		const nextItem = { ...product }
		if (mensaje) {
			nextItem.mensaje = mensaje
			nextItem.msg = mensaje
		} else {
			delete nextItem.mensaje
			delete nextItem.msg
		}
		return nextItem
	})

	writeJson(KEY_CART, updated)
}

const getAllProducts = () => catalogoDatos.categorias.flatMap((categoria) => categoria.productos)

const useRecommendedProducts = (productos: Producto[], currentProducto?: Producto) =>
	useMemo(() => {
		const pool = productos.filter((producto) => producto.codigo_producto !== currentProducto?.codigo_producto)
		if (!pool.length) return []
		const shuffled = [...pool].sort(() => Math.random() - 0.5)
		return shuffled.slice(0, Math.min(3, shuffled.length))
	}, [productos, currentProducto])

const MenuDetails = () => {
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

	const galleryImages = useMemo(() => {
		if (!producto) return []
		const slug = toSlug(producto.nombre_producto)
		const detailList = [...(detailImageMap[slug] ?? [])].sort()
		const main = formatImagePath(producto.imagen_producto)
		const unique = new Set<string>([main, ...detailList])
		return Array.from(unique)
	}, [producto])

	const [mensaje, setMensaje] = useState('')
	const [feedback, setFeedback] = useState<string | null>(null)
	const [selectedImage, setSelectedImage] = useState<string | null>(null)
	const feedbackTimeout = useRef<number | null>(null)

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
		const trimmed = mensaje.trim()
		persistMessage(producto.codigo_producto, trimmed)
		updateCartMessages(producto.codigo_producto, trimmed)
		setFeedback(trimmed ? 'Mensaje personalizado guardado. Puedes revisarlo en tu carrito.' : 'Mensaje eliminado para este producto.')
		if (feedbackTimeout.current) {
			window.clearTimeout(feedbackTimeout.current)
		}
		feedbackTimeout.current = window.setTimeout(() => setFeedback(null), 3500)
	}

	useEffect(() => {
		return () => {
			if (feedbackTimeout.current) {
				window.clearTimeout(feedbackTimeout.current)
			}
		}
	}, [])

	if (!producto) {
		return (
			<section className="container py-5">
				<div className="card card-soft shadow-soft p-5 text-center">
					<h1 className="section-title mb-3">Producto no encontrado</h1>
					<p className="mb-4">
						Es posible que el código ingresado no exista o que el producto haya sido actualizado.
					</p>
					<Button as="link" to="/menu">
						Volver a la carta
					</Button>
				</div>
			</section>
		)
	}

	return (
		<section className="container py-4 py-lg-5">
			<nav aria-label="breadcrumb" className="mb-4">
				<ol className="breadcrumb small mb-0">
					<li className="breadcrumb-item">
						<Link to="/">Inicio</Link>
					</li>
					<li className="breadcrumb-item">
						<Link to="/menu">Carta</Link>
					</li>
					<li className={cx('breadcrumb-item', { active: !categoria })} aria-current={categoria ? undefined : 'page'}>
						{categoria ? categoria.nombre_categoria : producto.nombre_producto}
					</li>
					{categoria ? (
						<li className="breadcrumb-item active" aria-current="page">
							{producto.nombre_producto}
						</li>
					) : null}
				</ol>
			</nav>

			<div className="row g-4">
				<div className="col-lg-7">
					<div className="card card-soft shadow-soft h-100">
						<div className="card-body p-3 p-md-4">
							<div className="ratio ratio-4x3 mb-3">
								<img
									src={selectedImage ?? formatImagePath(producto.imagen_producto)}
									alt={producto.nombre_producto}
									className="w-100 h-100 object-fit-cover rounded"
								/>
							</div>
							{galleryImages.length > 1 ? (
								<div className="menu-gallery__thumbs" role="list">
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
					<div className="card card-soft shadow-soft h-100">
						<div className="card-body d-flex flex-column gap-3">
							<div>
								<h1 className="h3 mb-1">{producto.nombre_producto}</h1>
								<div className="small mb-2">
									<span className="me-2">Código:</span>
									<code>{producto.codigo_producto}</code>
								</div>
								<p className="h4 mb-3">{formatPrice(producto.precio_producto)}</p>
							</div>
							<p>{producto.descripción_producto}</p>
							<hr />
							<div>
								<label className="form-label" htmlFor="customMessage">
									Mensaje personalizado (opcional)
								</label>
								<textarea
									id="customMessage"
									className="form-control"
									rows={3}
									maxLength={MAX_MESSAGE_LENGTH}
									placeholder="Feliz cumpleaños, Marta!"
									value={mensaje}
									onChange={handleMessageChange}
								/>
								<div className="form-text text-end">
									{mensaje.length}/{MAX_MESSAGE_LENGTH} caracteres
								</div>
							</div>
							<Button type="button" size="lg" onClick={handleAddToCart}>
								Añadir al carrito
							</Button>
							{feedback ? (
								<div className="small" role="status" aria-live="polite">
									{feedback}
								</div>
							) : null}
							<hr />
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
								<div className="card card-soft h-100 shadow-soft">
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
										<Button as="link" to={`/menu/${item.codigo_producto}`} size="sm">
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

export default MenuDetails
