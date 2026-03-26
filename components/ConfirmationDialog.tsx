"use client";

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
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "success" | "info";
  entityName?: string;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  entityName,
}: ConfirmationDialogProps) {
  const isDanger = variant === "danger";
  const isWarning = variant === "warning";
  const isSuccess = variant === "success";

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[400px]">
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-5">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-lexend text-xl font-bold text-slate-800 flex items-center gap-2">
              <AlertTriangle
                className={cn(
                  "w-5 h-5",
                  isDanger
                    ? "text-rose-500"
                    : isWarning
                      ? "text-amber-500"
                      : isSuccess
                        ? "text-emerald-500"
                        : "text-blue-500",
                )}
              />
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="font-inter text-[11px] text-slate-500 mt-1">
              {description}
              {entityName && (
                <span className="block mt-1 font-semibold text-slate-700 font-lexend text-sm">
                  {entityName}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        <div className="px-6 py-6 ring-1 ring-inset ring-slate-100/50">
          <div
            className={cn(
              "flex items-start gap-3 p-3 rounded-xl border text-[11px] font-inter leading-relaxed",
              isDanger
                ? "bg-rose-50 border-rose-100 text-rose-600"
                : isWarning
                  ? "bg-amber-50 border-amber-100 text-amber-700"
                  : isSuccess
                    ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                    : "bg-blue-50 border-blue-100 text-blue-700",
            )}
          >
            <AlertTriangle
              className={cn(
                "w-4 h-4 shrink-0 mt-0.5",
              )}
            />
            <p className="font-medium">
              {isDanger
                ? "This action is permanent and cannot be undone. Please proceed with caution."
                : isWarning
                  ? "This will move the record to the archives. You can restore it later if needed."
                  : isSuccess
                    ? "This will save current changes."
                    : "This will update the system record."}
            </p>
          </div>
        </div>

        <AlertDialogFooter className="bg-slate-50 border-t border-slate-100 px-6 py-4 gap-2">
          <AlertDialogCancel
            asChild
            className="flex-1 h-10 rounded-lg font-bold text-slate-500 border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-700 transition-all duration-300 text-xs cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            <button onClick={onClose}>
              <X className="w-4 h-4" />
              {cancelText}
            </button>
          </AlertDialogCancel>
          <AlertDialogAction
            asChild
            className={cn(
              "flex-[1.5] text-white font-bold h-10 text-xs transition-all duration-300 active:scale-95 cursor-pointer flex items-center justify-center gap-2 bg-[#0F172A]",
              isDanger
                ? "hover:bg-rose-600"
                : isWarning
                  ? "hover:bg-amber-600"
                  : "hover:bg-emerald-600",
            )}
          >
            <button onClick={onConfirm}>{confirmText}</button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
