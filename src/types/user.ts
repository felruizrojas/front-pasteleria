export type UserRoleName = 'SuperAdmin' | 'Administrador' | 'Vendedor' | 'Cliente'

export type StoredUser = {
	id: string
	run: string
	nombre: string
	apellidos: string
	correo: string
	fechaNacimiento?: string
	tipoUsuario: UserRoleName
	regionId: string
	regionNombre: string
	comuna: string
	direccion: string
	password: string
	avatarUrl?: string
	createdAt?: string
	updatedAt?: string
}
