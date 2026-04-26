"use client"

import { useState } from "react"
import { useTheme } from "@/contexts/theme-context"
import { getThemeColor } from "@/lib/theme-utils"
import { createBugReport } from "@/lib/bug-reports"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Bug, Send, X } from "lucide-react"

interface SendBugButtonProps {
  section: string
}

function getCurrentUser() {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem("currentUser")
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function SendBugButton({ section }: SendBugButtonProps) {
  const { theme } = useTheme()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const getTieColor = () => getThemeColor(theme.colorTheme)

  const handleSend = async () => {
    if (!message.trim()) return
    setSending(true)

    const user = getCurrentUser()
    await createBugReport({
      message: message.trim(),
      section,
      author_nickname: user?.nickname || "Неизвестный",
      author_position: user?.position || "",
      author_role: user?.role || "",
    })

    window.dispatchEvent(new Event("bugReportSent"))
    setSending(false)
    setSent(true)
    setMessage("")
    setTimeout(() => {
      setSent(false)
      setOpen(false)
    }, 1500)
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {!open ? (
        <>
          <Button
            onClick={() => setOpen(true)}
            className="text-white font-semibold px-4 h-9 rounded-xl shadow-md hover:opacity-90 transition-opacity"
            style={{ backgroundColor: getTieColor() }}
          >
            <Bug className="w-4 h-4 mr-2" />
            Сообщить о проблеме
          </Button>
          <span className={`text-xs ${theme.mode === "dark" ? "text-white/40" : "text-gray-400"}`}>
            by Egoriy_Bobryshev
          </span>
        </>
      ) : (
        <div
          className={`w-80 rounded-2xl border-2 p-4 shadow-xl space-y-3 ${
            theme.mode === "dark" ? "bg-[#0f1419]/95 border-white/10" : "bg-white border-gray-200"
          }`}
          style={{ borderTopColor: getTieColor(), borderTopWidth: "3px" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bug className="w-4 h-4" style={{ color: getTieColor() }} />
              <span className={`text-sm font-semibold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                Сообщение руководству
              </span>
            </div>
            <button
              onClick={() => { setOpen(false); setMessage("") }}
              className={`p-1 rounded-lg transition-colors ${
                theme.mode === "dark" ? "hover:bg-white/10 text-white/60" : "hover:bg-gray-100 text-gray-400"
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Опишите проблему или баг..."
            rows={3}
            className={`text-sm resize-none ${
              theme.mode === "dark"
                ? "bg-white/5 border-white/10 text-white placeholder:text-white/40"
                : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"
            }`}
          />

          <div className="flex items-center justify-between gap-2">
            <span className={`text-xs ${theme.mode === "dark" ? "text-white/40" : "text-gray-400"}`}>
              by Egoriy_Bobryshev
            </span>
            <Button
              onClick={handleSend}
              disabled={!message.trim() || sending || sent}
              className="text-white text-sm font-semibold px-4 h-8 rounded-xl"
              style={{ backgroundColor: sent ? "#22c55e" : getTieColor() }}
            >
              {sent ? (
                "Отправлено!"
              ) : sending ? (
                "Отправка..."
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Отправить
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
