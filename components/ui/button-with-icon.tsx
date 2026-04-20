import type { ComponentProps } from "react"
import type { LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

type ButtonWithIconProps = ComponentProps<typeof Button> & {
  icon: LucideIcon
}

function ButtonWithIcon({ icon: Icon, children, ...props }: ButtonWithIconProps) {
  return (
    <Button {...props}>
      <Icon data-icon="inline-start" aria-hidden="true" />
      {children}
    </Button>
  )
}

export { ButtonWithIcon }
