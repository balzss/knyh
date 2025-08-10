'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { Download, FileUp } from 'lucide-react'

import { useSidebar } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
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
import { useConfig, useUpdateConfig, useImportExport } from '@/hooks'

type Theme = 'dark' | 'light'
type Language = 'hu' | 'en'

export default function SettingsPage() {
  const t = useTranslations('SettingsPage')
  const { toggleSidebar } = useSidebar()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { data: config, isLoading: configLoading } = useConfig()
  const updateConfig = useUpdateConfig()
  const { handleExport, handleImport } = useImportExport()

  const handleThemeSelect = (newTheme: Theme) => {
    updateConfig.mutate(
      { theme: newTheme },
      {
        onSuccess: () => {
          setTheme(newTheme)
        },
      }
    )
  }

  const handleLanguageChange = (language: Language) => {
    updateConfig.mutate(
      { language },
      {
        onSuccess: () => {
          // reload page to load new language
          window.location.reload()
        },
      }
    )
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
          <div className="flex flex-col gap-2 mb-3">
            <Label>{t('theme')}</Label>
            <Select onValueChange={handleThemeSelect} defaultValue={theme}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">{t('dark')}</SelectItem>
                <SelectItem value="light">{t('light')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!configLoading && (
            <div className="flex flex-col gap-2">
              <Label>{t('language')}</Label>
              <Select onValueChange={handleLanguageChange} defaultValue={config?.language}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hu">Magyar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex flex-col items-start gap-2 mt-4">
            <Label>{t('data')}</Label>

            <Button onClick={handleExport} variant="outline">
              <Download />
              {t('export')}
            </Button>
            <Button asChild variant="outline" className="cursor-pointer">
              <Label htmlFor="import-button">
                <FileUp />
                {t('import')}
              </Label>
            </Button>
            <input
              type="file"
              id="import-button"
              className="hidden"
              onChange={handleImport}
              accept=".json"
            />
          </div>
        </PageLayout>
      </main>
    </div>
  )
}
