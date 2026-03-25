import * as React from "react";
import { cn } from "@/lib/utils";

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <table
    ref={ref}
    className={cn(
      "w-full border-collapse font-inter text-xs sm:text-sm",
      className
    )}
    {...props}
  />
));
Table.displayName = "Table";

const TableContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    /** Enable vertical scroll with max height (e.g. "60vh"). Only table scrolls, not the page. */
    scrollableY?: string;
  }
>(({ className, scrollableY, children, style, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "w-full overflow-x-auto rounded-sm border border-gray-200 bg-white shadow-sm overflow-hidden",
      scrollableY && "overflow-y-auto",
      className
    )}
    style={scrollableY ? { ...style, maxHeight: scrollableY } : style}
    {...props}
  >
    {children}
  </div>
));
TableContainer.displayName = "TableContainer";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("border-b border-gray-200 bg-gray-50", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn(className)} {...props} />
));
TableBody.displayName = "TableBody";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn("group border-b border-gray-100 hover:bg-gray-50 transition-colors", className)}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement> & { align?: "left" | "right" | "center" }
>(({ className, align = "left", ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "whitespace-nowrap px-4 py-3 text-[10px] sm:text-xs font-semibold text-[#595a5d] uppercase tracking-wide",
      align === "right" && "text-right",
      align === "center" && "text-center",
      align === "left" && "text-left",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & { align?: "left" | "right" | "center" }
>(({ className, align = "left", ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "px-4 py-3 text-[11px] sm:text-sm text-slate-600",
      align === "right" && "text-right",
      align === "center" && "text-center",
      align === "left" && "text-left",
      className
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

export { Table, TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell };