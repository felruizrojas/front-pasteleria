import type { FormEvent } from 'react'

import { Button } from '@/components/common'
import menuData from '@/data/menu_datos.json'
type Producto = (typeof menuData)['categorias'][number]['productos'][number]
import type { FilterValues } from '@/utils/validations/filtersValidations'
import type { ValidationErrors } from '@/utils/validations/types'

export type OrderOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc'

type Category = {
	id_categoria: number
	nombre_categoria: string
}


export type MenuFiltersProps = {
	categories: Category[]
	productOptions: Array<Pick<Producto, 'codigo_producto' | 'nombre_producto'>>
	orderOptions: { value: OrderOption; label: string }[]
	selectedCategory: 'all' | number
	selectedProductCode: 'all' | Producto['codigo_producto']
	minPrice: string
	maxPrice: string
	sortOrder: OrderOption
	errors: ValidationErrors<FilterValues>
	onCategoryChange: (value: 'all' | number) => void
	onProductChange: (value: 'all' | Producto['codigo_producto']) => void
	onMinPriceChange: (value: string) => void
	onMaxPriceChange: (value: string) => void
	onSortChange: (value: OrderOption) => void
	onReset: () => void
}

const MenuFilters = ({
	categories,
	productOptions,
	orderOptions,
	selectedCategory,
	selectedProductCode,
	minPrice,
	maxPrice,
	sortOrder,
	errors,
	onCategoryChange,
	onProductChange,
	onMinPriceChange,
	onMaxPriceChange,
	onSortChange,
	onReset,
}: MenuFiltersProps) => {
	const blockNonDigitInput = (event: FormEvent<HTMLInputElement>) => {
		const inputEvent = event.nativeEvent as InputEvent
		const inputType = inputEvent.inputType ?? ''

		if (inputType.startsWith('delete') || inputType === 'insertReplacementText') {
			return
		}

		const insertedValue = inputEvent.data ?? ''

		if (insertedValue.length === 0) {
			return
		}

		if (!/^[0-9]+$/.test(insertedValue)) {
			event.preventDefault()
		}
	}

	return (
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
							onCategoryChange(value === 'all' ? 'all' : Number(value))
						}}
					>
						<option value="all">Todas</option>
						{categories.map((categoria) => (
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
							onProductChange(value === 'all' ? 'all' : (value as Producto['codigo_producto']))
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
						type="text"
						inputMode="numeric"
						pattern="[0-9]*"
						id="priceMin"
						className={`form-control${errors.precioMin ? ' is-invalid' : ''}`}
						placeholder="0"
						value={minPrice}
						onBeforeInput={blockNonDigitInput}
						onChange={(event) => onMinPriceChange(event.target.value)}
					/>
					{errors.precioMin ? <div className="invalid-feedback d-block">{errors.precioMin}</div> : null}
				</div>
				<div className="col-6 col-lg-2">
					<label className="form-label fw-semibold" htmlFor="priceMax">
						Precio máx.
					</label>
					<input
						type="text"
						inputMode="numeric"
						pattern="[0-9]*"
						id="priceMax"
						className={`form-control${errors.precioMax ? ' is-invalid' : ''}`}
						placeholder="∞"
						value={maxPrice}
						onBeforeInput={blockNonDigitInput}
						onChange={(event) => onMaxPriceChange(event.target.value)}
					/>
					{errors.precioMax ? <div className="invalid-feedback d-block">{errors.precioMax}</div> : null}
				</div>
				<div className="col-12 col-lg-2">
					<label className="form-label fw-semibold" htmlFor="orderSelect">
						Ordenar
					</label>
					<select
						id="orderSelect"
						className="form-select"
						value={sortOrder}
						onChange={(event) => onSortChange(event.target.value as OrderOption)}
					>
						{orderOptions.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				</div>
				<div className="col-12 col-lg-2 d-flex align-items-end justify-content-center justify-content-lg-start">
					<Button type="button" variant="mint" className="w-100" onClick={onReset}>
						Limpiar
					</Button>
				</div>
			</div>
		</div>
	)
}

export default MenuFilters
