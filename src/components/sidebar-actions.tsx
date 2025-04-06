import { useState } from 'react';
import { Plus, Edit, Trash, MoreHorizontal } from "lucide-react";
import { Category } from '../types';
import { useAddCategory, useUpdateCategory, useDeleteCategory } from '../store/backend';

import {
  SidebarGroupAction,
  SidebarMenuAction,
} from "@/components/ui/sidebar";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Add Category Component
export function AddCategoryAction() {
  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);
  const addCategory = useAddCategory();
  
  const handleSubmit = () => {
    if (name) {
      addCategory.mutate({
        name,
        description: null
      });
      setName('');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <SidebarGroupAction>
          <Plus /> <span className="sr-only">Add Dashboard</span>
        </SidebarGroupAction>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Dashboard</DialogTitle>
          <DialogDescription>
            Create a new dashboard.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="My Dashboard"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>
            Add Dashboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Edit Category Component
export function EditCategoryAction({ category }: { category: Category }) {
  const [name, setName] = useState(category.name);
  const [open, setOpen] = useState(false);
  const updateCategory = useUpdateCategory();
  
  const handleSubmit = () => {
    if (name) {
      updateCategory.mutate({
        id: category.id,
        name,
        description: category.description
      });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Edit className="mr-2 h-4 w-4" />
          <span>Edit Dashboard</span>
        </DropdownMenuItem>
      </DialogTrigger>
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Delete Category Component
export function DeleteCategoryAction({ category }: { category: Category }) {
  const [open, setOpen] = useState(false);
  const deleteCategory = useDeleteCategory();
  
  const handleDelete = () => {
    deleteCategory.mutate(category.id);
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-500">
          <Trash className="mr-2 h-4 w-4" />
          <span>Delete Dashboard</span>
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Dashboard</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{category.name}"? This action cannot be undone.
            All associated monitors will no longer be categorized.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Category Actions Dropdown
export function CategoryActionsDropdown({ category }: { category: Category }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuAction>
          <MoreHorizontal />
        </SidebarMenuAction>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start">
        <EditCategoryAction category={category} />
        <DeleteCategoryAction category={category} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
