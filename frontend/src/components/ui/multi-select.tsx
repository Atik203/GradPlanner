"use client";

import React, { useState } from "react";
import { Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export function MultiSelect({ options, selected, onChange, placeholder = "Select..." }: MultiSelectProps) {
  const [search, setSearch] = useState("");

  const filteredOptions = options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()));

  const handleSelect = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const handleClear = () => {
    onChange([]);
    setSearch("");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center justify-between w-full h-11 px-3 py-2 bg-background border border-border/60 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
        <div className="flex items-center gap-2 overflow-hidden">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="truncate">
            {selected.length === 0 ? placeholder : `${selected.length} Selected`}
          </span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[240px] max-h-[400px] overflow-hidden flex flex-col p-1">
        <div className="p-2">
          <Input 
            placeholder="Search countries..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-sm"
            onKeyDown={(e) => e.stopPropagation()} // Prevent dropdown from closing on typing space
          />
        </div>
        <DropdownMenuSeparator />
        <div className="overflow-y-auto flex-1 max-h-[250px]">
          {filteredOptions.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground">No matches found.</div>
          ) : (
            filteredOptions.map((opt) => (
              <DropdownMenuCheckboxItem
                key={opt}
                checked={selected.includes(opt)}
                onCheckedChange={() => handleSelect(opt)}
                className="text-sm cursor-pointer"
                onSelect={(e) => e.preventDefault()}
              >
                {opt}
              </DropdownMenuCheckboxItem>
            ))
          )}
        </div>
        {selected.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-1">
              <button 
                onClick={handleClear}
                className="w-full text-xs text-center text-muted-foreground hover:text-foreground py-1.5 transition-colors rounded-sm hover:bg-muted"
              >
                Clear Filters
              </button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
