import { Clipboard, Share } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { myToast } from '@/components/custom'

type ShareDialogProps = {
  trigger: React.ReactNode
  recipeId: string
}

export function ShareDialog({ trigger, recipeId }: ShareDialogProps) {
  const recipeUrl = `https://example.cooking/${recipeId}`

  const handleCopyUrl = () => {
    myToast({ message: 'URL copied to clipboard' })
    navigator.clipboard.writeText(recipeUrl)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: recipeId,
          url: 'https://example.com',
        })
        .catch((error) => console.error('Error sharing:', error))
    } else {
      console.log('Web Share API not supported in this browser.')
    }
  }

  const handleUrlFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select()
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-11/12 sm:max-w-lg rounded-lg">
        <DialogHeader>
          <DialogTitle>Share recipe</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-3">
          <div className="flex gap-3">
            <Input defaultValue={recipeUrl} readOnly onFocus={handleUrlFocus} inputMode="none" />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" className="font-bold" onClick={handleCopyUrl} size="sm">
              <Clipboard />
              Copy
            </Button>
            <Button onClick={handleShare} className="font-bold" size="sm" variant="outline">
              <Share />
              Share via device
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
