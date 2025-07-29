'use client'

import { useRouter } from 'next/navigation'
import { X, Ellipsis } from 'lucide-react'
import { useSidebar } from '@/components/ui/sidebar'
import { TopBar } from '@/components/TopBar'
import { AppSidebar, IconButton } from '@/components/custom'
import FormView from './form-view'
import RawView from './raw-view'

export default function NewPage() {
  const inRawView = true

  const { toggleSidebar } = useSidebar()
  const router = useRouter()

  const handleClosePage = () => {
    if (window.history.length && document.referrer === '') {
      router.back()
    } else {
      router.replace('/')
    }
  }

  return (
    <div className="flex w-full">
      <TopBar
        onSidebarToggle={toggleSidebar}
        hideSidebarToggleMobile
        customTopbarContent={
          <div className="flex items-center gap-2">
            <IconButton
              iconSize="normal"
              variant="ghost"
              icon={<X />}
              tooltip="Close"
              onClick={handleClosePage}
            />
            <span className="mr-auto sm:mr-4 font-bold">New recipe</span>
            <IconButton
              iconSize="normal"
              variant="ghost"
              icon={<Ellipsis />}
              tooltip="More options"
              onClick={() => {}}
            />
          </div>
        }
      />
      <AppSidebar path="/new" />
      <main className="w-full mt-16 mx-auto">{inRawView ? <RawView /> : <FormView />}</main>
    </div>
  )
}
