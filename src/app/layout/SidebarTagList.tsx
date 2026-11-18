import { useState } from 'react'
import { useTranslations } from 'use-intl'
import { ChevronRight, Pencil, Tags, Trash2 } from 'lucide-react'
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  useSidebar,
} from '@/components/ui/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useTags } from '@/features/tags/use-tags'
import { useTagMutations } from '@/features/tags/use-tag-mutations'
import { RenameTagDialog } from '@/features/tags/RenameTagDialog'
import { useConfirmDialog } from '@/hooks/use-confirm-dialog'
import { myToast } from '@/components/feedback/toast'
import { useEditMode } from '@/app/providers/EditModeProvider'
import { getErrorMessage } from '@/lib/utils'
import { SidebarItemRow } from './SidebarItemRow'
import type { Tag } from '@shared/types'

// Every page mounts its own sidebar, so the open state has to outlive the component
let tagsOpenAcrossPages = false

/** The collapsible list of tags, which the editor can rename and delete */
export function SidebarTagList({ selectedTagIds }: { selectedTagIds: string[] }) {
  const t = useTranslations('Navigation')
  const tTag = useTranslations('TagActions')
  const { isMobile, setOpenMobile } = useSidebar()
  const { editor } = useEditMode()
  const { tags } = useTags()
  const { deleteTag } = useTagMutations()
  const { confirmDelete } = useConfirmDialog()
  const [menuOpenForTag, setMenuOpenForTag] = useState<string | null>(null)
  const [renamingTag, setRenamingTag] = useState<Tag | null>(null)
  // Starts collapsed, unless it was left open or a tag filter is active and its tag should be visible
  const [tagsOpen, setTagsOpen] = useState(tagsOpenAcrossPages || selectedTagIds.length > 0)

  const handleTagsOpenChange = (open: boolean) => {
    tagsOpenAcrossPages = open
    setTagsOpen(open)
  }

  const handleDeleteTag = async ({ id, displayName }: Tag) => {
    setMenuOpenForTag(null)
    const confirmed = await confirmDelete({ name: displayName })
    if (!confirmed) return
    deleteTag.mutate(id, {
      onSuccess: () => {
        myToast({ message: tTag('tagDeleted') })
      },
      onError: (e: unknown) => {
        myToast({ message: getErrorMessage(e, 'Error') })
      },
    })
  }

  return (
    <>
      <Collapsible
        asChild
        open={tagsOpen}
        onOpenChange={handleTagsOpenChange}
        className="group/collapsible"
      >
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton>
              <Tags />
              <span>{t('tags')}</span>
              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {Object.values(tags).map((tag) => (
                <SidebarItemRow
                  alwaysShowActionsOnMobile={false}
                  key={tag.id}
                  href={`/?tag=${tag.id}`}
                  displayName={tag.displayName}
                  isMobile={isMobile}
                  open={menuOpenForTag === tag.id}
                  onOpenChange={(open) => setMenuOpenForTag(open ? tag.id : null)}
                  onNavigate={() => setOpenMobile(false)}
                  isActive={selectedTagIds.includes(tag.id)}
                  actions={
                    !editor
                      ? []
                      : [
                          {
                            key: 'rename',
                            opensDialog: true,
                            label: tTag('renameTag'),
                            icon: <Pencil className="h-4 w-4" />,
                            onSelect: () => {
                              setMenuOpenForTag(null)
                              setRenamingTag({ id: tag.id, displayName: tag.displayName })
                            },
                          },
                          {
                            key: 'delete',
                            opensDialog: true,
                            label: tTag('removeTag'),
                            icon: <Trash2 className="h-4 w-4" />,
                            onSelect: () => handleDeleteTag(tag),
                          },
                        ]
                  }
                />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
      <RenameTagDialog tag={renamingTag} onClose={() => setRenamingTag(null)} />
    </>
  )
}
