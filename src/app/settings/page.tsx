'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import { Download, FileUp, Skull, RotateCcwKey } from 'lucide-react'
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
import { AppSidebar, PageLayout, PasswordChangeDialog } from '@/components/custom'
import { useConfig, useUpdateConfig, useImportExport, useConfirmDialog } from '@/hooks'
import { isStaticExport, isClientStaticExport } from '@/lib/data-config'
import { deleteUser } from '@/lib/auth-client'

type Theme = 'dark' | 'light'
type Language = 'hu' | 'en'

export default function SettingsPage() {
  const t = useTranslations('SettingsPage')
  const { toggleSidebar } = useSidebar()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const { data: config, isLoading: configLoading } = useConfig()
  const updateConfig = useUpdateConfig()
  const { confirm } = useConfirmDialog()
  const { handleExport, handleImport } = useImportExport({
    onConfigImported: (imported) => {
      // Apply theme immediately
      if (imported.theme && imported.theme !== theme) setTheme(imported.theme as Theme)
      // Reload only if language changed
      if (config?.language && imported.language && imported.language !== config.language) {
        window.location.reload()
      }
    },
  })

  const handleThemeSelect = (newTheme: Theme) => {
    const previous = theme as Theme | undefined
    // Apply immediately (optimistic)
    setTheme(newTheme)
    updateConfig.mutate(
      { theme: newTheme },
      {
        onError: () => {
          // Revert if failed
          if (previous && previous !== newTheme) setTheme(previous)
        },
      }
    )
  }

  const handleLanguageChange = (language: Language) => {
    updateConfig.mutate(
      { language },
      {
        onSuccess: () => {
          // For static exports, trigger a custom event to update the provider
          const shouldUseLocalStorageLanguage = isStaticExport || isClientStaticExport()

          if (shouldUseLocalStorageLanguage) {
            // Dispatch custom event to trigger language change in provider
            window.dispatchEvent(new Event('languageChange'))
          } else {
            // reload page to load new language for SQLite mode
            window.location.reload()
          }
        },
      }
    )
  }

  const handleDeleteUser = async () => {
    const confirmed = await confirm({
      title: t('deleteUserTitle'),
      description: t('deleteUserDescription'),
      confirmText: t('deleteAccount'),
      destructive: true,
    })
    if (confirmed) {
      deleteUser(
        {
          callbackURL: '/signup',
        },
        {
          onSuccess: () => {
            router.push('/signup')
          },
          onError: (error) => {
            console.error('Delete user error:', error)
            // Still show success message as the user might have been deleted
            // but there could be a redirect issue
            router.push('/signup')
          },
        }
      )
    }
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
            <span className="mr-4 font-bold ">{t('settings')}</span>
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

          <div className="flex flex-col items-start gap-2 mt-4">
            <Label>{t('account')}</Label>

            <PasswordChangeDialog>
              <Button variant="outline">
                <RotateCcwKey />
                {t('changePassword')}
              </Button>
            </PasswordChangeDialog>
            <Button onClick={handleDeleteUser} variant="destructive">
              <Skull />
              {t('deleteAccount')}
            </Button>
          </div>
        </PageLayout>
      </main>
    </div>
  )
}
