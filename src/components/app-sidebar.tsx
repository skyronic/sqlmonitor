import { Plus, LayoutDashboard, Network, Database, MoreHorizontal, Edit, Trash } from "lucide-react"
import { usePage } from '../store/PageContext';
import { useListConnections } from '../store/backend';

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
  SidebarGroupAction,
  SidebarMenuAction,
} from "@/components/ui/sidebar"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
 
export function AppSidebar() {
  const { currentPage, setPage } = usePage();
  const { data: connections = [] } = useListConnections();

  const isCollectionActive = (id: number) => {
    return currentPage.type === 'collection' && currentPage.collectionId === id.toString();
  }

  const handleAddCollection = () => {
    // This is a noop for now as requested
    console.log('Add collection clicked');
  }

  const handleEditCollection = (id: number) => {
    // This is a noop for now as requested
    console.log('Edit collection clicked', id);
  }

  const handleDeleteCollection = (id: number) => {
    // This is a noop for now as requested
    console.log('Delete collection clicked', id);
  }

  return (
    <Sidebar>
      <SidebarHeader className="">
        <h1 className="m-2">SQLMonitor</h1>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            Collections
          </SidebarGroupLabel>
          <SidebarGroupAction onClick={handleAddCollection}>
            <Plus /> <span className="sr-only">Add Collection</span>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {connections.map((connection) => (
                <SidebarMenuItem key={connection.id}>
                  <SidebarMenuButton 
                    isActive={isCollectionActive(connection.id)}
                    onClick={() => setPage({ type: 'collection', collectionId: connection.id.toString() })}
                  >
                    <Database />
                    <span>{connection.name}</span>
                  </SidebarMenuButton>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuAction>
                        <MoreHorizontal />
                      </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start">
                      <DropdownMenuItem onClick={() => handleEditCollection(connection.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit Collection</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteCollection(connection.id)}>
                        <Trash className="mr-2 h-4 w-4" />
                        <span>Delete Collection</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
