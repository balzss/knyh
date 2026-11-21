import { useState } from 'react'
import { Clipboard, Share } from 'lucide-react'
import { useTranslations } from 'use-intl'
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from '@/components/layout/ResponsiveDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { myToast } from '@/components/feedback/toast'

type ShareDialogProps = {
  trigger: React.ReactNode
  title: string
  recipeUrl: string
}

export function ShareDialog({ trigger, title, recipeUrl }: ShareDialogProps) {
  const t = useTranslations('ShareDialog')
  const [open, setOpen] = useState(false)
  const handleCopyUrl = () => {
    myToast({ message: t('urlCopied') })
    navigator.clipboard.writeText(recipeUrl || '')
    setOpen(false)
  }

  const canShare = typeof navigator !== 'undefined' && !!navigator.share

  const handleShare = () => {
    navigator
      .share({
        title,
        url: recipeUrl,
      })
      .then(() => setOpen(false))
      .catch((error) => {
        // Dismissing the share sheet rejects with AbortError, which isn't a failure.
        if (error?.name !== 'AbortError') console.error('Error sharing:', error)
      })
  }

  const content = (
    <>
      <Input
        defaultValue={recipeUrl}
        readOnly
        inputMode="none"
        className="min-w-0 truncate text-base sm:text-sm selection:bg-primary selection:text-black focus-visible:ring-0"
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3">
        <Button variant="outline" onClick={handleCopyUrl}>
          <Clipboard />
          {t('copy')}
        </Button>
        {canShare && (
          <Button onClick={handleShare} variant="outline">
            <Share />
            {t('shareViaDevice')}
          </Button>
        )}
      </div>
    </>
  )

  return (
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <ResponsiveDialogTrigger asChild>{trigger}</ResponsiveDialogTrigger>
      <ResponsiveDialogContent
        className="gap-4"
        // Autofocusing the input makes iOS zoom the page, which pushes the fixed dialog partly off screen.
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>{t('title')}</ResponsiveDialogTitle>
          <ResponsiveDialogDescription className="font-medium text-foreground">
            {title}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogBody className="flex flex-col gap-4">{content}</ResponsiveDialogBody>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}
