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
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Dashboard Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onEditDashboard}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onDeleteDashboard} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Dashboard
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}; 