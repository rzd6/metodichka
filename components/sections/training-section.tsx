"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { contentData } from "@/data/content"
import { Copy, Check, Dumbbell } from "lucide-react"
import { useState } from "react"
import { useTheme } from "@/contexts/theme-context"
import { getThemeColor } from "@/lib/theme-utils"
import { useCopySequence } from "@/hooks/use-copy-sequence"

export function TrainingSection() {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null)
  const { theme } = useTheme()
  const { markCopied, getLineState } = useCopySequence()

  const getTieColor = () => getThemeColor(theme.colorTheme)

  const copyToClipboard = (text: string, id: string, groupId: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(id)
    markCopied(groupId, index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const renderContent = (content: string[], trainingId: string) => {
    return content.map((line, index) => {
      const lineId = `${trainingId}-${index}`
      const state = getLineState(trainingId, index, content.length)

      return (
        <button
          key={index}
          onClick={() => copyToClipboard(line, lineId, trainingId, index)}
          className="w-full p-4 rounded-xl border-2 text-left transition-all duration-300 group mb-3"
          style={{
            borderLeftWidth: "4px",
            borderLeftColor: state === "copied" ? "#22c55e" : state === "next" ? "#16a34a" : getTieColor(),
            backgroundColor:
              state === "copied"
                ? theme.mode === "dark" ? "rgba(34,197,94,0.08)" : "rgba(34,197,94,0.06)"
                : state === "next"
                  ? theme.mode === "dark" ? "rgba(22,163,74,0.18)" : "rgba(22,163,74,0.12)"
                  : theme.mode === "dark" ? "rgba(15,20,25,0.8)" : "rgba(255,255,255,0.8)",
            borderColor: state === "copied" ? "rgba(34,197,94,0.4)" : state === "next" ? "rgba(22,163,74,0.7)" : undefined,
            boxShadow: state === "next" ? "0 0 0 1px rgba(22,163,74,0.4)" : undefined,
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <p
              className={`text-sm flex-1 transition-colors duration-200 ${
                state === "copied"
                  ? "text-green-500"
                  : state === "next"
                    ? theme.mode === "dark" ? "text-green-300 font-medium" : "text-green-800 font-medium"
                    : theme.mode === "dark" ? "text-white/90" : "text-gray-900"
              }`}
            >
              {line}
            </p>
            <div
              className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
              style={{ backgroundColor: state === "copied" || state === "next" ? "rgba(34,197,94,0.2)" : getTieColor() + "20" }}
            >
              {copiedIndex === lineId ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : state === "next" ? (
                <Copy className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" style={{ color: getTieColor() }} />
              )}
            </div>
          </div>
        </button>
      )
    })
  }

  return (
    <div className="space-y-6 opacity-95">
      <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: getTieColor() + "40" }}>
        <div
          className="p-3 rounded-xl"
          style={{
            background: `linear-gradient(135deg, ${getTieColor()}20, ${getTieColor()}10)`,
          }}
        >
          <Dumbbell className="w-6 h-6" style={{ color: getTieColor() }} />
        </div>
        <div>
          <h2 className="text-3xl font-bold" style={{ color: getTieColor() }}>
            Тренировки
          </h2>
          <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
            Физические упражнения для сотрудников
          </p>
        </div>
      </div>

      <Accordion type="single" collapsible className="space-y-4">
        {contentData.training.map((training) => (
          <AccordionItem
            key={training.id}
            value={training.id}
            className={`border-2 rounded-2xl overflow-hidden ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <Dumbbell className="w-5 h-5" style={{ color: getTieColor() }} />
                <span className={`font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                  {training.number}. {training.title}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">{renderContent(training.content, training.id)}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
