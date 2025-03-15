'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { useSidebar } from '@/components/ui/sidebar'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { TopBar } from '@/components/TopBar'
import { AppSidebar, PageLayout } from '@/components/custom'

export default function Settings() {
  const { toggleSidebar } = useSidebar()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [darkMode, setDarkMode] = useState(theme === 'dark')

  const toggleDarkMode = () => {
    const newTheme = darkMode ? 'light' : 'dark'
    setTheme(newTheme)
    setDarkMode(!darkMode)
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="flex w-full">
      <TopBar
        onSidebarToggle={toggleSidebar}
        customTopbarContent={
          <div className="flex items-center gap-2">
            <span className="mr-4 font-bold ">Settings</span>
          </div>
        }
      />
      <AppSidebar path="/settings" />
      <main className="w-full mt-16 mx-auto">
        <PageLayout>
          <div className="flex items-center justify-between border p-3 rounded-md">
            <Label htmlFor="darkModeSwitch" className="font-bold">
              Dark mode
            </Label>
            <Switch
              id="darkModeSwitch"
              checked={darkMode}
              onCheckedChange={toggleDarkMode}
            />
          </div>
        </PageLayout>
      </main>
    </div>
  )
}
