"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { ContentSection } from "@/components/sections/content-section"
import { ThemeProvider, useTheme } from "@/contexts/theme-context"
import { useRouter } from "next/navigation"
import type { UserRole } from "@/data/users"
import { getAllUsers } from "@/data/users"
import { getThemeColor } from "@/lib/theme-utils"

interface LocalUser {
  id: string
  nickname: string
  role: UserRole
  position: string
  vkAccessToken: string
}

function MainContentInner() {
  const [activeSection, setActiveSection] = useState("contents")
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [user, setUser] = useState<LocalUser | null>(null)
  const { theme } = useTheme()
  const router = useRouter()

  const getBackgroundImage = () => {
    return theme.background
  }

  const getTieColor = () => getThemeColor(theme.colorTheme)

  useEffect(() => {
    // Initial auth check — load from localStorage, then verify in DB once
    const authData = localStorage.getItem("currentUser")
    if (!authData) {
      router.push("/login")
      return
    }

    let userData: LocalUser
    try {
      userData = JSON.parse(authData)
    } catch {
      router.push("/login")
      return
    }

    // Show stored data immediately — no waiting for DB
    setUser(userData)

    // Verify + refresh from DB in background (does NOT log out on network error)
    const refreshFromDb = async (currentData: LocalUser) => {
      try {
        const allUsers = await getAllUsers(true)
        const dbUser = allUsers.find((u) => u.id === currentData.id)

        if (!dbUser) {
          // Account was explicitly deleted — log out
          localStorage.removeItem("currentUser")
          router.push("/login")
          return
        }

        if (
          dbUser.nickname !== currentData.nickname ||
          dbUser.role !== currentData.role ||
          dbUser.position !== currentData.position
        ) {
          const updated = {
            id: dbUser.id,
            nickname: dbUser.nickname,
            role: dbUser.role,
            position: dbUser.position,
            vkAccessToken: currentData.vkAccessToken || "",
          }
          localStorage.setItem("currentUser", JSON.stringify(updated))
          setUser(updated)
          window.dispatchEvent(new Event("userDataUpdated"))
        }
      } catch {
        // Network error — keep the user logged in, don't do anything
      }
    }

    refreshFromDb(userData)

    // SSE — listen for changes pushed from the server
    const sse = new EventSource("/api/users/stream")
    sse.onmessage = (e) => {
      if (e.data === "users_changed") {
        const latest = localStorage.getItem("currentUser")
        if (latest) {
          try {
            refreshFromDb(JSON.parse(latest))
          } catch {}
        }
      }
    }
    sse.onerror = () => {
      // SSE connection dropped — reconnect is automatic, ignore
    }

    const handleUserUpdate = () => {
      const latest = localStorage.getItem("currentUser")
      if (latest) {
        try {
          setUser(JSON.parse(latest))
        } catch {}
      }
    }

    window.addEventListener("userRoleUpdated", handleUserUpdate)
    window.addEventListener("userDataUpdated", handleUserUpdate)

    return () => {
      sse.close()
      window.removeEventListener("userRoleUpdated", handleUserUpdate)
      window.removeEventListener("userDataUpdated", handleUserUpdate)
    }
  }, [router])

  useEffect(() => {
    document.documentElement.style.setProperty("--scrollbar-color", getTieColor())
  }, [theme.colorTheme])

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Загрузка...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        user={user}
      />
      <main
        className={`flex-1 transition-all duration-300 ${isCollapsed ? "ml-20" : "ml-64"}`}
        style={{
          backgroundImage: `url(${getBackgroundImage()})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div
          className={`min-h-screen ${
            theme.mode === "dark" ? "bg-black/70 backdrop-blur-sm" : "bg-white/80 backdrop-blur-sm"
          }`}
        >
          <div className="p-6 space-y-4">
            <ContentSection activeSection={activeSection} userRole={user?.role} userNickname={user?.nickname} />
          </div>
        </div>
      </main>
    </div>
  )
}

export function MainContent() {
  return (
    <ThemeProvider>
      <MainContentInner />
    </ThemeProvider>
  )
}
