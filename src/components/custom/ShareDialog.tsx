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
    myToast({ message: 'Url copied to clipboard' })
    navigator.clipboard.writeText(recipeUrl)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'Share Title',
          text: 'Check out this content!',
          url: 'https://example.com',
        })
        .catch((error) => console.error('Error sharing:', error))
    } else {
      console.log('Web Share API not supported in this browser.')
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-11/12 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Share recipe</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-3">
          <div className="flex gap-3">
            <Input value={recipeUrl} readOnly />
            <Button variant="outline" className="font-bold" onClick={handleCopyUrl}>
              <Clipboard />
              Copy
            </Button>
          </div>
          <Button onClick={handleShare} className="font-bold" size="sm">
            <Share />
            Share via device
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
