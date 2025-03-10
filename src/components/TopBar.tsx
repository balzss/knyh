import { useState, useEffect } from 'react'
import { Menu, SlidersHorizontal, Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'


type TopBarProps = {
  onSidebarToggle: () => void
  onSearchQueryChange: (searchQuery: string) => void
}

export function TopBar({
  onSidebarToggle = () => {},
  onSearchQueryChange = () => {},
}: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState<string>('')
  const {
    isMobile,
  } = useSidebar()

  useEffect(() => {
    onSearchQueryChange(searchQuery)
  }, [searchQuery, onSearchQueryChange])

  return (
    <nav className="fixed top-0 right-0 w-full z-50 flex items-center p-2 border-b bg-background gap-2">
      <Button variant="ghost" size="icon" onClick={onSidebarToggle}>
        <Menu />
      </Button>

      {!isMobile && (
        <span className="text-2xl font-bold mx-12">
          KONYHA
        </span>
      )}

      <div className="flex-1 relative flex items-center max-w-2xl ml-1">
        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
        <Input
          placeholder="Search"
          className=" px-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 transform p-3 rounded-full"
            onClick={() => setSearchQuery('')}
          >
            <X/>
          </Button>
        )}
      </div>

      <Button variant="ghost" size="icon">
        <SlidersHorizontal/>
      </Button>

      <Avatar className="ml-auto mr-1">
        <AvatarImage src="" alt="SB" />
        <AvatarFallback>SB</AvatarFallback>
      </Avatar>
    </nav>
  );
}

