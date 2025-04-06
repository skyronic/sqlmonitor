import { Play, Pencil, Trash2, Plus, MoreVertical } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface DashboardHeaderProps {
  title: string;
  onRunAll: () => void;
  onEditDashboard: () => void;
  onDeleteDashboard: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  onRunAll,
  onEditDashboard,
  onDeleteDashboard,
}) => {
  return (
    <div className="px-6 py-3 flex items-center justify-between border-b">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">Monitor your metrics in real-time</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onRunAll}>
          <Play className="h-4 w-4 mr-2" />
          Run All
        </Button>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Monitor
        </Button>
        <DropdownMenu>
  <DropdownMenuTrigger><MoreVertical className="h-4 w-4" /></DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Billing</DropdownMenuItem>
    <DropdownMenuItem>Team</DropdownMenuItem>
    <DropdownMenuItem>Subscription</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
      </div>
    </div>
  );
}; 