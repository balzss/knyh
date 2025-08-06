import { useState } from 'react'
import { Users } from 'lucide-react'
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
import { TextInput } from '@/components/custom'

type YieldDialogProps = {
  yieldValue: string
  onYieldValueChange: (newValue: string) => void
}

export function YieldDialog({ yieldValue, onYieldValueChange }: YieldDialogProps) {
  const [open, setOpen] = useState<boolean>(false)
  const [value, setValue] = useState<string>('')
  const handleOpenChange = (prevOpen: boolean) => {
    setOpen(prevOpen)
    if (!prevOpen) setValue(yieldValue)
  }

  const handleSetValue = () => {
    onYieldValueChange(value)
    setOpen(false)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSetValue()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Users />
          {yieldValue ? (
            <>
              Yield: <span className="font-normal">{yieldValue}</span>
            </>
          ) : (
            'Set yield'
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-11/12 sm:max-w-lg rounded-lg">
        <DialogHeader>
          <DialogTitle>Set the yield amount</DialogTitle>
          <DialogDescription>E.g.: 6 servings, 1 loaf, 500 ml, etc.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-3">
          <div className="flex gap-3">
            <TextInput
              value={value}
              onValueChange={(_e, newValue) => setValue(newValue)}
              clearable
              onKeyDown={handleInputKeyDown}
            />
          </div>
          <div className="flex gap-3 justify-end">
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setValue('')}>
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleSetValue}>Set</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
