import { Network, FolderOpen } from "lucide-react"
import { usePage } from '../store/PageContext';
import { useListCategories } from '../store/backend';
import { AddCategoryAction, CategoryActionsDropdown } from './sidebar-actions';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Separator } from "./ui/separator";
 
export function AppSidebar() {
  const { currentPage, setPage } = usePage();
  const { data: categories = [] } = useListCategories();

  const isCategoryActive = (id: number) => {
    return currentPage.type === 'category' && currentPage.categoryId === id.toString();
  }

  return (
    <Sidebar>
      <SidebarHeader className="">
        <h1 className="m-3 ml-8 text-3xl">SQLMonitor</h1>
      </SidebarHeader>
      <Separator />
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            Dashboards
          </SidebarGroupLabel>
          <AddCategoryAction />
          <SidebarGroupContent>
            <SidebarMenu>
              {categories.map((category) => (
                <SidebarMenuItem key={category.id}>
                  <SidebarMenuButton 
                    isActive={isCategoryActive(category.id)}
                    onClick={() => setPage({ type: 'category', categoryId: category.id.toString() })}
                  >
                    <FolderOpen />
                    <span>{category.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={currentPage.type === 'connections'}
              onClick={() => setPage({ type: 'connections' })}
            >
              <Network />
              <span>Connections</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
