"use client";

import { useState, useMemo } from "react";
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
import { Combobox } from "@/components/ui/combobox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, FilePlus2, User, FileText, Hash, Bookmark } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface RegisterDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newDoc: any) => void;
}

const CATEGORY_OPTIONS = [
  { value: "Legal", label: "Legal Documents" },
  { value: "Administrative", label: "Administrative" },
  { value: "Financial", label: "Financial Reports" },
  { value: "Correspondence", label: "Correspondence" },
  { value: "Taxation", label: "Taxation Records" },
];

export function RegisterDocumentModal({
  isOpen,
  onClose,
  onSuccess,
}: RegisterDocumentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    refNumber: `DOC-${new Date().getFullYear()}-`,
    date: new Date(),
    subject: "",
    category: "",
    origin: "",
    status: "Received" as const,
  });

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid = useMemo(() => {
    return (
      /^DOC-\d{4}-\d{4}$/.test(form.refNumber) &&
      form.subject.trim() !== "" &&
      form.category !== "" &&
      form.origin.trim() !== ""
    );
  }, [form]);

  const handleSubmit = async () => {
    if (!isFormValid) {
      toast.error("Please fill in all required fields and ensure Reference Number is complete.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ref_number: form.refNumber,
        date_received: format(form.date, "yyyy-MM-dd"),
        subject: form.subject,
        category: form.category,
        origin: form.origin,
        status: form.status,
      };

      const response = await fetch("/api/documents/register/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to register document.");
      }

      toast.success("Document registered successfully!");
      
      // Map back to camelCase for the frontend state update if needed
      const newDoc = {
        id: data.document.id,
        refNumber: data.document.ref_number,
        date: data.document.date_received,
        subject: data.document.subject,
        category: data.document.category,
        origin: data.document.origin,
        status: data.document.status,
      };

      onSuccess(newDoc);
      onClose();
      // Reset form
      setForm({
        refNumber: `DOC-${new Date().getFullYear()}-`,
        date: new Date(),
        subject: "",
        category: "",
        origin: "",
        status: "Received",
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to register document.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] gap-0 p-0 overflow-hidden border-none outline-none shadow-2xl">
        <div className="bg-[#0F172A] p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white/10 p-2 text-white shadow-inner">
              <FilePlus2 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="font-lexend text-xl font-bold tracking-tight">
                Register New Document
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-xs mt-1">
                Enter the official metadata for the incoming or internal document.
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-inter text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Hash className="h-3 w-3" />
                Reference Number
              </label>
              <ValidatedInput
                placeholder="e.g. DOC-2024-0001"
                value={form.refNumber}
                validator="reference-number"
                onChange={(v) => updateField("refNumber", v)}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-inter text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <CalendarIcon className="h-3 w-3" />
                Date Received
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-9 border-slate-200 hover:bg-slate-50 transition-colors",
                      !form.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                    {form.date ? format(form.date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.date}
                    onSelect={(date) => date && updateField("date", date)}
                    initialFocus
                    className="rounded-md border bg-white"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-inter text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Bookmark className="h-3 w-3" />
              Category
            </label>
            <Combobox
              options={CATEGORY_OPTIONS}
              value={form.category}
              onChange={(v) => updateField("category", v)}
              placeholder="Select Category"
              triggerClassName="w-full border-slate-200"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-inter text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <FileText className="h-3 w-3" />
              Subject / Title
            </label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Brief description of the document..."
              value={form.subject}
              onChange={(e) => updateField("subject", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-inter text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <User className="h-3 w-3" />
              Origin / Sender
            </label>
            <ValidatedInput
              placeholder="Office or Individual Name"
              value={form.origin}
              validator="text"
              onChange={(v) => updateField("origin", v)}
            />
          </div>
        </div>

        <DialogFooter className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-end gap-3 sm:gap-0">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="font-inter text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-200"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSubmitting || !isFormValid}
            onClick={handleSubmit}
            className="font-inter bg-[#0F172A] hover:bg-slate-800 text-xs font-semibold px-6 shadow-lg shadow-slate-900/10 transition-all active:scale-95"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                Registering...
              </span>
            ) : (
              "Register Document"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
