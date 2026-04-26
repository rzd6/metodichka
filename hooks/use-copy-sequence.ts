"use client"

import { useState, useCallback } from "react"

/**
 * Tracks which line was last copied (per group) so we can:
 *  - softly highlight the copied line in green
 *  - brightly highlight the NEXT line as "press me next"
 *
 * groupId  — the accordion item id (lecture.id, training.id, etc.)
 * lineIndex — the 0-based index of the line within that group
 */
export interface CopyState {
  groupId: string
  lineIndex: number
}

export function useCopySequence() {
  // last successfully copied position
  const [lastCopied, setLastCopied] = useState<CopyState | null>(null)

  const markCopied = useCallback((groupId: string, lineIndex: number) => {
    setLastCopied({ groupId, lineIndex })
  }, [])

  /** Returns the visual state for a given line */
  const getLineState = useCallback(
    (
      groupId: string,
      lineIndex: number,
      totalLines: number,
    ): "copied" | "next" | "normal" => {
      if (!lastCopied || lastCopied.groupId !== groupId) return "normal"
      if (lastCopied.lineIndex === lineIndex) return "copied"
      if (
        lastCopied.lineIndex + 1 === lineIndex &&
        lineIndex < totalLines
      )
        return "next"
      return "normal"
    },
    [lastCopied],
  )

  return { markCopied, getLineState, lastCopied }
}
