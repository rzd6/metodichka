"use client"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { contentData } from "@/data/content"
import { Copy, Check, BookOpenText } from "lucide-react"
import { useState, useEffect } from "react"
import { useTheme } from "@/contexts/theme-context"
import { getThemeColor } from "@/lib/theme-utils"
import { SendBugButton } from "@/components/send-bug-button"

export function LecturesSection() {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<"main" | "additional">("main")
  // Tracks the last copied line index per lecture id
  const [lastCopiedLine, setLastCopiedLine] = useState<{ [lectureId: string]: number }>({})
  const { theme } = useTheme()

  useEffect(() => {
    setCopiedIndex(null)
    setLastCopiedLine({})
  }, [selectedCategory])

  const getTieColor = () => getThemeColor(theme.colorTheme)

  const copyToClipboard = (text: string, id: string, lectureId: string, lineIndex: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(id)
    setLastCopiedLine((prev) => ({ ...prev, [lectureId]: lineIndex }))
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const renderContent = (content: string[], lectureId: string) => {
    const lastCopied = lastCopiedLine[lectureId] ?? -1
    return content.map((line, index) => {
      const lineId = `${lectureId}-${index}`
      // First line gets subtle green when nothing copied yet; next line after last copied gets bright green
      const isSubtleHighlight = lastCopied === -1 && index === 0
      const isBrightHighlight = lastCopied >= 0 && index === lastCopied + 1

      return (
        <button
          key={index}
          onClick={() => copyToClipboard(line, lineId, lectureId, index)}
          className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 group mb-3`}
          style={{
            borderLeftWidth: "4px",
            borderLeftColor: isBrightHighlight ? "#22c55e" : isSubtleHighlight ? "#86efac" : getTieColor(),
            background: isBrightHighlight
              ? theme.mode === "dark"
                ? "linear-gradient(to right, rgba(34,197,94,0.18), rgba(34,197,94,0.06))"
                : "linear-gradient(to right, rgba(34,197,94,0.12), rgba(34,197,94,0.04))"
              : isSubtleHighlight
              ? theme.mode === "dark"
                ? "linear-gradient(to right, rgba(134,239,172,0.08), rgba(134,239,172,0.02))"
                : "linear-gradient(to right, rgba(134,239,172,0.10), rgba(134,239,172,0.03))"
              : theme.mode === "dark"
              ? "linear-gradient(to right, rgba(15,20,25,0.8), rgba(15,20,25,0.6))"
              : "linear-gradient(to right, rgba(255,255,255,0.8), rgba(249,250,251,0.6))",
            borderColor: isBrightHighlight
              ? "#22c55e"
              : isSubtleHighlight
              ? "#86efac"
              : theme.mode === "dark"
              ? "rgba(255,255,255,0.1)"
              : "#e5e7eb",
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <p className={`text-sm flex-1 ${theme.mode === "dark" ? "text-white/90" : "text-gray-900"}`}>{line}</p>
            <div
              className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
              style={{
                backgroundColor: isBrightHighlight ? "#22c55e30" : getTieColor() + "20",
              }}
            >
              {copiedIndex === lineId ? (
                <Check className="w-4 h-4" style={{ color: getTieColor() }} />
              ) : (
                <Copy
                  className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity"
                  style={{ color: isBrightHighlight ? "#22c55e" : getTieColor() }}
                />
              )}
            </div>
          </div>
        </button>
      )
    })
  }

  const lectures = selectedCategory === "main" ? contentData.lectures.main : contentData.lectures.additional

  return (
    <div className="space-y-6 opacity-95">
      <div className="flex items-start justify-between gap-4 pb-4 border-b" style={{ borderColor: getTieColor() + "40" }}>
        <div className="flex items-center gap-3">
          <div
            className="p-3 rounded-xl"
            style={{
              background: `linear-gradient(135deg, ${getTieColor()}20, ${getTieColor()}10)`,
            }}
          >
            <BookOpenText className="w-6 h-6" style={{ color: getTieColor() }} />
          </div>
          <div>
            <h2 className="text-3xl font-bold" style={{ color: getTieColor() }}>
              Лекции
            </h2>
            <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
              Обучающие материалы для сотрудников РЖД
            </p>
          </div>
        </div>
        <SendBugButton section="lectures" />
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setSelectedCategory("main")}
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 border-2 ${
            selectedCategory === "main"
              ? "text-white shadow-lg"
              : theme.mode === "dark"
                ? "bg-[#0f1419]/50 border-white/10 text-white/70 hover:border-white/30"
                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
          }`}
          style={selectedCategory === "main" ? { backgroundColor: getTieColor(), borderColor: getTieColor() } : {}}
        >
          Основные лекции
        </button>
        <button
          onClick={() => setSelectedCategory("additional")}
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 border-2 ${
            selectedCategory === "additional"
              ? "text-white shadow-lg"
              : theme.mode === "dark"
                ? "bg-[#0f1419]/50 border-white/10 text-white/70 hover:border-white/30"
                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
          }`}
          style={
            selectedCategory === "additional" ? { backgroundColor: getTieColor(), borderColor: getTieColor() } : {}
          }
        >
          Дополнительные лекции
        </button>
      </div>

      <Accordion type="single" collapsible className="space-y-4">
        {lectures.map((lecture) => (
          <AccordionItem
            key={lecture.id}
            value={lecture.id}
            className={`border-2 rounded-2xl overflow-hidden ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <BookOpenText className="w-5 h-5" style={{ color: getTieColor() }} />
                <span className={`font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                  {lecture.number}. {lecture.title}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">{renderContent(lecture.content, lecture.id)}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
