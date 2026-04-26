export interface BugReport {
  id: string
  nickname: string
  position: string
  role: string
  message: string
  section: string
  createdAt: string
}

const STORAGE_KEY = "rzd-bug-reports"

export function getBugReports(): BugReport[] {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveBugReport(report: Omit<BugReport, "id" | "createdAt">): BugReport {
  const newReport: BugReport = {
    ...report,
    id: `bug-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: new Date().toISOString(),
  }
  const existing = getBugReports()
  const updated = [newReport, ...existing]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  // Notify other components
  window.dispatchEvent(new Event("bugReportAdded"))
  return newReport
}

export function deleteBugReport(id: string): void {
  const existing = getBugReports()
  const updated = existing.filter((r) => r.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  window.dispatchEvent(new Event("bugReportAdded"))
}
