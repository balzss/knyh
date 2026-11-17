import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

type MyToastProps = {
  message: string
  /** How long the toast stays, in milliseconds. */
  duration?: number
  action?: {
    label: string
    onClick: React.MouseEventHandler<HTMLButtonElement>
  }
}

export function myToast({ message, action, duration }: MyToastProps) {
  return toast(
    <div className="flex justify-between w-full items-center font-bold">
      {message}
      {action && (
        <Button variant="ghost" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>,
    { duration }
  )
}
