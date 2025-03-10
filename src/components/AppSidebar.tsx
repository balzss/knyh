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
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { X, Tag, ChevronRight, Settings, Archive, FilePlus, ShoppingCart } from 'lucide-react'

export function AppSidebar() {
  const {
    isMobile,
    toggleSidebar,
  } = useSidebar()
  return (
    <Sidebar className="fixed">
      {isMobile && (
        <SidebarHeader className="p-2">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold mx-4">
              KONYHA
            </span>
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

              <Collapsible
                asChild
                defaultOpen={true}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <Tag/>
                      <span>Tags</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>

                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <a href="#">
                              <span>magyar</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <a href="#">
                              <span>alaprecept</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#">
                    <ShoppingCart/>
                    <span>Shopping List</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#">
                    <Archive/>
                    <span>Archive</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#">
                    <Settings/>
                    <span>Settings</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      </Sidebar>
  )
}
