"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ValidatedInput } from "@/components/ui/ValidatedInput";

interface Permission {
  id: number;
  name: string;
  description?: string;
}

interface PermissionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  permission?: Permission | null; 
}

export function PermissionDialog({
  isOpen,
  onClose,
  onSuccess,
  permission,
}: PermissionDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (permission) {
      setName(permission.name);
      setDescription(permission.description || "");
    } else {
      setName("");
      setDescription("");
    }
  }, [permission, isOpen]);

  const handleScrubbedChange = (val: string) => {
    const clean = val.replace(/[^a-zA-Z0-9 .\_\-']/g, ""); 
    setName(clean);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setIsSubmitting(true);
    const endpoint = permission
      ? "/api/permissions/update"
      : "/api/permissions/create";
    const payload = permission
      ? { id: permission.id, name, description }
      : { name, description };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Failed to save permission", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-425px rounded-xl">
        <DialogHeader>
          <DialogTitle className="font-lexend text-xl">
            {permission ? "Edit Permission" : "Add Permission"}
          </DialogTitle>
          <DialogDescription className="font-inter">
            {permission
              ? "Update the permission name."
              : "Create a new system access level."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <ValidatedInput
            label="Permission Name"
            value={name}
            onChange={handleScrubbedChange}
            placeholder="e.g. system.manage"
            maxLength={50}
            required
            validator="permission-&-role-name"
            type="text"
          />
          <div className="mt-4">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe what this permission controls..."
              className="w-full min-h-[80px] rounded-xl border border-slate-200 bg-white p-3 text-xs font-inter focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="font-inter cursor-pointer">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !name}
            className="bg-[#0F172A] hover:bg-slate-800 font-inter text-white cursor-pointer"
          >
            {isSubmitting
              ? "Processing..."
              : permission
                ? "Save Changes"
                : "Add Permission"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
