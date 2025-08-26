import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Mail } from 'lucide-react'
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
import { TextInput, myToast } from '@/components/custom'
import { changeEmail } from '@/lib/auth-client'

type EmailChangeDialogProps = {
  email: string
}

export function EmailChangeDialog({ email }: EmailChangeDialogProps) {
  const t = useTranslations('EmailChangeDialog')
  const [open, setOpen] = useState<boolean>(false)
  const [newEmail, setNewEmail] = useState<string>(email)

  const handleOpenChange = (prevOpen: boolean) => {
    setOpen(prevOpen)
    if (!prevOpen) setNewEmail(email)
  }

  const handleUpdateEmail = () => {
    changeEmail(
      { newEmail },
      {
        onSuccess: () => {
          setOpen(false)
          myToast({ message: 'Email successfully updated!' })
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Mail />
          {email}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-11/12 sm:max-w-lg rounded-lg">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-3">
          <div className="flex gap-3">
            <TextInput value={newEmail} onValueChange={(_e, newValue) => setNewEmail(newValue)} />
          </div>
          <div className="flex gap-3 justify-end">
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setNewEmail('')}>
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleUpdateEmail} disabled={email === newEmail}>
              Update
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
