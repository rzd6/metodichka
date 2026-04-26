"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/theme-context"
import { getThemeColor } from "@/lib/theme-utils"
import { Crown, Shield, UsersRound, Train, Wrench, Trash2, RefreshCw } from "lucide-react"
import Image from "next/image"
import { getAvatarFilterFromColor } from "@/lib/color-utils"
import type { UserRole } from "@/data/users"
import { BugReportButton } from "@/components/bug-report-button"

interface BugReport {
  id: string
  sender_nickname: string
  sender_role: string
  sender_position: string
  from_section: string
  message: string
  created_at: string
}

const ROLE_AVATARS: Record<string, string> = {
  Руководство: "/avatars/management.png",
  Заместитель: "/avatars/senior-staff.png",
  "Старший Состав": "/avatars/senior-staff.png",
  ЦдУД: "/avatars/cdud.png",
  ПТО: "/avatars/pto.png",
}

function RoleBadgeIcon({ role, color }: { role: string; color: string }) {
  const cls = "w-3 h-3"
  switch (role) {
    case "Руководство":
      return <Crown className={cls} style={{ color }} />
    case "Заместитель":
      return <Shield className={cls} style={{ color }} />
    case "Старший Состав":
      return <UsersRound className={cls} style={{ color }} />
    case "ЦдУД":
      return <Train className={cls} style={{ color }} />
    case "ПТО":
      return <Wrench className={cls} style={{ color }} />
    default:
      return null
  }
}

function formatDate(isoString: string): string {
  const d = new Date(isoString)
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function BugReportSection() {
  const { theme } = useTheme()
  const [reports, setReports] = useState<BugReport[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const tieColor = getThemeColor(theme.colorTheme)

  const fetchReports = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/bug-reports")
      const json = await res.json()
      setReports(json.data || [])
    } catch {
      setReports([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await fetch(`/api/bug-reports?id=${id}`, { method: "DELETE" })
      setReports((prev) => prev.filter((r) => r.id !== id))
    } catch {
      // silent
    } finally {
      setDeletingId(null)
    }
  }

  const cardBg = theme.mode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
  const textPrimary = theme.mode === "dark" ? "text-white" : "text-black"
  const textMuted = theme.mode === "dark" ? "text-white/40" : "text-gray-400"
  const divider = theme.mode === "dark" ? "border-white/10" : "border-gray-100"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: tieColor }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 15v-5m0-4h.01"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <h1 className={`text-xl font-bold ${textPrimary}`}>Баг-репорт</h1>
            <p className={`text-xs ${textMuted}`}>Сообщения об ошибках от сотрудников</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <BugReportButton sectionLabel="Баг-репорт" />
          <Button
            variant="outline"
            size="sm"
            onClick={fetchReports}
            disabled={loading}
            className={`h-8 px-3 text-xs ${
              theme.mode === "dark"
                ? "border-white/10 bg-transparent text-white hover:bg-white/5"
                : "border-gray-200 bg-transparent text-black hover:bg-gray-50"
            }`}
          >
            <RefreshCw className={`w-3 h-3 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Обновить
          </Button>
        </div>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-32 rounded-xl animate-pulse ${theme.mode === "dark" ? "bg-white/5" : "bg-gray-100"}`}
            />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <Card className={`${cardBg} shadow-none`}>
          <CardContent className="py-12 text-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 opacity-40"
              style={{ backgroundColor: tieColor }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 15v-5m0-4h.01"
                  stroke="white"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className={`text-sm font-medium ${textPrimary}`}>Нет баг-репортов</p>
            <p className={`text-xs mt-1 ${textMuted}`}>Сообщения появятся здесь после отправки</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const avatar = ROLE_AVATARS[report.sender_role] || "/avatars/cdud.png"
            return (
              <Card key={report.id} className={`${cardBg} shadow-none`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div
                      className="w-10 h-10 rounded-full border-2 flex-shrink-0 overflow-hidden flex items-center justify-center"
                      style={{ borderColor: tieColor }}
                    >
                      <Image
                        src={avatar || "/placeholder.svg"}
                        alt={report.sender_role}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover object-center scale-110"
                        style={{ filter: getAvatarFilterFromColor(theme.colorTheme) }}
                      />
                    </div>

                    {/* Body */}
                    <div className="flex-1 min-w-0">
                      {/* Top row: sender info + from section + date + delete */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-sm font-semibold leading-tight ${textPrimary}`}>
                              {report.sender_nickname}
                            </span>
                            <RoleBadgeIcon role={report.sender_role} color={tieColor} />
                            <span className="text-xs font-medium" style={{ color: tieColor }}>
                              {report.sender_role}
                            </span>
                          </div>
                          <p className={`text-xs mt-0.5 ${textMuted} truncate`}>{report.sender_position}</p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* From section badge */}
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                            style={{
                              backgroundColor: `${tieColor}20`,
                              color: tieColor,
                            }}
                          >
                            {report.from_section}
                          </span>
                          {/* Delete */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`w-7 h-7 flex-shrink-0 ${
                              theme.mode === "dark"
                                ? "text-white/30 hover:text-red-400 hover:bg-red-400/10"
                                : "text-gray-300 hover:text-red-500 hover:bg-red-50"
                            }`}
                            onClick={() => handleDelete(report.id)}
                            disabled={deletingId === report.id}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className={`w-full border-t ${divider} mb-2`} />

                      {/* Message */}
                      <p className={`text-sm leading-relaxed whitespace-pre-wrap ${textPrimary}`}>
                        {report.message}
                      </p>

                      {/* Date */}
                      <p className={`text-[11px] mt-2 ${textMuted}`}>{formatDate(report.created_at)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
