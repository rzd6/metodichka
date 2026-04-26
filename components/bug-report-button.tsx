"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useTheme } from "@/contexts/theme-context"
import { getThemeColor } from "@/lib/theme-utils"
import { saveBugReport } from "@/lib/bug-reports"
import { Flag, X, Send } from "lucide-react"

interface BugReportButtonProps {
  sectionName: string
  userNickname?: string
  userPosition?: string
  userRole?: string
}

export function BugReportButton({ sectionName, userNickname, userPosition, userRole }: BugReportButtonProps) {
  const { theme } = useTheme()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [sent, setSent] = useState(false)

  const tieColor = getThemeColor(theme.colorTheme)
  const isDark = theme.mode === "dark"

  const handleSend = () => {
    if (!message.trim()) return
    saveBugReport({
      nickname: userNickname || "Аноним",
      position: userPosition || "",
      role: userRole || "",
      message: message.trim(),
      section: sectionName,
    })
    setSent(true)
    setMessage("")
    setTimeout(() => {
      setSent(false)
      setOpen(false)
    }, 1500)
  }

  return (
    <div className="flex flex-col items-end gap-0.5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-white text-xs font-semibold shadow transition-all duration-200 hover:opacity-90 active:scale-95"
        style={{ backgroundColor: tieColor }}
        title="Сообщить руководству"
      >
        <Flag className="w-3.5 h-3.5" />
        <span>Руководству</span>
      </button>
      <span className="text-[10px] opacity-40" style={{ color: isDark ? "#fff" : "#000" }}>
        by Egoriy_Bobryshev
      </span>

      {open && (
        <div
          className={`absolute z-50 top-full mt-2 right-0 w-80 rounded-2xl border-2 shadow-2xl p-4 ${
            isDark ? "bg-[#0f1419] border-white/10" : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-sm" style={{ color: tieColor }}>
              Сообщение руководству
            </span>
            <button
              onClick={() => setOpen(false)}
              className={`p-1 rounded-lg transition-colors ${isDark ? "hover:bg-white/10" : "hover:bg-gray-100"}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className={`text-xs mb-2 ${isDark ? "text-white/50" : "text-gray-500"}`}>
            Раздел: <span className="font-medium">{sectionName}</span>
          </p>
          {sent ? (
            <div
              className="text-center py-4 text-sm font-semibold rounded-xl"
              style={{ backgroundColor: tieColor + "20", color: tieColor }}
            >
              Отправлено!
            </div>
          ) : (
            <>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Опишите проблему или предложение..."
                rows={4}
                className={`text-sm resize-none mb-3 ${
                  isDark
                    ? "bg-white/5 border-white/10 text-white placeholder:text-white/30"
                    : "bg-gray-50 border-gray-200 text-black placeholder:text-gray-400"
                }`}
              />
              <Button
                onClick={handleSend}
                disabled={!message.trim()}
                className="w-full text-white font-semibold h-9 text-sm rounded-xl"
                style={{ backgroundColor: tieColor }}
              >
                <Send className="w-4 h-4 mr-2" />
                Отправить
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
