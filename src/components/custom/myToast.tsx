import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

type MyToastProps = {
  message: string
  action?: {
    label: string
    onClick: React.MouseEventHandler<HTMLButtonElement>
  }
}

export function myToast({ message, action }: MyToastProps) {
  return toast(
    <div className="flex justify-between w-full items-center font-bold">
      {message}
      {action && (
        <Button size="sm" variant="ghost" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
