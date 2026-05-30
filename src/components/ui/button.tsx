import * as React from 'react'
import { cn } from '../../lib/utils'

type ButtonVariant = 'default' | 'secondary' | 'ghost'
type ButtonSize = 'default' | 'sm'

const buttonVariantStyles: Record<ButtonVariant, string> = {
  default:
    'bg-[color:var(--arctic-willow)] text-[color:var(--long-black)] hover:brightness-95 shadow-[0_12px_30px_-18px_rgba(29,13,18,0.95)]',
  secondary: 'bg-[color:var(--winter-coat)] text-[color:var(--long-black)] hover:bg-[color:var(--frozen-juniper)]',
  ghost: 'bg-transparent text-[color:var(--long-black)] hover:bg-[color:var(--winter-coat)]/60',
}

const buttonSizeStyles: Record<ButtonSize, string> = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 px-3 text-sm',
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = 'default', size = 'default', ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--arctic-willow)/70 focus-visible:ring-offset-2 focus-visible:ring-offset-(--flat-white) disabled:pointer-events-none disabled:opacity-60',
      buttonVariantStyles[variant],
      buttonSizeStyles[size],
      className,
    )}
    {...props}
  />
))
Button.displayName = 'Button'

export { Button }

