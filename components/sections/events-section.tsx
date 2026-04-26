"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { contentData } from "@/data/content"
import { Copy, Check, Calendar } from "lucide-react"
import { useState } from "react"
import { useTheme } from "@/contexts/theme-context"
import { getThemeColor } from "@/lib/theme-utils"
import { SendBugButton } from "@/components/send-bug-button"

export function EventsSection() {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<"cleaning" | "technical" | "stations">("cleaning")
  const [lastCopiedLine, setLastCopiedLine] = useState<{ [id: string]: number }>({})
  const { theme } = useTheme()

  const getTieColor = () => getThemeColor(theme.colorTheme)

  const copyToClipboard = (text: string, id: string, parentId: string, lineIndex: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(id)
    setLastCopiedLine((prev) => ({ ...prev, [parentId]: lineIndex }))
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const renderContent = (content: string[] | undefined, eventId: string) => {
    if (!content || !Array.isArray(content)) return null
    const lastCopied = lastCopiedLine[eventId] ?? -1

    return content.map((line, index) => {
      const lineId = `${eventId}-${index}`
      const isSubtle = lastCopied === -1 && index === 0
      const isBright = lastCopied >= 0 && index === lastCopied + 1

      return (
        <button
          key={index}
          onClick={() => copyToClipboard(line, lineId, eventId, index)}
          className="w-full p-4 rounded-xl border-2 text-left transition-all duration-300 group mb-3"
          style={{
            borderLeftWidth: "4px",
            borderLeftColor: isBright ? "#22c55e" : isSubtle ? "#86efac" : getTieColor(),
            background: isBright
              ? theme.mode === "dark" ? "linear-gradient(to right,rgba(34,197,94,.18),rgba(34,197,94,.06))" : "linear-gradient(to right,rgba(34,197,94,.12),rgba(34,197,94,.04))"
              : isSubtle
              ? theme.mode === "dark" ? "linear-gradient(to right,rgba(134,239,172,.08),rgba(134,239,172,.02))" : "linear-gradient(to right,rgba(134,239,172,.10),rgba(134,239,172,.03))"
              : theme.mode === "dark" ? "linear-gradient(to right,rgba(15,20,25,.8),rgba(15,20,25,.6))" : "linear-gradient(to right,rgba(255,255,255,.8),rgba(249,250,251,.6))",
            borderColor: isBright ? "#22c55e" : isSubtle ? "#86efac" : theme.mode === "dark" ? "rgba(255,255,255,.1)" : "#e5e7eb",
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <p className={`text-sm flex-1 ${theme.mode === "dark" ? "text-white/90" : "text-gray-900"}`}>{line}</p>
            <div
              className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
              style={{ backgroundColor: isBright ? "#22c55e30" : getTieColor() + "20" }}
            >
              {copiedIndex === lineId ? (
                <Check className="w-4 h-4" style={{ color: getTieColor() }} />
              ) : (
                <Copy
                  className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity"
                  style={{ color: isBright ? "#22c55e" : getTieColor() }}
                />
              )}
            </div>
          </div>
        </button>
      )
    })
  }

  const renderCategory = (items: any[] | undefined) => {
    if (!items || !Array.isArray(items)) {
      return <div className="text-center text-white/50 py-8">Нет доступных мероприятий</div>
    }

    return (
      <Accordion type="single" collapsible className="space-y-4">
        {items.map((event) => (
          <AccordionItem
            key={event.id}
            value={event.id}
            className={`border-2 rounded-2xl overflow-hidden ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5" style={{ color: getTieColor() }} />
                <span className={`font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                  {event.title}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">{renderContent(event.content, event.id)}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    )
  }

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
            <Calendar className="w-6 h-6" style={{ color: getTieColor() }} />
          </div>
          <div>
            <h2 className="text-3xl font-bold" style={{ color: getTieColor() }}>
              Мероприятия
            </h2>
            <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
              Различные мероприятия и осмотры
            </p>
          </div>
        </div>
        <SendBugButton section="events" />
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setSelectedCategory("cleaning")}
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 border-2 ${
            selectedCategory === "cleaning"
              ? "text-white shadow-lg"
              : theme.mode === "dark"
                ? "bg-[#0f1419]/50 border-white/10 text-white/70 hover:border-white/30"
                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
          }`}
          style={selectedCategory === "cleaning" ? { backgroundColor: getTieColor(), borderColor: getTieColor() } : {}}
        >
          Уборка
        </button>
        <button
          onClick={() => setSelectedCategory("technical")}
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 border-2 ${
            selectedCategory === "technical"
              ? "text-white shadow-lg"
              : theme.mode === "dark"
                ? "bg-[#0f1419]/50 border-white/10 text-white/70 hover:border-white/30"
                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
          }`}
          style={selectedCategory === "technical" ? { backgroundColor: getTieColor(), borderColor: getTieColor() } : {}}
        >
          Тех. осмотры
        </button>
        <button
          onClick={() => setSelectedCategory("stations")}
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 border-2 ${
            selectedCategory === "stations"
              ? "text-white shadow-lg"
              : theme.mode === "dark"
                ? "bg-[#0f1419]/50 border-white/10 text-white/70 hover:border-white/30"
                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
          }`}
          style={selectedCategory === "stations" ? { backgroundColor: getTieColor(), borderColor: getTieColor() } : {}}
        >
          Осмотры станций и переездов
        </button>
      </div>

      <div className="space-y-4">
        {selectedCategory === "cleaning" && renderCategory(contentData.events?.cleaning)}
        {selectedCategory === "technical" && renderCategory(contentData.events?.technical)}
        {selectedCategory === "stations" && renderCategory(contentData.events?.stations)}
      </div>
    </div>
  )
}
