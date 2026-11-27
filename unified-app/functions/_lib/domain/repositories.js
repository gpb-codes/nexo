/**
 * Contratos de repositorio. La infraestructura los implementa; la aplicación
 * solo depende de estas firmas.
 *
 * @typedef {object} UserRepository
 * @property {(email: string) => Promise<object|null>} findByEmail
 * @property {(data: object) => Promise<object>} create
 * @property {(id: string, patch: object) => Promise<void>} update
 * @property {(tokenHash: string) => Promise<object|null>} findByTokenHash
 *
 * @typedef {object} SessionRepository
 * @property {(env: object, userId: string) => Promise<{token:string, expires:Date}>} create
 * @property {(env: object, tokenHash: string) => Promise<object|null>} find
 * @property {(env: object, tokenHash: string, revokedAt: string) => Promise<void>} revoke
 *
 * @typedef {object} TaskRepository
 * @property {(userId: string) => Promise<object[]>} list
 * @property {(userId: string, data: object) => Promise<object>} create
 * @property {(userId: string, id: string, patch: object) => Promise<boolean>} update
 * @property {(userId: string, id: string) => Promise<boolean>} delete
 *
 * @typedef {object} ProjectRepository
 * @property {(userId: string) => Promise<object[]>} list
 * @property {(userId: string, data: object) => Promise<object>} create
 * @property {(userId: string, id: string, patch: object) => Promise<boolean>} update
 * @property {(userId: string, id: string) => Promise<boolean>} delete
 *
 * @typedef {object} NoteRepository
 * @property {(userId: string) => Promise<object[]>} list
 * @property {(userId: string, id: string) => Promise<object|null>} find
 * @property {(userId: string, data: object) => Promise<object>} create
 * @property {(userId: string, id: string) => Promise<boolean>} delete
 *
 * @typedef {object} PreferencesRepository
 * @property {(userId: string, patch: object) => Promise<object>} update
 * @property {(userId: string) => Promise<object>} get
 */

export {};
