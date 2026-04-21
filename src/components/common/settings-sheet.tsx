import type { ReactNode } from "react"

import { SettingsPanel } from "@/components/common/settings-panel"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

type SettingsSheetProps = {
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function SettingsSheet({ children, open, onOpenChange }: SettingsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="sm:inset-x-auto sm:top-0 sm:right-0 sm:bottom-0 sm:h-full sm:w-[420px] sm:rounded-none sm:rounded-l-[32px]">
        <SheetHeader>
          <SheetTitle>Learning settings</SheetTitle>
          <SheetDescription>Adjust theme and local preferences for your study sessions.</SheetDescription>
        </SheetHeader>
        <SettingsPanel />
      </SheetContent>
    </Sheet>
  )
}
