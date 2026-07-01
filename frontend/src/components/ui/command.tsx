"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command as CmdkCommand,
  CommandDialog as CmdkDialog,
  CommandInput as CmdkInput,
  CommandList as CmdkList,
  CommandEmpty as CmdkEmpty,
  CommandGroup as CmdkGroup,
  CommandItem as CmdkItem,
  CommandSeparator as CmdkSeparator,
  CommandLoading as CmdkLoading,
  defaultFilter,
} from "cmdk";

export { defaultFilter };

const Command = React.forwardRef<
  React.ComponentRef<typeof CmdkCommand>,
  React.ComponentPropsWithoutRef<typeof CmdkCommand>
>(({ className, ...props }, ref) => (
  <CmdkCommand
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-xl bg-popover text-popover-foreground",
      className
    )}
    {...props}
  />
));
Command.displayName = "Command";

const CommandDialog = ({
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof CmdkDialog>) => {
  return (
    <CmdkDialog {...props}>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
        <div className="w-full max-w-[640px] overflow-hidden rounded-xl border border-border/60 bg-popover shadow-2xl backdrop-blur-md">
          {children}
        </div>
      </div>
    </CmdkDialog>
  );
};
CommandDialog.displayName = "CommandDialog";

const CommandInput = React.forwardRef<
  React.ComponentRef<typeof CmdkInput>,
  React.ComponentPropsWithoutRef<typeof CmdkInput>
>(({ className, ...props }, ref) => (
  <div
    className="flex items-center border-b border-border/60 px-4"
    cmdk-input-wrapper=""
  >
    <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground/60" />
    <CmdkInput
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-xl bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground/50 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  </div>
));
CommandInput.displayName = "CommandInput";

const CommandList = React.forwardRef<
  React.ComponentRef<typeof CmdkList>,
  React.ComponentPropsWithoutRef<typeof CmdkList>
>(({ className, ...props }, ref) => (
  <CmdkList
    ref={ref}
    className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden p-1", className)}
    {...props}
  />
));
CommandList.displayName = "CommandList";

const CommandEmpty = React.forwardRef<
  React.ComponentRef<typeof CmdkEmpty>,
  React.ComponentPropsWithoutRef<typeof CmdkEmpty>
>(({ className, ...props }, ref) => (
  <CmdkEmpty
    ref={ref}
    className={cn("py-6 text-center text-sm text-muted-foreground", className)}
    {...props}
  />
));
CommandEmpty.displayName = "CommandEmpty";

const CommandGroup = React.forwardRef<
  React.ComponentRef<typeof CmdkGroup>,
  React.ComponentPropsWithoutRef<typeof CmdkGroup>
>(({ className, ...props }, ref) => (
  <CmdkGroup
    ref={ref}
    className={cn(
      "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground/60 [&_[cmdk-group-heading]]:uppercase",
      className
    )}
    {...props}
  />
));
CommandGroup.displayName = "CommandGroup";

const CommandItem = React.forwardRef<
  React.ComponentRef<typeof CmdkItem>,
  React.ComponentPropsWithoutRef<typeof CmdkItem>
>(({ className, ...props }, ref) => (
  <CmdkItem
    ref={ref}
    className={cn(
      "relative flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm outline-none select-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      className
    )}
    {...props}
  />
));
CommandItem.displayName = "CommandItem";

const CommandSeparator = React.forwardRef<
  React.ComponentRef<typeof CmdkSeparator>,
  React.ComponentPropsWithoutRef<typeof CmdkSeparator>
>(({ className, ...props }, ref) => (
  <CmdkSeparator
    ref={ref}
    className={cn("-mx-1 h-px bg-border/60", className)}
    {...props}
  />
));
CommandSeparator.displayName = "CommandSeparator";

const CommandLoading = CmdkLoading;

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandLoading,
};
