"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { contentData } from "@/data/content"
import { Copy, Check, GraduationCap, X, Circle } from "lucide-react"
import { useState, useEffect } from "react"
import { useTheme } from "@/contexts/theme-context"
import { getThemeColor } from "@/lib/theme-utils"
import { useCopySequence } from "@/hooks/use-copy-sequence"

export function ExamsSection() {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<"theoretical" | "practical">("theoretical")
  const [answerScores, setAnswerScores] = useState<{ [key: string]: number }>({})
  const { theme } = useTheme()
  const { markCopied, getLineState } = useCopySequence()

  useEffect(() => {
    setCopiedIndex(null)
  }, [selectedCategory])

  const getTieColor = () => getThemeColor(theme.colorTheme)

  const copyToClipboard = (text: string, id: string, groupId?: string, index?: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(id)
    if (groupId !== undefined && index !== undefined) markCopied(groupId, index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleScoreChange = (questionId: string, value: number) => {
    setAnswerScores((prev) => ({ ...prev, [questionId]: value }))
  }

  const calculateTotalScore = (examId: string, questionsCount: number) => {
    let total = 0
    for (let i = 0; i < questionsCount; i++) {
      const questionId = `${examId}-q${i}`
      total += answerScores[questionId] || 0
    }
    return total
  }

  const getScoreIcon = (score: number) => {
    if (score === 0) return <X className="h-4 w-4 text-red-500" />
    if (score === 0.5) return <Circle className="h-4 w-4 text-yellow-500" />
    if (score === 1) return <Check className="h-4 w-4 text-green-500" />
    return null
  }

  const renderContent = (content: string[], examId: string, answers?: string[]) => {
    const questionAnswers = answers || []
    let questionIndex = 0

    return content.map((line, index) => {
      const lineId = `${examId}-${index}`
      const state = getLineState(examId, index, content.length)
      // Проверяем, является ли строка вопросом
      const isQuestion =
        (line.trim().startsWith("say") || line.trim().startsWith("b")) &&
        /^\d+\./.test(line.replace(/^(say|b) /, "").trim())

      let answer = null
      let questionId = null

      // Если строка является вопросом, находим соответствующий ответ
      if (isQuestion && questionIndex < questionAnswers.length) {
        answer = questionAnswers[questionIndex]
        questionId = `${examId}-q${questionIndex}`
        questionIndex++
      }

      return (
        <div key={index} className="space-y-3 mb-4">
          <button
            onClick={() => copyToClipboard(line, lineId, examId, index)}
            className="w-full p-4 rounded-xl border-2 text-left transition-all duration-300 group"
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

          {answer && answer.trim() !== "" && questionId && (
            <div
              className={`p-4 rounded-xl border-2 ${
                theme.mode === "dark" ? "bg-[#0f1419]/30 border-white/10" : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <span className="text-xs font-semibold mr-2" style={{ color: getTieColor() }}>
                    Ответ:
                  </span>
                  <span className={`text-sm ${theme.mode === "dark" ? "text-white/90" : "text-gray-800"}`}>
                    {answer}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    {[0, 0.5, 1].map((score) => (
                      <button
                        key={score}
                        onClick={() => handleScoreChange(questionId, score)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                          answerScores[questionId] === score
                            ? "text-white shadow-md"
                            : theme.mode === "dark"
                              ? "bg-[#0f1419]/50 text-white/60 hover:text-white/80"
                              : "bg-gray-100 text-gray-600 hover:text-gray-800"
                        }`}
                        style={answerScores[questionId] === score ? { backgroundColor: getTieColor() } : {}}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                  {getScoreIcon(answerScores[questionId] || 0)}
                </div>
              </div>
            </div>
          )}
        </div>
      )
    })
  }

  const renderCategory = (items: any[], isTheoretical = false) => {
    return (
      <Accordion type="single" collapsible className="space-y-4">
        {items.map((exam) => {
          const questionCount = isTheoretical
            ? exam.answers?.filter((a: string) => a && a.trim() !== "").length || 0
            : 0
          const totalScore = isTheoretical ? calculateTotalScore(exam.id, questionCount) : 0
          const isPassed = totalScore >= 8

          return (
            <AccordionItem
              key={exam.id}
              value={exam.id}
              className={`border-2 rounded-2xl overflow-hidden ${theme.mode === "dark" ? "bg-[#0f1419]/50 border-white/10" : "bg-white border-gray-200"}`}
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-5 h-5" style={{ color: getTieColor() }} />
                  <span className={`font-bold ${theme.mode === "dark" ? "text-white" : "text-gray-900"}`}>
                    {exam.title}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                {isTheoretical
                  ? renderContent(exam.questions, exam.id, exam.answers)
                  : renderContent(exam.content, exam.id)}

                {isTheoretical && questionCount > 0 && (
                  <>
                    <button
                      onClick={() => {
                        const examTitle = exam.id === "exam1" ? "управление локомотивом" : "ведение локомотива"
                        copyToClipboard(
                          `say Вы ${isPassed ? "сдали" : "не сдали"} теоретический экзамен на ${examTitle}, набрав ${totalScore}/15 баллов.`,
                          `${exam.id}-result`,
                        )
                      }}
                      className={`w-full mt-4 p-4 rounded-xl border-2 text-left transition-all duration-200 group ${
                        theme.mode === "dark"
                          ? "bg-gradient-to-r from-[#0f1419]/80 to-[#0f1419]/60 border-white/10 hover:border-white/30"
                          : "bg-gradient-to-r from-white/80 to-gray-50/60 border-gray-200 hover:border-gray-300"
                      }`}
                      style={{
                        borderLeftWidth: "4px",
                        borderLeftColor: getTieColor(),
                      }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <p className={`text-sm flex-1 ${theme.mode === "dark" ? "text-white/90" : "text-gray-900"}`}>
                          say Вы {isPassed ? "сдали" : "не сдали"} теоретический экзамен на{" "}
                          {exam.id === "exam1" ? "управление локомотивом" : "ведение локомотива"}, набрав {totalScore}
                          /15 баллов.
                        </p>
                        <div
                          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                          style={{
                            backgroundColor: getTieColor() + "20",
                          }}
                        >
                          {copiedIndex === `${exam.id}-result` ? (
                            <Check className="w-4 h-4" style={{ color: getTieColor() }} />
                          ) : (
                            <Copy
                              className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity"
                              style={{ color: getTieColor() }}
                            />
                          )}
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() =>
                        copyToClipboard("b Скриншот F12 и Дата время на HUD или /timestamp", `${exam.id}-timestamp`)
                      }
                      className={`w-full mt-2 p-4 rounded-xl border-2 text-left transition-all duration-200 group ${
                        theme.mode === "dark"
                          ? "bg-gradient-to-r from-[#0f1419]/80 to-[#0f1419]/60 border-white/10 hover:border-white/30"
                          : "bg-gradient-to-r from-white/80 to-gray-50/60 border-gray-200 hover:border-gray-300"
                      }`}
                      style={{
                        borderLeftWidth: "4px",
                        borderLeftColor: getTieColor(),
                      }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <p className={`text-sm flex-1 ${theme.mode === "dark" ? "text-white/90" : "text-gray-900"}`}>
                          b Скриншот F12 и Дата время на HUD или /timestamp
                        </p>
                        <div
                          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                          style={{
                            backgroundColor: getTieColor() + "20",
                          }}
                        >
                          {copiedIndex === `${exam.id}-timestamp` ? (
                            <Check className="w-4 h-4" style={{ color: getTieColor() }} />
                          ) : (
                            <Copy
                              className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity"
                              style={{ color: getTieColor() }}
                            />
                          )}
                        </div>
                      </div>
                    </button>
                  </>
                )}
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    )
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
          <GraduationCap className="w-6 h-6" style={{ color: getTieColor() }} />
        </div>
        <div>
          <h2 className="text-3xl font-bold" style={{ color: getTieColor() }}>
            Экзамены
          </h2>
          <p className={`text-sm ${theme.mode === "dark" ? "text-white/70" : "text-gray-600"}`}>
            Теоретические и практические экзамены
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setSelectedCategory("theoretical")}
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 border-2 ${
            selectedCategory === "theoretical"
              ? "text-white shadow-lg"
              : theme.mode === "dark"
                ? "bg-[#0f1419]/50 border-white/10 text-white/70 hover:border-white/30"
                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
          }`}
          style={
            selectedCategory === "theoretical" ? { backgroundColor: getTieColor(), borderColor: getTieColor() } : {}
          }
        >
          Теория
        </button>
        <button
          onClick={() => setSelectedCategory("practical")}
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 border-2 ${
            selectedCategory === "practical"
              ? "text-white shadow-lg"
              : theme.mode === "dark"
                ? "bg-[#0f1419]/50 border-white/10 text-white/70 hover:border-white/30"
                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
          }`}
          style={selectedCategory === "practical" ? { backgroundColor: getTieColor(), borderColor: getTieColor() } : {}}
        >
          Практика
        </button>
      </div>

      <div className="space-y-4">
        {selectedCategory === "theoretical" && renderCategory(contentData.exams.theoretical, true)}
        {selectedCategory === "practical" && renderCategory(contentData.exams.practical)}
      </div>
    </div>
  )
}
