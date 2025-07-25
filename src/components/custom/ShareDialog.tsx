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
  recipeUrl: string
}

export function ShareDialog({ trigger, recipeId, recipeUrl }: ShareDialogProps) {
  const handleCopyUrl = () => {
    myToast({ message: 'URL copied to clipboard' })
    navigator.clipboard.writeText(recipeUrl || '')
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: recipeId,
          url: recipeUrl,
        })
        .catch((error) => console.error('Error sharing:', error))
    } else {
      console.log('Web Share API not supported in this browser.')
    }
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
            <Input
              defaultValue={recipeUrl}
              readOnly
              inputMode="none"
              className=" selection:bg-primary selection:text-black focus-visible:ring-0"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={handleCopyUrl} size="sm">
              <Clipboard />
              Copy
            </Button>
            <Button onClick={handleShare} size="sm" variant="outline">
              <Share />
              Share via device
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
