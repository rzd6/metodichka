"use client"

import { useState, useEffect, useCallback } from "react"
import { useTheme } from "@/contexts/theme-context"
import { getThemeColor } from "@/lib/theme-utils"
import { getBugReports, deleteBugReport, type BugReport } from "@/lib/bug-reports"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bug, Trash2, RefreshCw, Crown, Shield, UsersRound, Train, Wrench, Clock } from "lucide-react"
import Image from "next/image"
import type { UserRole } from "@/data/users"

interface ManagementBugsSectionProps {
  userRole?: UserRole
}

function getAvatarForRole(role: string) {
  const avatarMap: Record<string, string> = {
    Руководство: "/avatars/management.png",
    Заместитель: "/avatars/senior-staff.png",
    "Старший Состав": "/avatars/senior-staff.png",
    ЦдУД: "/avatars/cdud.png",
    ПТО: "/avatars/pto.png",
  }
  return avatarMap[role] || "/avatars/senior-staff.png"
}

function getRoleBadgeIcon(role: string, color: string) {
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

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function ManagementBugsSection({ userRole }: ManagementBugsSectionProps) {
  const { theme } = useTheme()
  const [reports, setReports] = useState<BugReport[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const getTieColor = () => getThemeColor(theme.colorTheme)

  const load = useCallback(async () => {
    setIsLoading(true)
    const data = await getBugReports()
    setReports(data)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    load()
    // Listen for new bug reports sent from any section
    const handler = () => load()
    window.addEventListener("bugReportSent", handler)
    return () => window.removeEventListener("bugReportSent", handler)
  }, [load])

  const handleDelete = async (id: string) => {
    await deleteBugReport(id)
    setReports((prev) => prev.filter((r) => r.id !== id))
  }

  const sectionLabel: Record<string, string> = {
    lectures: "Лекции",
    training: "Тренировки",
    events: "Мероприятия",
    exams: "Экзамены",
    interviews: "Собеседования",
    "retro-train": "Ретропоезд",
    "reports-section": "Доклады в рацию",
    "gov-wave": "Гос. волна",
    "report-compiler": "Составитель докладов",
    contents: "Содержание",
    information: "Информация",
    duty: "Дежурство",
    orders: "Приказы",
    "report-generation": "Генерация отчётов",
    "rzd-website": "Новости РЖД",
    admin: "Управление",
  }

  return (
    <div className="space-y-6 opacity-95">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: getTieColor() + "40" }}>
        <div className="flex items-center gap-3">
          <div
            className="p-3 rounded-xl"
            style={{ background: `linear-gradient(135deg, ${getTieColor()}20, ${getTieColor()}10)` }}
          >
            <Bug className="w-6 h-6" style={{ color: getTieColor() }} />
          </div>
          <div>
            <h2 className="text-3xl font-bold" style={{ color: getTieColor() }}>
              Сообщения о проблемах
            </h2>
            <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
              Сообщения от сотрудников из всех разделов
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={load}
          disabled={isLoading}
          className={`gap-2 ${theme.mode === "dark" ? "border-white/20 text-white hover:bg-white/10" : "border-gray-300 text-gray-700"}`}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Обновить
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="w-8 h-8 animate-spin" style={{ color: getTieColor() }} />
        </div>
      ) : reports.length === 0 ? (
        <Card
          className={`border-2 rounded-2xl p-12 text-center ${
            theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"
          }`}
        >
          <Bug className="w-12 h-12 mx-auto mb-4 opacity-30" style={{ color: getTieColor() }} />
          <p className={`text-lg ${theme.mode === "dark" ? "text-white/50" : "text-gray-400"}`}>
            Сообщений о проблемах нет
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card
              key={report.id}
              className={`border-2 rounded-2xl p-5 ${
                theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"
              }`}
              style={{ borderLeftWidth: "4px", borderLeftColor: getTieColor() }}
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div
                  className="w-11 h-11 flex-shrink-0 overflow-hidden rounded-full"
                  style={{ boxShadow: `0 0 0 2px ${getTieColor()}` }}
                >
                  <Image
                    src={getAvatarForRole(report.author_role) || "/placeholder.svg"}
                    alt="Avatar"
                    width={44}
                    height={44}
                    className="w-full h-full object-cover scale-110"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Author info */}
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                      {report.author_nickname}
                    </span>
                    <span className="flex items-center gap-1">
                      {getRoleBadgeIcon(report.author_role, getTieColor())}
                      <span className="text-xs font-medium" style={{ color: getTieColor() }}>
                        {report.author_position || report.author_role}
                      </span>
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium text-white"
                      style={{ backgroundColor: getTieColor() + "cc" }}
                    >
                      {sectionLabel[report.section] || report.section}
                    </span>
                  </div>

                  {/* Message */}
                  <p
                    className={`text-sm leading-relaxed mb-2 whitespace-pre-wrap ${
                      theme.mode === "dark" ? "text-white/85" : "text-gray-800"
                    }`}
                  >
                    {report.message}
                  </p>

                  {/* Date */}
                  <div className="flex items-center gap-1.5">
                    <Clock className={`w-3.5 h-3.5 ${theme.mode === "dark" ? "text-white/40" : "text-gray-400"}`} />
                    <span className={`text-xs ${theme.mode === "dark" ? "text-white/40" : "text-gray-400"}`}>
                      {formatDate(report.sent_at)}
                    </span>
                  </div>
                </div>

                {/* Delete button (Руководство only) */}
                {userRole === "Руководство" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(report.id)}
                    className={`flex-shrink-0 h-8 w-8 p-0 rounded-lg transition-colors ${
                      theme.mode === "dark"
                        ? "hover:bg-red-500/20 text-white/40 hover:text-red-400"
                        : "hover:bg-red-50 text-gray-400 hover:text-red-500"
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
