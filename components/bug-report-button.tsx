"use client"

import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/theme-context"
import { getThemeColor } from "@/lib/theme-utils"
import { saveBugReport } from "@/lib/bug-reports"
import { Flag, X, Send } from "lucide-react"

interface BugReportButtonProps {
  sectionName: string
}

interface LocalUser {
  nickname: string
  position: string
  role: string
}

export function BugReportButton({ sectionName }: BugReportButtonProps) {
  const { theme } = useTheme()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [sent, setSent] = useState(false)
  const [user, setUser] = useState<LocalUser>({ nickname: "Аноним", position: "", role: "" })

  const tieColor = getThemeColor(theme.colorTheme)
  const isDark = theme.mode === "dark"

  useEffect(() => {
    try {
      const data = localStorage.getItem("currentUser")
      if (data) {
        const parsed = JSON.parse(data)
        setUser({
          nickname: parsed.nickname || "Аноним",
          position: parsed.position || "",
          role: parsed.role || "",
        })
      }
    } catch {}
  }, [])

  const handleSend = () => {
    if (!message.trim()) return
    saveBugReport({
      nickname: user.nickname,
      position: user.position,
      role: user.role,
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
    <div className="relative flex flex-col items-end gap-0.5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-white text-xs font-semibold shadow transition-all duration-200 hover:opacity-90 active:scale-95"
        style={{ backgroundColor: tieColor }}
        title="Сообщить руководству"
      >
        <Flag className="w-3.5 h-3.5" />
        <span>Руководству</span>
      </button>
      <span className={`text-[10px] ${isDark ? "text-white/35" : "text-gray-400"}`}>
        by Egoriy_Bobryshev
      </span>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          {/* Dropdown */}
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
                <X className="w-4 h-4" style={{ color: isDark ? "#fff" : "#000" }} />
              </button>
            </div>
            <p className={`text-xs mb-3 ${isDark ? "text-white/50" : "text-gray-500"}`}>
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
        </>
      )}
    </div>
  )
}
