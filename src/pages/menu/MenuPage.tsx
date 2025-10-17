import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/common'
import type { Producto } from '@/data/menu_datos'
import { catalogoDatos } from '@/data/menu_datos'
import MenuFilters, { type OrderOption } from '@/pages/menu/components/MenuFilters'
import { validatePriceFilters } from '@/utils/validations/filtersValidations'
import type { FilterValues } from '@/utils/validations/filtersValidations'
import type { ValidationErrors } from '@/utils/validations/types'

type EnrichedProduct = Producto & {
	categoriaId: number
	categoriaNombre: string
}

const ORDER_OPTIONS: { value: OrderOption; label: string }[] = [
	{ value: 'name-asc', label: 'Nombre: A → Z' },
	{ value: 'name-desc', label: 'Nombre: Z → A' },
	{ value: 'price-asc', label: 'Precio: menor a mayor' },
	{ value: 'price-desc', label: 'Precio: mayor a menor' },
]

const isBrowser = typeof window !== 'undefined'

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

const formatPrice = (value: number) =>
	value.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })

const parsePrice = (value: string) => {
	const trimmedValue = value.trim()
	if (!trimmedValue) {
		return null
	}

	const numericValue = Number(trimmedValue)
	return Number.isNaN(numericValue) ? null : numericValue
}

const sanitizePriceInput = (value: string): string => {
	const digits = value.replace(/[^0-9]/g, '')
	if (!digits) {
		return ''
	}

	const numeric = Number(digits)
	if (Number.isNaN(numeric)) {
		return ''
	}

	return numeric.toString()
}

const KEY_CART = 'carrito'

type FeedbackState = {
	text: string
	tone: 'success' | 'danger' | 'info'
}

type StoredCartItem = {
	codigo: string
	cantidad?: number
	mensaje?: string
	[id: string]: unknown
}

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

const upsertCartItem = (producto: Producto, cantidad: number) => {
	const cart = readJson<StoredCartItem[]>(KEY_CART, [])
	const normalizedCartCode = producto.codigo_producto.toLowerCase()
	const existingIndex = cart.findIndex((item) => item.codigo.toLowerCase() === normalizedCartCode)
	const stockLimit = producto.stock ?? Infinity
	if (existingIndex >= 0) {
		const prev = Number(cart[existingIndex].cantidad ?? 0)
		cart[existingIndex].cantidad = Math.min(prev + cantidad, stockLimit)
	} else {
		cart.push({ codigo: producto.codigo_producto, cantidad: Math.min(cantidad, stockLimit) })
	}
	writeJson(KEY_CART, cart)
}

const MenuPage = () => {
	const [selectedCategory, setSelectedCategory] = useState<'all' | number>('all')
	const [selectedProductCode, setSelectedProductCode] = useState<'all' | Producto['codigo_producto']>('all')
	const [minPrice, setMinPrice] = useState('')
	const [maxPrice, setMaxPrice] = useState('')
	const [sortOrder, setSortOrder] = useState<OrderOption>('name-asc')
	const [filterErrors, setFilterErrors] = useState<ValidationErrors<FilterValues>>({})

	const collator = useMemo(() => new Intl.Collator('es', { sensitivity: 'base' }), [])

	const allProducts = useMemo<EnrichedProduct[]>(
		() =>
			catalogoDatos.categorias.flatMap((categoria) =>
				categoria.productos.map((producto) => ({
					...producto,
					categoriaId: categoria.id_categoria,
					categoriaNombre: categoria.nombre_categoria,
				})),
			),
		[],
	)

	const productOptions = useMemo(() => {
		const scoped =
			selectedCategory === 'all'
				? allProducts
				: allProducts.filter((item) => item.categoriaId === selectedCategory)
		const unique = new Map<string, EnrichedProduct>()
		scoped.forEach((item) => {
			if (!unique.has(item.codigo_producto)) {
				unique.set(item.codigo_producto, item)
			}
		})
		return Array.from(unique.values()).sort((a, b) => collator.compare(a.nombre_producto, b.nombre_producto))
	}, [allProducts, selectedCategory, collator])

	const filteredProducts = useMemo(() => {
		const minValue = parsePrice(minPrice)
		const maxValue = parsePrice(maxPrice)

		let items = allProducts
		if (selectedCategory !== 'all') {
			items = items.filter((item) => item.categoriaId === selectedCategory)
		}
		if (selectedProductCode !== 'all') {
			items = items.filter((item) => item.codigo_producto === selectedProductCode)
		}
		if (minValue !== null) {
			items = items.filter((item) => item.precio_producto >= minValue)
		}
		if (maxValue !== null) {
			items = items.filter((item) => item.precio_producto <= maxValue)
		}

		const sorted = [...items]
		switch (sortOrder) {
			case 'name-desc':
				sorted.sort((a, b) => collator.compare(b.nombre_producto, a.nombre_producto))
				break
			case 'price-asc':
				sorted.sort((a, b) => a.precio_producto - b.precio_producto)
				break
			case 'price-desc':
				sorted.sort((a, b) => b.precio_producto - a.precio_producto)
				break
			case 'name-asc':
			default:
				sorted.sort((a, b) => collator.compare(a.nombre_producto, b.nombre_producto))
		}

		return sorted
	}, [allProducts, selectedCategory, selectedProductCode, minPrice, maxPrice, sortOrder, collator])

	const totalProductos = filteredProducts.length

	const resetFilters = () => {
		setSelectedCategory('all')
		setSelectedProductCode('all')
		setMinPrice('')
		setMaxPrice('')
		setSortOrder('name-asc')
		setFilterErrors({})
	}

	const handleCategoryChange = (value: 'all' | number) => {
		setSelectedCategory(value)
		setSelectedProductCode('all')
	}

	const handleMinPriceChange = (value: string) => {
		const sanitized = sanitizePriceInput(value)
		let nextMax = maxPrice
		const minNumeric = sanitized ? Number(sanitized) : null
		const maxNumeric = maxPrice ? Number(maxPrice) : null

		if (minNumeric !== null && maxNumeric !== null && minNumeric > maxNumeric) {
			nextMax = sanitized
			setMaxPrice(nextMax)
		}

		setMinPrice(sanitized)
		const validation = validatePriceFilters({ precioMin: sanitized, precioMax: nextMax })
		setFilterErrors(validation.errors)
	}

	const handleMaxPriceChange = (value: string) => {
		const sanitized = sanitizePriceInput(value)
		let nextMax = sanitized
		const minNumeric = minPrice ? Number(minPrice) : null
		const maxNumeric = sanitized ? Number(sanitized) : null

		if (minNumeric !== null && maxNumeric !== null && maxNumeric < minNumeric) {
			nextMax = minPrice
		}

		setMaxPrice(nextMax)
		const validation = validatePriceFilters({ precioMin: minPrice, precioMax: nextMax })
		setFilterErrors(validation.errors)
	}

	const handleShare = async (item: EnrichedProduct) => {
		if (!isBrowser) return
		const url = `${window.location.origin}/menu/${item.codigo_producto}`
		const shareData = {
			title: item.nombre_producto,
			text: `Descubre ${item.nombre_producto} de Pastelería Mil Sabores`,
			url,
		}
		try {
			if (navigator.share) {
				await navigator.share(shareData)
				return
			}
			if (navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(url)
				window.alert('Enlace copiado al portapapeles')
			}
		} catch {
			window.alert('No fue posible compartir el producto. Intenta nuevamente más tarde.')
		}
	}

	// NOTE: using per-card feedback only; keep `globalFeedback` for potential future uses

	// Per-card feedback state and timeouts so messages appear inside each product card
	const [cardFeedbacks, setCardFeedbacks] = useState<Record<string, FeedbackState | null>>({})
	const cardFeedbackTimeouts = useRef<Record<string, number | null>>({})

	const scheduleCardFeedback = (code: string, next: FeedbackState) => {
		const key = String(code)
		setCardFeedbacks((prev) => ({ ...prev, [key]: next }))
		if (cardFeedbackTimeouts.current[key]) {
			window.clearTimeout(cardFeedbackTimeouts.current[key] as number)
		}
		cardFeedbackTimeouts.current[key] = window.setTimeout(() => {
			setCardFeedbacks((prev) => ({ ...prev, [key]: null }))
			cardFeedbackTimeouts.current[key] = null
		}, 3500)
	}

	const handleAddToCart = (item: EnrichedProduct) => {
		const cart = readJson<StoredCartItem[]>(KEY_CART, [])
		const normalized = item.codigo_producto.toLowerCase()
		const totalForCode = cart
			.filter((it) => it.codigo?.toLowerCase() === normalized)
			.reduce((acc, it) => acc + Number(it.cantidad ?? 0), 0)
		const availableStock = item.stock ?? 0
		if (totalForCode >= availableStock) {
			scheduleCardFeedback(item.codigo_producto, {
				text: `Sin stock suficiente. Máximo ${availableStock} ${availableStock === 1 ? 'unidad disponible' : 'unidades disponibles'}.`,
				tone: 'danger',
			})
			return
		}
		// Añadir 1 unidad (desde lista no hay mensaje)
		upsertCartItem(item, 1)
		scheduleCardFeedback(item.codigo_producto, {
			text: 'Producto agregado al carrito',
			tone: 'success',
		})
	}

	useEffect(() => () => {
		// clear any per-card timeouts
		Object.values(cardFeedbackTimeouts.current).forEach((id) => {
			if (id) window.clearTimeout(id)
		})
	}, [])

	return (
		<section className="py-4 py-lg-5">
			<div className="container">
				<header className="text-center mb-4 mb-lg-5">
					<h1 className="section-title mb-2">Nuestra Carta</h1>
					<p className="mb-0">Explora nuestras categorías y encuentra el postre ideal para celebrar.</p>
				</header>

				<MenuFilters
					categories={catalogoDatos.categorias}
					productOptions={productOptions}
					orderOptions={ORDER_OPTIONS}
					selectedCategory={selectedCategory}
					selectedProductCode={selectedProductCode}
					minPrice={minPrice}
					maxPrice={maxPrice}
					sortOrder={sortOrder}
					errors={filterErrors}
					onCategoryChange={handleCategoryChange}
					onProductChange={setSelectedProductCode}
					onMinPriceChange={handleMinPriceChange}
					onMaxPriceChange={handleMaxPriceChange}
					onSortChange={setSortOrder}
					onReset={resetFilters}
				/>

				<div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
					<p className="mb-0">
						{totalProductos === 0
							? 'Sin productos visibles.'
							: `${totalProductos} ${totalProductos === 1 ? 'producto disponible' : 'productos disponibles'}`}
					</p>
					{/* Removed global feedback UI */}
				</div>

				{totalProductos === 0 ? (
					<div className="menu-empty card-soft text-center py-5">
						<p className="mb-2 fw-semibold">No encontramos productos con los filtros seleccionados.</p>
						<p className="mb-4">Ajusta los criterios o vuelve a mostrar toda la carta.</p>
						<Button type="button" variant="mint" onClick={resetFilters}>
							Ver carta completa
						</Button>
					</div>
				) : (
					<div className="row g-4">
						{filteredProducts.map((item) => (
							<div className="col-12 col-md-6 col-lg-4" key={item.codigo_producto}>
								<div className="card card-soft shadow-soft h-100 product-card">
									<Link to={`/menu/${item.codigo_producto}`} className="ratio ratio-4x3">
										<img
											src={formatImagePath(item.imagen_producto)}
											alt={item.nombre_producto}
											className="w-100 h-100 object-fit-cover"
											loading="lazy"
										/>
									</Link>
									<div className="card-body d-flex flex-column gap-2 text-center">
										<p className="text-uppercase small text-muted mb-1">{item.categoriaNombre}</p>
										<h3 className="h5 mb-0">{item.nombre_producto}</h3>
										<p className="fw-semibold mb-0">{formatPrice(item.precio_producto)}</p>
										<p className="mb-3 text-muted flex-grow-1">{item.descripción_producto}</p>
										<div className="d-grid gap-2">
											<Button as="link" to={`/menu/${item.codigo_producto}`} variant="strawberry" block>
												Ver detalle y personalizar
											</Button>
											<Button type="button" variant="mint" block onClick={() => handleAddToCart(item)}>
												<i className="bi bi-cart-plus" aria-hidden="true" /> Añadir al carrito
											</Button>
											<Button type="button" variant="mint" block onClick={() => handleShare(item)}>
												<i className="bi bi-share" aria-hidden="true" /> Compartir
											</Button>
										</div>
										{/* no per-card feedback — global feedback is shown above the grid */}
										{/* per-card feedback shown below "Compartir" */}
										{cardFeedbacks[item.codigo_producto] ? (
											<div
												className={`small ${cardFeedbacks[item.codigo_producto]?.tone === 'danger' ? 'text-danger' : cardFeedbacks[item.codigo_producto]?.tone === 'success' ? 'text-success' : ''}`}
												role="status"
												aria-live="polite"
											>
												{cardFeedbacks[item.codigo_producto]?.text}
											</div>
										) : null}
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</section>
	)
}

export default MenuPage
