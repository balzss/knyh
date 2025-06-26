import { useState } from 'react'
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
import { Input } from '@/components/ui/input'

type TotalTimeDialogProps = {
  trigger: React.ReactNode
  totalTimeValue: string
  onTotalTimeValueChange: (newValue: string) => void
}

export function TotalTimeDialog({
  trigger,
  totalTimeValue,
  onTotalTimeValueChange,
}: TotalTimeDialogProps) {
  const [open, setOpen] = useState<boolean>(false)
  const [hours, setHours] = useState<string>('')
  const [minutes, setMinutes] = useState<string>('')
  const handleOpenChange = (prevOpen: boolean) => {
    setOpen(prevOpen)
    if (!prevOpen) {
      const splitTotalTime = totalTimeValue.split(':')
      setHours(splitTotalTime[0])
      setMinutes(splitTotalTime[1])
    }
  }

  const handleSetValue = () => {
    onTotalTimeValueChange(`${hours}:${minutes}`)
    setOpen(false)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSetValue()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-11/12 sm:max-w-lg rounded-lg">
        <DialogHeader>
          <DialogTitle>Set total time</DialogTitle>
          <DialogDescription>How long it takes from start to finish</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-3">
          <div className="flex gap-3">
            <div className="flex flex-col gap-2 flex-grow">
              <Label>Hours</Label>
              <Input
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                onKeyDown={handleInputKeyDown}
                type="number"
              />
            </div>
            <div className="flex flex-col gap-2 flex-grow">
              <Label>Minutes</Label>
              <Input
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                onKeyDown={handleInputKeyDown}
                type="number"
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <DialogClose asChild>
              <Button variant="outline" size="sm">
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleSetValue} size="sm">
              Set
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
