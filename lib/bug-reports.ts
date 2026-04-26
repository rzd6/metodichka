// Bug Reports storage using Supabase (falls back to localStorage)
import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export interface BugReport {
  id: string
  message: string
  section: string
  author_nickname: string
  author_position: string
  author_role: string
  sent_at: string
}

// Local fallback storage key
const LOCAL_KEY = "rzd-bug-reports"

function getLocalReports(): BugReport[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLocalReports(reports: BugReport[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(LOCAL_KEY, JSON.stringify(reports))
}

export async function getBugReports(): Promise<BugReport[]> {
  try {
    const client = createBrowserClient(supabaseUrl, supabaseAnonKey)
    const { data, error } = await client
      .from("bug_reports")
      .select("*")
      .order("sent_at", { ascending: false })
    if (!error && data) {
      return data as BugReport[]
    }
  } catch {}
  // Fallback to localStorage
  return getLocalReports().sort(
    (a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()
  )
}

export async function createBugReport(
  report: Omit<BugReport, "id" | "sent_at">
): Promise<BugReport | null> {
  const newReport: BugReport = {
    ...report,
    id: Date.now().toString(),
    sent_at: new Date().toISOString(),
  }

  try {
    const client = createBrowserClient(supabaseUrl, supabaseAnonKey)
    const { data, error } = await client
      .from("bug_reports")
      .insert([{ ...newReport }])
      .select()
      .single()
    if (!error && data) return data as BugReport
  } catch {}

  // Fallback to localStorage
  const existing = getLocalReports()
  existing.unshift(newReport)
  saveLocalReports(existing)
  return newReport
}

export async function deleteBugReport(id: string): Promise<boolean> {
  try {
    const client = createBrowserClient(supabaseUrl, supabaseAnonKey)
    const { error } = await client.from("bug_reports").delete().eq("id", id)
    if (!error) return true
  } catch {}

  // Fallback to localStorage
  const existing = getLocalReports().filter((r) => r.id !== id)
  saveLocalReports(existing)
  return true
}
