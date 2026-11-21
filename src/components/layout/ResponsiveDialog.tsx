import { createContext, useContext, useEffect, useState, type ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'

/** A dialog on larger screens and a bottom drawer on phones, with the same parts either way */
const MobileContext = createContext(false)

/** Height of the on-screen keyboard and the visible area above it, tracked from the visual viewport */
function useKeyboardInset() {
  const [inset, setInset] = useState({ keyboard: 0, visibleHeight: window.innerHeight })

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const update = () =>
      setInset({
        keyboard: Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop)),
        visibleHeight: vv.height,
      })
    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [])

  return inset
}

export function ResponsiveDialog(props: ComponentProps<typeof Dialog>) {
  const isMobile = useIsMobile()
  const Root = isMobile ? Drawer : Dialog
  return (
    <MobileContext.Provider value={isMobile}>
      <Root {...props} {...(isMobile && { shouldScaleBackground: false, repositionInputs: false })} />
    </MobileContext.Provider>
  )
}

export function ResponsiveDialogTrigger(props: ComponentProps<typeof DialogTrigger>) {
  const Trigger = useContext(MobileContext) ? DrawerTrigger : DialogTrigger
  return <Trigger {...props} />
}

export function ResponsiveDialogClose(props: ComponentProps<typeof DialogClose>) {
  const Close = useContext(MobileContext) ? DrawerClose : DialogClose
  return <Close {...props} />
}

export function ResponsiveDialogContent({
  className,
  children,
  ...props
}: ComponentProps<typeof DialogContent>) {
  const isMobile = useContext(MobileContext)
  const { keyboard, visibleHeight } = useKeyboardInset()
  if (isMobile) {
    // The content is portaled, but React events still bubble to the trigger's ancestors (e.g. the
    // recipe card's long-press and selection handlers), so stop them here.
    return (
      <DrawerContent
        {...props}
        // Sit on top of the keyboard and never grow past the visible area (clear of the status bar)
        style={{
          bottom: keyboard,
          maxHeight: `calc(${visibleHeight}px - env(safe-area-inset-top) - 1rem)`,
          ...props.style,
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Header and body supply their own padding, so the footer can clear the home indicator */}
        <div
          className="min-h-0 overflow-y-auto"
          style={{ paddingBottom: keyboard ? 0 : 'env(safe-area-inset-bottom)' }}
        >
          {children}
        </div>
      </DrawerContent>
    )
  }
  return (
    <DialogContent
      {...props}
      className={cn('w-11/12 sm:max-w-lg rounded-lg', className)}
      onClick={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {children}
    </DialogContent>
  )
}

export function ResponsiveDialogHeader(props: ComponentProps<typeof DialogHeader>) {
  const Header = useContext(MobileContext) ? DrawerHeader : DialogHeader
  return <Header {...props} />
}

export function ResponsiveDialogTitle(props: ComponentProps<typeof DialogTitle>) {
  const Title = useContext(MobileContext) ? DrawerTitle : DialogTitle
  return <Title {...props} />
}

export function ResponsiveDialogDescription(props: ComponentProps<typeof DialogDescription>) {
  const Description = useContext(MobileContext) ? DrawerDescription : DialogDescription
  return <Description {...props} />
}

/** Body padding: the drawer has none of its own, the dialog already pads its content */
export function ResponsiveDialogBody({ className, ...props }: ComponentProps<'div'>) {
  const isMobile = useContext(MobileContext)
  return <div className={cn(isMobile && 'px-4 pb-4', className)} {...props} />
}
