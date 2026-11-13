import { useTranslations } from 'use-intl'
import { Download, FileUp, LogIn, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TopBar, AppSidebar, PageLayout } from '@/components/custom'
import { useConfig, useUpdateConfig, useImportExport } from '@/hooks'
import { useTheme, type Theme } from '@/providers/ThemeProvider'
import { useEditMode } from '@/providers/EditModeProvider'

type Language = 'hu' | 'en'

export default function SettingsPage() {
  const t = useTranslations('SettingsPage')
  const { theme, setTheme } = useTheme()
  const { editor } = useEditMode()
  const { data: config, isLoading: configLoading } = useConfig()
  const updateConfig = useUpdateConfig()
  const { handleExport, handleImport } = useImportExport()

  const handleLanguageChange = (language: Language) => {
    updateConfig.mutate({ language })
  }

  return (
    <div className="flex w-full">
      <TopBar
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
            <Select onValueChange={(value) => setTheme(value as Theme)} value={theme}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">{t('dark')}</SelectItem>
                <SelectItem value="light">{t('light')}</SelectItem>
                <SelectItem value="system">{t('system')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col items-start gap-2 mb-3">
            <Label>{t('editMode')}</Label>
            <p className="text-sm text-muted-foreground">
              {editor ? t('editModeOn') : t('editModeOff')}
            </p>
            {editor ? (
              <Button asChild variant="outline">
                <a href="/cdn-cgi/access/logout">
                  <LogOut />
                  {t('signOut')}
                </a>
              </Button>
            ) : (
              <Button asChild>
                <a href="/auth/login?next=/settings">
                  <LogIn />
                  {t('signIn')}
                </a>
              </Button>
            )}
          </div>

          {editor && (
            <>
              {!configLoading && (
                <div className="flex flex-col gap-2">
                  <Label>{t('language')}</Label>
                  <Select onValueChange={handleLanguageChange} value={config?.language}>
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
            </>
          )}
        </PageLayout>
      </main>
    </div>
  )
}
