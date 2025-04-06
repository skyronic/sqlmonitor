import { Play, Pencil, Trash2, Plus, MoreVertical } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MonitorDialog } from './MonitorDialog';
import { useState } from 'react';
import { useUpdateCategory, useDeleteCategory } from '@/store/backend';

interface DashboardHeaderProps {
  title: string;
  description: string | null;
  categoryId: number | null;
  onRunAll: () => void;
  onEditDashboard: () => void;
  onDeleteDashboard: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  description,
  categoryId,
  onRunAll,
  onEditDashboard,
  onDeleteDashboard,
}) => {
  const [isAddMonitorOpen, setIsAddMonitorOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editName, setEditName] = useState(title);
  const [editDescription, setEditDescription] = useState(description || '');

  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const handleEditSubmit = () => {
    if (!categoryId) return;
    
    updateCategory.mutate({
      id: categoryId,
      name: editName,
      description: editDescription || null
    }, {
      onSuccess: () => {
        setIsEditOpen(false);
        onEditDashboard();
      }
    });
  };

  const handleDelete = () => {
    if (!categoryId) return;
    
    deleteCategory.mutate(categoryId, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        onDeleteDashboard();
      }
    });
  };

  return (
    <>
      <div className="px-6 py-3 flex items-center justify-between border-b">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description || 'Monitor your metrics in real-time'}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onRunAll}>
            <Play className="h-4 w-4 mr-2" />
            Run All
          </Button>
          <Button variant="outline" onClick={() => setIsAddMonitorOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Monitor
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger><MoreVertical className="h-4 w-4" /></DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsDeleteOpen(true)} className="text-red-500">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Dashboard
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Dashboard</DialogTitle>
            <DialogDescription>
              Update dashboard details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="col-span-3"
                placeholder="Dashboard description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              onClick={handleEditSubmit}
              disabled={updateCategory.isPending}
            >
              {updateCategory.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Dashboard</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{title}"? This action cannot be undone.
              All associated monitors will no longer be categorized.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-red-500 hover:bg-red-600"
              disabled={deleteCategory.isPending}
            >
              {deleteCategory.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <MonitorDialog 
        open={isAddMonitorOpen} 
        onOpenChange={setIsAddMonitorOpen}
        categoryId={categoryId}
      />
    </>
  );
}; 