import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#F29A69] text-white hover:bg-[#E88367] shadow-lg shadow-[#F29A69]/25 hover:shadow-[#E88367]/35",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-[#CFC7C2] bg-[#FAF4EF] text-[#4A454A] hover:bg-[#F5ECE6] hover:border-[#F29A69]/50",
        secondary:
          "bg-[#EFD9CC] text-[#4A454A] hover:bg-[#E8CEBC]",
        ghost: "hover:bg-[#F5ECE6] text-[#7C7472] hover:text-[#4A454A]",
        link: "text-[#F29A69] underline-offset-4 hover:underline",
        glow: "bg-gradient-to-r from-[#F29A69] to-[#E88367] text-white shadow-[0_4px_24px_rgba(242,154,105,0.40)] hover:shadow-[0_4px_36px_rgba(232,131,103,0.55)] hover:opacity-90",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-full px-4 text-xs",
        lg: "h-12 rounded-full px-8 text-base",
        xl: "h-14 rounded-full px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
