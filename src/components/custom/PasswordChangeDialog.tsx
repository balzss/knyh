import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { RotateCcwKey, Eye, EyeOff } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { changePassword } from '@/lib/auth-client'
import { myToast } from '@/components/custom/myToast'

type PasswordChangeDialogProps = {
  children?: React.ReactNode
}

export function PasswordChangeDialog({ children }: PasswordChangeDialogProps) {
  const t = useTranslations('PasswordChangeDialog')
  const [open, setOpen] = useState<boolean>(false)
  const [currentPassword, setCurrentPassword] = useState<string>('')
  const [newPassword, setNewPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false)
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleOpenChange = (prevOpen: boolean) => {
    setOpen(prevOpen)
    if (!prevOpen) {
      // Reset form when closing
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowCurrentPassword(false)
      setShowNewPassword(false)
      setShowConfirmPassword(false)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword.trim()) {
      myToast({ message: t('currentPasswordRequired') })
      return
    }

    if (!newPassword.trim()) {
      myToast({ message: t('newPasswordRequired') })
      return
    }

    if (newPassword.length < 6) {
      myToast({ message: t('passwordTooShort') })
      return
    }

    if (newPassword !== confirmPassword) {
      myToast({ message: t('passwordsDoNotMatch') })
      return
    }

    setIsLoading(true)

    try {
      await changePassword({
        currentPassword,
        newPassword,
      })

      myToast({ message: t('passwordChanged') })
      setOpen(false)
    } catch (error) {
      console.error('Password change error:', error)
      myToast({ message: t('passwordChangeError') })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleChangePassword()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline">
            <RotateCcwKey />
            {t('changePassword')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-11/12 sm:max-w-lg rounded-lg">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-3">
          <div className="grid gap-2">
            <Label htmlFor="current-password">{t('currentPassword')}</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                onKeyDown={handleInputKeyDown}
                disabled={isLoading}
                autoComplete="current-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                disabled={isLoading}
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-password">{t('newPassword')}</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onKeyDown={handleInputKeyDown}
                disabled={isLoading}
                autoComplete="new-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
                disabled={isLoading}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirm-password">{t('confirmPassword')}</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={handleInputKeyDown}
                disabled={isLoading}
                autoComplete="new-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <DialogClose asChild>
              <Button variant="outline" disabled={isLoading}>
                {t('cancel')}
              </Button>
            </DialogClose>
            <Button onClick={handleChangePassword} disabled={isLoading}>
              {isLoading ? t('changing') : t('change')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
