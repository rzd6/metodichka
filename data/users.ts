import { type Position, getRoleFromPosition, type UserRole } from "./positions"

export type { UserRole } from "./positions"

export interface User {
  id: string
  nickname: string
  password: string
  role: UserRole
  position: Position
  createdAt: string
}

let cachedUsers: User[] | null = null
let lastFetchTime = 0
const CACHE_DURATION = 5000

function rowToUser(row: any): User {
  return {
    id: row.id,
    nickname: row.username,
    password: row.password,
    role: getRoleFromPosition(row.position as Position),
    position: row.position as Position,
    createdAt: row.created_at,
  }
}

async function apiFetch(path: string, options?: RequestInit) {
  const base = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
  })
  return res.json()
}

async function initializeUsers(forceRefresh = false): Promise<User[]> {
  const now = Date.now()
  if (!forceRefresh && cachedUsers && now - lastFetchTime < CACHE_DURATION) {
    return cachedUsers
  }

  try {
    const { data, error } = await apiFetch("/api/users")
    if (error || !Array.isArray(data)) return []
    const users = data.map(rowToUser)
    cachedUsers = users
    lastFetchTime = Date.now()
    return users
  } catch {
    return []
  }
}

export function invalidateUserCache() {
  cachedUsers = null
  lastFetchTime = 0
}

export async function addUser(nickname: string, password: string, position: Position): Promise<User | null> {
  const role = getRoleFromPosition(position)

  try {
    const { data, error } = await apiFetch("/api/users", {
      method: "POST",
      body: JSON.stringify({
        username: nickname,
        password,
        full_name: `[${role}] ${nickname}`,
        position,
        rank: getRankFromRole(role),
        avatar: getAvatarFromRole(role),
      }),
    })

    if (error || !data) return null

    invalidateUserCache()

    // Auto-delete the bootstrap "Admin" account when a real Руководство user is added
    if (role === "Руководство" && nickname !== "Admin") {
      await apiFetch("/api/users", {
        method: "DELETE",
        body: JSON.stringify({ username: "Admin" }),
      })
      invalidateUserCache()
    }

    return rowToUser(data)
  } catch {
    return null
  }
}

export async function updateUser(id: string, updates: Partial<Omit<User, "id" | "createdAt">>): Promise<User | null> {
  try {
    const body: any = { id }
    if (updates.nickname) body.username = updates.nickname
    if (updates.password) body.password = updates.password
    if (updates.position) {
      const role = getRoleFromPosition(updates.position)
      body.position = updates.position
      body.rank = getRankFromRole(role)
      body.avatar = getAvatarFromRole(role)
      body.full_name = `[${role}] ${updates.nickname ?? ""}`
    }

    const { data, error } = await apiFetch("/api/users", {
      method: "PATCH",
      body: JSON.stringify(body),
    })

    if (error || !data) return null
    invalidateUserCache()
    return rowToUser(data)
  } catch {
    return null
  }
}

export async function deleteUser(id: string): Promise<boolean> {
  try {
    await apiFetch("/api/users", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    })
    invalidateUserCache()
    return true
  } catch {
    return false
  }
}

export async function findUserByNickname(nickname: string): Promise<User | undefined> {
  try {
    const { data } = await apiFetch(`/api/users?username=${encodeURIComponent(nickname)}`)
    return data ? rowToUser(data) : undefined
  } catch {
    return undefined
  }
}

export async function authenticateUser(nickname: string, password: string): Promise<User | null> {
  try {
    const { data } = await apiFetch(
      `/api/users?username=${encodeURIComponent(nickname)}&password=${encodeURIComponent(password)}`
    )
    return data ? rowToUser(data) : null
  } catch {
    return null
  }
}

export async function getAllUsers(forceRefresh = false): Promise<User[]> {
  return await initializeUsers(forceRefresh)
}

function getRankFromRole(role: UserRole): number {
  const rankMap: Record<UserRole, number> = {
    Руководство: 9,
    Заместитель: 8,
    "Старший Состав": 7,
    ЦдУД: 5,
    ПТО: 3,
  }
  return rankMap[role] || 1
}

function getAvatarFromRole(role: UserRole): string {
  const avatarMap: Record<UserRole, string> = {
    Руководство: "/avatars/management.png",
    Заместитель: "/avatars/management.png",
    "Старший Состав": "/avatars/senior-staff.png",
    ЦдУД: "/avatars/cdud.png",
    ПТО: "/avatars/pto.png",
  }
  return avatarMap[role] || "/avatars/cdud.png"
}

export function canManageAllRoles(role: UserRole): boolean {
  return role === "Руководство"
}

export function canManageCdUDAndPTO(role: UserRole): boolean {
  return role === "Руководство" || role === "Заместитель"
}

export function canChangeBetweenCdUDAndPTO(role: UserRole): boolean {
  return role === "Руководство" || role === "Заместитель" || role === "Старший Состав"
}

export function canSeePasswords(role: UserRole): boolean {
  return role === "Руководство" || role === "Заместитель"
}

export function canAccessManagement(role: UserRole): boolean {
  return role !== "ПТО" && role !== "ЦдУД"
}

export function canAccessInterviews(role: UserRole): boolean {
  return true
}

export function canAccessMaintenance(role: UserRole): boolean {
  return role === "ЦдУД" || role === "ПТО"
}

export function canAccessReportGeneration(role: UserRole): boolean {
  return true
}

export function canSeeLeadershipReport(role: UserRole): boolean {
  return role === "Руководство"
}

export function canSeeReprimandReport(role: UserRole): boolean {
  return true
}

export function canSeeCDUDReport(role: UserRole): boolean {
  return role === "ЦдУД"
}

export function canSeePTOReport(role: UserRole): boolean {
  return role === "ПТО"
}

export function canSeeSeniorStaffReport(role: UserRole): boolean {
  return role === "Старший Состав"
}

export function canAccessReportCompiler(role: UserRole): boolean {
  return role !== "ПТО"
}

export function canAccessEducationalContent(role: UserRole): boolean {
  return role !== "ПТО" && role !== "ЦдУД"
}

export function canAccessOrders(role: UserRole): boolean {
  return role !== "ПТО" && role !== "ЦдУД"
}

export function canAccessGovWave(role: UserRole): boolean {
  return role === "Руководство" || role === "Заместитель"
}

export function canAccessGoogleSheets(role: UserRole): boolean {
  return role === "Руководство" || role === "Заместитель" || role === "Старший Состав"
}
