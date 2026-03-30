"use client"

import * as React from "react"

function TooltipProvider({ children }: { children: React.ReactNode; delay?: number }) {
  return <>{children}</>
}

function Tooltip({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function TooltipTrigger({ children, render, ...props }: { children?: React.ReactNode; render?: React.ReactElement }) {
  if (render) return render;
  return <>{children}</>;
}

function TooltipContent({
  children,
  className,
  side,
  align,
  hidden,
  ...props
}: {
  children?: React.ReactNode
  className?: string
  side?: string
  align?: string
  hidden?: boolean
  [key: string]: unknown
}) {
  if (hidden) return null;
  return null;
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
