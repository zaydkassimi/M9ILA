"use client"

import * as React from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { PanelLeftIcon } from "lucide-react"

const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_COLLAPSED = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContextProps = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextProps | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }
  return context
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = React.useState(false)
  const [_open, _setOpen] = React.useState(defaultOpen)
  const open = openProp ?? _open

  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value
      if (setOpenProp) {
        setOpenProp(openState)
      } else {
        _setOpen(openState)
      }
      document.cookie = `sidebar_state=${openState}; path=/; max-age=${60 * 60 * 24 * 7}`
    },
    [setOpenProp, open]
  )

  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open)
  }, [isMobile, setOpen, setOpenMobile])

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  return (
    <SidebarContext.Provider
      value={{
        state: open ? "expanded" : "collapsed",
        open,
        setOpen,
        openMobile,
        setOpenMobile,
        isMobile,
        toggleSidebar,
      }}
    >
      <div
        style={
          {
            "--sidebar-width": SIDEBAR_WIDTH,
            "--sidebar-width-collapsed": SIDEBAR_WIDTH_COLLAPSED,
            ...style,
          } as React.CSSProperties
        }
        className={cn("flex min-h-screen w-full", className)}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

function Sidebar({
  side = "left",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "left" | "right"
  collapsible?: "offcanvas" | "icon" | "none"
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()
  const collapsed = state === "collapsed"

  if (collapsible === "none") {
    return (
      <div
        className={cn(
          "flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          side={side}
          className="w-64 bg-sidebar p-0 text-sidebar-foreground"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Navigation</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div
      className={cn(
        "hidden md:flex flex-col h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-200 ease-linear shrink-0",
        collapsed ? "w-12" : "w-64",
        className
      )}
      data-state={state}
      data-collapsible={collapsed ? collapsible : ""}
      {...props}
    >
      {children}
    </div>
  )
}

function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("size-7", className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeftIcon className="size-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}

function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        "absolute inset-y-0 z-20 hidden w-4 cursor-ew-resize sm:flex items-center justify-center",
        "group/sidebar-rail",
        className
      )}
      {...props}
    >
      <div className="absolute inset-y-0 left-1/2 w-[2px] bg-transparent hover:bg-sidebar-border transition-colors" />
    </button>
  )
}

function SidebarInset({ className, children, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      className={cn("flex flex-1 flex-col min-h-screen bg-background", className)}
      {...props}
    >
      {children}
    </main>
  )
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-center", className)}
      {...props}
    />
  )
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mt-auto", className)}
      {...props}
    />
  )
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex-1 overflow-y-auto", className)}
      {...props}
    />
  )
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      className={cn("flex flex-col gap-0.5 px-2", className)}
      {...props}
    />
  )
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      className={cn("list-none", className)}
      {...props}
    />
  )
}

function SidebarMenuButton({
  isActive = false,
  tooltip,
  size = "default",
  className,
  children,
  ...props
}: React.ComponentProps<"button"> & {
  isActive?: boolean
  tooltip?: string
  size?: "default" | "sm" | "lg"
  render?: React.ReactElement
}) {
  const { state } = useSidebar()
  const collapsed = state === "collapsed"

  const sizeClasses = {
    default: "h-8 text-sm",
    sm: "h-7 text-xs",
    lg: "h-10 text-sm",
  }

  const content = (
    <button
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md px-2 text-sidebar-foreground/70 transition-colors",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
        collapsed && "justify-center px-0",
        sizeClasses[size],
        className
      )}
      title={collapsed && tooltip ? tooltip : undefined}
      {...(props as React.ComponentProps<"button">)}
    >
      {children}
    </button>
  )

  // If render prop is provided, clone it with the button's className
  if ((props as any).render) {
    const renderEl = (props as any).render as React.ReactElement
    return React.cloneElement(renderEl, {
      className: cn(
        "flex w-full items-center gap-2.5 rounded-md px-2 text-sidebar-foreground/70 transition-colors",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
        collapsed && "justify-center px-0",
        sizeClasses[size],
        className,
        (renderEl.props as any)?.className
      ),
      title: collapsed && tooltip ? tooltip : undefined,
      children,
    } as any)
  }

  return content
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
}
