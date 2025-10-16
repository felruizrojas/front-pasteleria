import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '@/shared/components/common'
import type { Producto } from '@/shared/data/menu_datos'
import { catalogoDatos } from '@/shared/data/menu_datos'

type OrderOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc'

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

const Menu = () => {
	const [selectedCategory, setSelectedCategory] = useState<'all' | number>('all')
	const [selectedProductCode, setSelectedProductCode] = useState<'all' | Producto['codigo_producto']>('all')
	const [minPrice, setMinPrice] = useState('')
	const [maxPrice, setMaxPrice] = useState('')
	const [sortOrder, setSortOrder] = useState<OrderOption>('name-asc')

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

	return (
		<section className="py-4 py-lg-5">
			<div className="container">
				<header className="text-center mb-4 mb-lg-5">
					<h1 className="section-title mb-2">Nuestra Carta</h1>
					<p className="mb-0">
						Explora nuestras categorías y encuentra el postre ideal para celebrar.
					</p>
				</header>

				<div className="menu-toolbar shadow-soft mb-4">
					<div className="row g-3 align-items-end">
						<div className="col-12 col-lg-2">
							<label className="form-label fw-semibold" htmlFor="categoryFilter">
								Categoría
							</label>
							<select
								id="categoryFilter"
								className="form-select"
									value={selectedCategory === 'all' ? 'all' : String(selectedCategory)}
									onChange={(event) => {
										const { value } = event.target
										setSelectedCategory(value === 'all' ? 'all' : Number(value))
										setSelectedProductCode('all')
								}}
							>
								<option value="all">Todas</option>
								{catalogoDatos.categorias.map((categoria) => (
									<option key={categoria.id_categoria} value={categoria.id_categoria}>
										{categoria.nombre_categoria}
									</option>
								))}
							</select>
						</div>
						<div className="col-12 col-lg-2">
							<label className="form-label fw-semibold" htmlFor="productFilter">
								Producto
							</label>
							<select
								id="productFilter"
								className="form-select"
								value={selectedProductCode === 'all' ? 'all' : selectedProductCode}
								onChange={(event) => {
									const { value } = event.target
									setSelectedProductCode(value === 'all' ? 'all' : (value as Producto['codigo_producto']))
								}}
								disabled={productOptions.length === 0}
							>
								<option value="all">Todos</option>
								{productOptions.map((item) => (
									<option key={item.codigo_producto} value={item.codigo_producto}>
										{item.nombre_producto}
									</option>
								))}
							</select>
						</div>
						<div className="col-6 col-lg-2">
							<label className="form-label fw-semibold" htmlFor="priceMin">
								Precio mín.
							</label>
							<input
								type="number"
								min={0}
								id="priceMin"
								className="form-control"
								placeholder="0"
								value={minPrice}
								onChange={(event) => setMinPrice(event.target.value)}
							/>
						</div>
						<div className="col-6 col-lg-2">
							<label className="form-label fw-semibold" htmlFor="priceMax">
								Precio máx.
							</label>
							<input
								type="number"
								min={0}
								id="priceMax"
								className="form-control"
								placeholder="∞"
								value={maxPrice}
								onChange={(event) => setMaxPrice(event.target.value)}
							/>
						</div>
						<div className="col-12 col-lg-2">
							<label className="form-label fw-semibold" htmlFor="orderSelect">
								Ordenar
							</label>
							<select
								id="orderSelect"
								className="form-select"
								value={sortOrder}
								onChange={(event) => setSortOrder(event.target.value as OrderOption)}
							>
								{ORDER_OPTIONS.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
						</div>
						<div className="col-12 col-lg-2 d-flex align-items-end justify-content-center justify-content-lg-start">
							<Button type="button" variant="mint" className="w-100" onClick={resetFilters}>
								Limpiar
							</Button>
						</div>
					</div>
				</div>

				<div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
					<p className="mb-0">
						{totalProductos === 0
							? 'Sin productos visibles.'
							: `${totalProductos} ${totalProductos === 1 ? 'producto disponible' : 'productos disponibles'}`}
					</p>
				</div>

				{totalProductos === 0 ? (
					<div className="menu-empty card-soft text-center py-5">
						<p className="mb-2 fw-semibold">No encontramos productos con los filtros seleccionados.</p>
						<p className="mb-4">
							Ajusta los criterios o vuelve a mostrar toda la carta.
						</p>
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
											<Button type="button" variant="mint" block>
												<i className="bi bi-cart-plus" aria-hidden="true" /> Añadir al carrito
											</Button>
											<Button type="button" variant="mint" block onClick={() => handleShare(item)}>
												<i className="bi bi-share" aria-hidden="true" /> Compartir
											</Button>
										</div>
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

export default Menu
