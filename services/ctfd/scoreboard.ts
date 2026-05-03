import { getAdminHeaders, getUserHeaders } from './core'
import type { CTFdResponse } from './types'

const BASE = process.env.CTFD_BASE_URL!

export type CTFdScoreboardEntry = {
	pos: number
	account_id: number
	account_url?: string
	account_type?: string
	name: string
	score: number
	members?: Array<{ id: number; name: string; score?: number | null }>
}

async function safeJson<T>(res: Response): Promise<T | null> {
	try {
		return (await res.json()) as T
	} catch {
		return null
	}
}

function extractScoreboardArray(payload: unknown): CTFdScoreboardEntry[] | null {
	if (Array.isArray(payload)) return payload as CTFdScoreboardEntry[]

	if (payload && typeof payload === 'object') {
		const p: any = payload
		if (Array.isArray(p.data)) return p.data as CTFdScoreboardEntry[]
		if (p.data && Array.isArray(p.data.data)) return p.data.data as CTFdScoreboardEntry[]
	}

	return null
}

async function fetchScoreboardWithHeaders(headers: HeadersInit, path: string): Promise<CTFdScoreboardEntry[] | null> {
	const res = await fetch(`${BASE}${path}`, {
		headers,
		cache: 'no-store',
	})

	if (!res.ok) return null

	const json = await safeJson<unknown>(res)
	if (!json) return null

	// Soporta respuesta estilo CTFd: { success: true, data: [...] }
	const body = json as CTFdResponse<unknown>
	if (typeof body.success === 'boolean') {
		if (!body.success) return null
		const arr = extractScoreboardArray(body)
		if (arr) return arr
		const nestedArr = extractScoreboardArray((body as any).data)
		if (nestedArr) return nestedArr
		return null
	}

	// Soporta APIs que devuelven directamente el array
	return extractScoreboardArray(json)
}

export async function ctfdGetScoreboardTop(sessionCookie: string, count: number): Promise<CTFdScoreboardEntry[]> {
	const safeCount = Number.isFinite(count) ? Math.max(1, Math.min(100, Math.floor(count))) : 10

	const headers = getUserHeaders(sessionCookie)

	// 1) Intentar endpoint “top” si existe
	const top =
		(await fetchScoreboardWithHeaders(headers, `/api/v1/scoreboard/top/${safeCount}`)) ??
		(await fetchScoreboardWithHeaders(headers, `/scoreboard/top/${safeCount}`))

	if (top && Array.isArray(top)) return top

	// 2) Fallback al scoreboard completo y recortar
	const full =
		(await fetchScoreboardWithHeaders(headers, `/api/v1/scoreboard`)) ??
		(await fetchScoreboardWithHeaders(headers, `/scoreboard`))

	if (!full || !Array.isArray(full)) {
		console.error('[ctfdGetScoreboardTop] Scoreboard response was not an array')
		return []
	}

	return full.slice(0, safeCount)
}

export async function ctfdAdminGetScoreboardAll(): Promise<CTFdScoreboardEntry[]> {
	const headers = getAdminHeaders()

	const full =
		(await fetchScoreboardWithHeaders(headers, `/api/v1/scoreboard`)) ??
		(await fetchScoreboardWithHeaders(headers, `/scoreboard`))

	if (!full || !Array.isArray(full)) {
		console.error('[ctfdAdminGetScoreboardAll] Scoreboard response was not an array')
		return []
	}

	return full
}

export async function ctfdGetTeamSolvesCount(sessionCookie: string, teamId: number): Promise<number> {
	if (!Number.isFinite(teamId) || teamId <= 0) return 0

	const res = await fetch(`${BASE}/api/v1/teams/${teamId}/solves`, {
		headers: getUserHeaders(sessionCookie),
		cache: 'no-store',
	})

	if (!res.ok) {
		console.error('[ctfdGetTeamSolvesCount] Error fetching team solves', {
			teamId,
			status: res.status,
		})
		return 0
	}

	const body = await safeJson<CTFdResponse<unknown[]>>(res)
	if (!body?.success || !Array.isArray(body.data)) return 0

	return body.data.length
}

