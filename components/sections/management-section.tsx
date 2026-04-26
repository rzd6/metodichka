"use client"

import { useState, useEffect } from "react"
import { useTheme } from "@/contexts/theme-context"
import { getThemeColor } from "@/lib/theme-utils"
import { getBugReports, deleteBugReport, type BugReport } from "@/lib/bug-reports"
import { Trash2, Megaphone, Crown, Shield, UsersRound, Train, Wrench } from "lucide-react"

export function ManagementSection() {
  const { theme } = useTheme()
  const [reports, setReports] = useState<BugReport[]>([])

  const tieColor = getThemeColor(theme.colorTheme)
  const isDark = theme.mode === "dark"

  const loadReports = () => {
    setReports(getBugReports())
  }

  useEffect(() => {
    loadReports()
    const handler = () => loadReports()
    window.addEventListener("bugReportAdded", handler)
    return () => window.removeEventListener("bugReportAdded", handler)
  }, [])

  const handleDelete = (id: string) => {
    deleteBugReport(id)
    loadReports()
  }

  const getRoleIcon = (role: string) => {
    const cls = "w-4 h-4"
    switch (role) {
      case "Руководство":
        return <Crown className={cls} style={{ color: tieColor }} />
      case "Заместитель":
        return <Shield className={cls} style={{ color: tieColor }} />
      case "Старший Состав":
        return <UsersRound className={cls} style={{ color: tieColor }} />
      case "ЦдУД":
        return <Train className={cls} style={{ color: tieColor }} />
      case "ПТО":
        return <Wrench className={cls} style={{ color: tieColor }} />
      default:
        return null
    }
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6 opacity-95">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: tieColor + "40" }}>
        <div
          className="p-3 rounded-xl"
          style={{ background: `linear-gradient(135deg, ${tieColor}20, ${tieColor}10)` }}
        >
          <Megaphone className="w-6 h-6" style={{ color: tieColor }} />
        </div>
        <div>
          <h2 className="text-3xl font-bold" style={{ color: tieColor }}>
            Руководство
          </h2>
          <p className={`text-sm ${isDark ? "text-white/70" : "text-gray-600"}`}>
            Сообщения от сотрудников
          </p>
        </div>
        <div
          className="ml-auto px-3 py-1 rounded-full text-xs font-semibold text-white"
          style={{ backgroundColor: tieColor }}
        >
          {reports.length}
        </div>
      </div>

      {/* Reports feed */}
      {reports.length === 0 ? (
        <div
          className={`text-center py-16 rounded-2xl border-2 border-dashed ${
            isDark ? "border-white/10 text-white/40" : "border-gray-200 text-gray-400"
          }`}
        >
          <Megaphone className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: tieColor }} />
          <p className="text-lg font-medium">Сообщений нет</p>
          <p className="text-sm mt-1">Сообщения от сотрудников появятся здесь</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className={`rounded-2xl border-2 p-5 transition-all duration-200 ${
                isDark
                  ? "bg-gradient-to-br from-[#0f1419]/90 to-[#0f1419]/70 border-white/10 hover:border-white/20"
                  : "bg-white border-gray-200 hover:border-gray-300"
              }`}
              style={{ borderLeftWidth: "4px", borderLeftColor: tieColor }}
            >
              {/* Card header: user info */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  {/* Avatar placeholder */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white text-sm"
                    style={{ backgroundColor: tieColor + "cc" }}
                  >
                    {report.nickname.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      {getRoleIcon(report.role)}
                      <span className="font-bold text-sm" style={{ color: tieColor }}>
                        {report.nickname}
                      </span>
                    </div>
                    {report.position && (
                      <p className={`text-xs mt-0.5 ${isDark ? "text-white/50" : "text-gray-500"}`}>
                        {report.position}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}>
                    {formatDate(report.createdAt)}
                  </span>
                  <button
                    onClick={() => handleDelete(report.id)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isDark ? "hover:bg-red-500/20 text-red-400" : "hover:bg-red-50 text-red-500"
                    }`}
                    title="Удалить"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Section badge */}
              <div className="mb-3">
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: tieColor + "20", color: tieColor }}
                >
                  {report.section}
                </span>
              </div>

              {/* Message */}
              <p
                className={`text-sm leading-relaxed whitespace-pre-wrap ${
                  isDark ? "text-white/90" : "text-gray-800"
                }`}
              >
                {report.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
