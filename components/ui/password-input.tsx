"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<React.ComponentProps<typeof Input>, "type">;

function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="relative">
      <Input type={showPassword ? "text" : "password"} className={cn("pr-9", className)} {...props} />
      <button
        type="button"
        className="absolute right-1 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
        aria-label={showPassword ? "Hide password" : "Show password"}
        aria-pressed={showPassword}
        disabled={props.disabled}
        onClick={() => setShowPassword((visible) => !visible)}
      >
        {showPassword ? <EyeOff aria-hidden="true" size={18} /> : <Eye aria-hidden="true" size={18} />}
      </button>
    </div>
  );
}

export { PasswordInput };
