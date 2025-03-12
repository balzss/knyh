import Link from 'next/link'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { X, Tag, ChevronRight, Settings, Archive, FilePlus, ShoppingCart } from 'lucide-react'
import { placeholderTags } from '@/lib/mock-data'

type AppSidebarProps = {
  path?: string
}

const sidebarItems = [
  {
    displayName: 'Tags',
    icon: <Tag/>,
    subItems: Object.values(placeholderTags).map(({displayName}) => {
      return {
        displayName,
        href: '#'
      }
    })
  },
  {
    displayName: 'Shopping List',
    icon: <ShoppingCart/>,
    href: '/shopping-list'
  },
  {
    displayName: 'Archive',
    icon: <Archive/>,
    href: '/archive'
  },
  {
    displayName: 'Settings',
    icon: <Settings/>,
    href: '/settings'
  },
]

export function AppSidebar({
  path
}: AppSidebarProps) {
  const {
    isMobile,
    toggleSidebar,
  } = useSidebar()

  return (
    <Sidebar className="fixed">
      {isMobile && (
        <SidebarHeader className="p-2">
          <div className="flex justify-between items-center">
            <Link className="text-2xl font-bold mx-4 focus:ring-2 focus:ring-primary focus:outline-none focus:ring-offset-2 focus:ring-offset-background focus:rounded-md" href="/">
              KONYHA
            </Link>
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <X />
            </Button>
          </div>
        </SidebarHeader >
      )}
      <SidebarContent className={ isMobile ? '' : 'mt-16' }>
        <SidebarGroup>
        <div className="mb-4">
          <Button variant="default" className="font-bold py-4 px-3">
            <FilePlus/>
            <span>Add Recipe</span>
          </Button>
        </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => {
                  if (item.subItems) {
                    return (
                      <Collapsible
                        key={item.displayName}
                        asChild
                        defaultOpen={true}
                        className="group/collapsible"
                      >
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton>
                              {item.icon}
                              <span>{item.displayName}</span>
                              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                            <CollapsibleContent>
                              <SidebarMenuSub>
                                {item.subItems.map((subItem) => (
                                  <SidebarMenuSubItem key={subItem.displayName}>
                                    <SidebarMenuSubButton asChild>
                                      <a href={subItem.href}>
                                        <span>{subItem.displayName}</span>
                                      </a>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>       
                    )
                  }

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={path === item.href}>
                        <a href={item.href}>
                          {item.icon}
                          <span>{item.displayName}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      </Sidebar>
  )
}
