'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { useSidebar } from '@/components/ui/sidebar'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TopBar } from '@/components/TopBar'
import { AppSidebar, PageLayout } from '@/components/custom'

type Theme = 'dark' | 'light'

export default function Settings() {
  const { toggleSidebar } = useSidebar()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  const handleThemeSelect = (newTheme: Theme) => {
    setTheme(newTheme)
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
            <Label>Theme</Label>
            <Select onValueChange={handleThemeSelect} defaultValue={theme}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="light">Light</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between border p-3 rounded-md">
            <Label>Language</Label>
            <Select onValueChange={handleThemeSelect} defaultValue={theme}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">English</SelectItem>
                <SelectItem value="light">Hungarian</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </PageLayout>
      </main>
    </div>
  )
}
