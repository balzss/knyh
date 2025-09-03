import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { RotateCcwKey } from 'lucide-react'
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
import { Label } from '@/components/ui/label'
import { TextInput } from '@/components/custom'
import { usePasswordVisibility } from '@/hooks'
import { changePassword } from '@/lib/auth-client'
import { myToast } from '@/components/custom/myToast'

export function PasswordChangeDialog() {
  const t = useTranslations('PasswordChangeDialog')
  const [open, setOpen] = useState<boolean>(false)
  const [currentPassword, setCurrentPassword] = useState<string>('')
  const [newPassword, setNewPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Password visibility hooks for each field
  const currentPasswordVisibility = usePasswordVisibility(currentPassword)
  const newPasswordVisibility = usePasswordVisibility(newPassword)
  const confirmPasswordVisibility = usePasswordVisibility(confirmPassword)

  const handleOpenChange = (prevOpen: boolean) => {
    setOpen(prevOpen)
    if (!prevOpen) {
      // Reset form when closing
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
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
        <Button variant="outline">
          <RotateCcwKey />
          {t('changePassword')}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-11/12 sm:max-w-lg rounded-lg">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-3">
          <div className="grid gap-2">
            <Label htmlFor="current-password">{t('currentPassword')}</Label>
            <TextInput
              id="current-password"
              type={currentPasswordVisibility.inputType}
              value={currentPassword}
              onValueChange={(event, newValue) => setCurrentPassword(newValue)}
              onKeyDown={handleInputKeyDown}
              disabled={isLoading}
              autoComplete="current-password"
              actionButtons={[currentPasswordVisibility.passwordVisibilityButton]}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-password">{t('newPassword')}</Label>
            <TextInput
              id="new-password"
              type={newPasswordVisibility.inputType}
              value={newPassword}
              onValueChange={(event, newValue) => setNewPassword(newValue)}
              onKeyDown={handleInputKeyDown}
              disabled={isLoading}
              autoComplete="new-password"
              actionButtons={[newPasswordVisibility.passwordVisibilityButton]}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirm-password">{t('confirmPassword')}</Label>
            <TextInput
              id="confirm-password"
              type={confirmPasswordVisibility.inputType}
              value={confirmPassword}
              onValueChange={(event, newValue) => setConfirmPassword(newValue)}
              onKeyDown={handleInputKeyDown}
              disabled={isLoading}
              autoComplete="new-password"
              actionButtons={[confirmPasswordVisibility.passwordVisibilityButton]}
            />
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
