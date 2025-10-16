import usuariosSeed from '@/data/usuarios.json'
import regionesSeed from '@/data/regiones.json'

import { getLocalData, setLocalData } from './localStorageUtils'

const isBrowser = typeof window !== 'undefined'

export const LOCAL_STORAGE_KEYS = {
	usuarios: 'dataUsuarios',
	regiones: 'dataRegiones',
	comunas: 'dataComunas',
	activeUser: 'usuarioActivo',
	contactMessages: 'contactMessages',
	menuFilters: 'menuFilters',
} as const

type RegionSeed = {
	id: string
	nombre: string
	comunas: string[]
}

type UsuarioSeed = {
	id: string
	run: string
	nombre: string
	apellidos: string
	correo: string
	fechaNacimiento?: string
	tipoUsuario: string
	regionId: string
	regionNombre: string
	comuna: string
	direccion: string
	password: string
}

type ComunaSeed = {
	id: string
	regionId: string
	regionNombre: string
	nombre: string
}

let initialized = false

const buildComunasSeed = (regions: RegionSeed[]): ComunaSeed[] =>
	regions.flatMap((region) =>
		region.comunas.map((nombre) => ({
			id: `${region.id}-${nombre}`,
			regionId: region.id,
			regionNombre: region.nombre,
			nombre,
		})),
	)

export const initLocalData = () => {
	if (!isBrowser || initialized) {
		return
	}

	initialized = true

	try {
		const usuarios = getLocalData<UsuarioSeed>(LOCAL_STORAGE_KEYS.usuarios)
		if (!usuarios.length) {
			setLocalData<UsuarioSeed>(LOCAL_STORAGE_KEYS.usuarios, usuariosSeed as UsuarioSeed[])
		}

		const regiones = getLocalData<RegionSeed>(LOCAL_STORAGE_KEYS.regiones)
		if (!regiones.length) {
			setLocalData<RegionSeed>(LOCAL_STORAGE_KEYS.regiones, regionesSeed as RegionSeed[])
		}

		const comunas = getLocalData<ComunaSeed>(LOCAL_STORAGE_KEYS.comunas)
		if (!comunas.length) {
			const source = (regiones.length ? regiones : (regionesSeed as RegionSeed[]))
			setLocalData<ComunaSeed>(LOCAL_STORAGE_KEYS.comunas, buildComunasSeed(source))
		}
	} catch (error) {
		console.error('No fue posible inicializar los datos locales', error)
	}
}
