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
import { Plus, KeyRound, X, CirclePlus } from "lucide-react";
import { toast } from "sonner";

interface Permission {
  id: number;
  name: string;
  description?: string;
}

interface PermissionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PermissionDialog({
  isOpen,
  onClose,
  onSuccess,
}: PermissionDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setDescription("");
    }
  }, [isOpen]);

  const handleScrubbedChange = (val: string) => {
    const clean = val.replace(/[^a-zA-Z0-9 .\_\-']/g, "");
    setName(clean);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setIsSubmitting(true);
    const endpoint = "/api/permissions/create";
    const payload = { name, description };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSuccess();
        onClose();
        toast.success("Permission created.");
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to create permission.");
      }
    } catch (error) {
      console.error("Failed to create permission", error);
      toast.error("An error occurred while creating.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        overlayClassName="bg-slate-900/40 backdrop-blur-md"
        className="sm:max-w-[360px] rounded-xl overflow-hidden border-none p-0 transition-all duration-300"
      >
        <div className="bg-slate-50 border-b border-slate-100 px-5 py-4">
          <DialogHeader>
            <DialogTitle className="font-lexend text-xl font-bold text-slate-800 flex items-center gap-2">
              <Plus className="w-5 h-5 text-slate-400" />
              Add Permission
            </DialogTitle>
            <DialogDescription className="font-inter text-[11px] text-slate-500 mt-1">
              Create a new system access level and define its scope.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-5 py-4 space-y-4">
          <section>
            <div className="flex items-center gap-1.5 mb-3 border-b border-slate-100">
              <h3 className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 font-lexend mb-1">
                <KeyRound className="w-3.5 h-3.5 text-blue-500" />
                <p>Configuration</p>
              </h3>
            </div>
            <div className="space-y-4">
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
              <div>
                <label className="font-inter text-[11px] font-semibold text-slate-600 mb-1.5 block">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe what this permission controls..."
                  className="w-full min-h-[85px] rounded-xl border border-slate-200 bg-white p-3 text-xs font-inter focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none shadow-sm"
                />
              </div>
            </div>
          </section>
        </div>

        <DialogFooter className="bg-slate-50 border-t border-slate-100 px-5 py-3 gap-2">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1 h-10 rounded-lg font-bold text-slate-500 border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all duration-300 text-xs cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !name}
            className="flex-[1.5] bg-[#0F172A] hover:bg-emerald-600 text-white font-bold h-10 text-xs shadow-lg shadow-slate-200 transition-all duration-300 active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              "Syncing..."
            ) : (
              <>
                <CirclePlus className="w-4 h-4" />
                Create Permission
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
