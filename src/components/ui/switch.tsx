"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";

import * as React from "react";

import { cn } from "~/lib/utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-4 w-9 shrink-0 cursor-pointer items-center rounded-sm border-2 border-border bg-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-black data-[state=unchecked]:bg-white",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block h-5.5 w-5.5 rounded-sm data-[state=unchecked]:bg-black data-[state=checked]:bg-white border-2 border-border ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:-translate-x-1",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
