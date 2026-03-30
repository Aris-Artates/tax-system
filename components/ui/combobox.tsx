'use client';

/**
 * Combobox — shadcn/ui-style searchable select using Radix UI Popover.
 *
 * Uses `radix-ui` umbrella package (Popover primitive) for proper viewport-aware
 * positioning. No `cmdk` dependency required — filtering is done inline.
 *
 * Props:
 *   label           — field label shown above the trigger (optional)
 *   placeholder     — trigger text when nothing is selected
 *   searchPlaceholder — text inside the search input
 *   options         — array of { value, label, sublabel? }
 *   value           — currently selected value (empty string = nothing selected)
 *   onChange        — called with the new value (or '' to clear)
 *   required        — shows red asterisk next to label
 *   disabled        — disables the trigger button
 *   emptyLabel      — message shown when search has no results
 *   className       — class added to the outer wrapper div
 *   triggerClassName — extra classes for the trigger button (use to override text-sm / py-2)
 */

import { useState, useRef, useEffect } from 'react';
import { Popover as PopoverPrimitive } from 'radix-ui';
import { Check, ChevronsUpDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ComboboxOption = {
  value: string;
  label: string;
  /** Optional secondary line (e.g. TIN, PIN) shown below the label */
  sublabel?: string;
};

type ComboboxProps = {
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  emptyLabel?: string;
  className?: string;
  triggerClassName?: string;
  /** If true, hides the search input inside the dropdown. Useful for fewer options. */
  hideSearch?: boolean;
};

export function Combobox({
  label,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  options,
  value,
  onChange,
  required,
  disabled,
  emptyLabel = 'No results found.',
  className,
  triggerClassName,
  hideSearch = false,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered =
    !hideSearch && search.trim()
      ? options.filter((o) =>
          [o.label, o.sublabel ?? '']
            .join(' ')
            .toLowerCase()
            .includes(search.toLowerCase())
        )
      : options;

  const selected = options.find((o) => o.value === value);

  function handleSelect(option: ComboboxOption) {
    onChange(option.value === value ? '' : option.value);
    setOpen(false);
    setSearch('');
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange('');
  }

  // Focus the search input each time the popover opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  return (
    <div className={cn(className)}>
      {label && (
        <label className="font-inter text-xs font-medium text-slate-600">
          {label}
          {required && <span className="ml-1 text-rose-500">*</span>}
        </label>
      )}

      {/*
       * Block wrapper mirrors Field's inner div structure:
       *   Field:   <label> → <div class="mt-1 flex items-center border px-3 py-2">
       *   Combobox: <label> → <div class="mt-1 flex"> → <button class="flex w-full border px-3 py-2">
       * Using a block div (not inline-block) ensures mt-1 creates proper block-level spacing,
       * and `flex` makes the button a flex item so it fills the width without inline-block quirks.
       */}
      <div className={cn('flex', label && 'mt-1')}>
        <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
          <PopoverPrimitive.Trigger asChild>
            <button
              type="button"
              disabled={disabled}
              aria-expanded={open}
              className={cn(
                'flex w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2',
                'font-inter text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200',
                open ? 'border-slate-300' : 'hover:border-slate-300',
                disabled ? 'cursor-not-allowed bg-gray-50 opacity-60' : 'cursor-pointer',
                triggerClassName,
              )}
            >
            <span
              className={cn(
                'truncate text-left',
                !selected ? 'text-slate-400' : 'text-slate-900',
              )}
            >
              {selected ? selected.label : placeholder}
            </span>
            <span className="ml-2 flex shrink-0 items-center gap-0.5 text-slate-400">
              {value && !disabled && (
                <X
                  className="h-3 w-3 hover:text-slate-600"
                  onClick={handleClear}
                  aria-label="Clear selection"
                />
              )}
              <ChevronsUpDown className="h-4 w-4" />
            </span>
          </button>
          </PopoverPrimitive.Trigger>

          <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
              className="z-50 w-(--radix-popover-trigger-width) overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg"
              align="start"
              sideOffset={4}
            >
              {/* Search input */}
              {!hideSearch && (
                <div className="flex items-center border-b border-gray-100 px-3 py-2">
                  <Search className="mr-2 h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full bg-transparent font-inter text-xs text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
              )}

              {/* Option list */}
              <div className="max-h-60 overflow-y-auto p-1">
                {filtered.length === 0 ? (
                  <p className="px-3 py-4 text-center font-inter text-xs text-slate-400">
                    {emptyLabel}
                  </p>
                ) : (
                  filtered.map((option) => {
                    const isSelected = option.value === value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelect(option)}
                        className={cn(
                          'flex w-full cursor-pointer items-center gap-2 rounded px-3 py-2 text-left font-inter text-sm transition-colors',
                          isSelected
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-slate-700 hover:bg-gray-50',
                        )}
                      >
                        <Check
                          className={cn(
                            'h-3.5 w-3.5 shrink-0',
                            isSelected ? 'text-blue-600 opacity-100' : 'opacity-0',
                          )}
                        />
                        <span className="flex-1">
                          <span className="block leading-tight">{option.label}</span>
                          {option.sublabel && (
                            <span className="block text-xs text-slate-400">
                              {option.sublabel}
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </PopoverPrimitive.Content>
          </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>
      </div>
    </div>
  );
}
