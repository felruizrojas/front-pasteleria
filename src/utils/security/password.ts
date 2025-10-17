import SHA256 from 'crypto-js/sha256'
import Hex from 'crypto-js/enc-hex'

const HASHED_PASSWORD_REGEX = /^[a-f0-9]{64}$/i

export const hashPassword = (value: string) => {
	const normalized = value.trim()
	if (!normalized) {
		return ''
	}
	return SHA256(normalized).toString(Hex)
}

export const ensureHashedPassword = (value: string) => {
	const normalized = value.trim()
	if (!normalized) {
		return ''
	}
	return HASHED_PASSWORD_REGEX.test(normalized) ? normalized.toLowerCase() : hashPassword(normalized)
}

export const passwordsMatch = (plain: string, hashed: string) => {
	if (!hashed) {
		return false
	}
	return hashPassword(plain) === hashed
}
