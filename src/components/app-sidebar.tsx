import { Calendar, Home, Inbox, Search, Settings, LayoutDashboard, Network } from "lucide-react"
import { usePage } from '../store/PageContext';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
 
export function AppSidebar() {
  const { setPage } = usePage();

  const items = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      onClick: () => setPage({ type: 'dashboard', dashboardId: 'default' })
    },
    {
      title: 'Connections',
      icon: Network,
      onClick: () => setPage({ type: 'connections' })
    }
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton onClick={item.onClick}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
