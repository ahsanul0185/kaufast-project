import { cn } from "@/lib/utils";

interface FeatureBadgeProps {
  icon: string;
  label: string;
  variant?: "outline" | "filled" | "primary";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}

export default function FeatureBadge({
  icon,
  label,
  variant = "outline",
  size = "md",
  className,
  onClick
}: FeatureBadgeProps) {
  // Determine size classes
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2"
  };
  
  // Determine variant classes
  const variantClasses = {
    outline: "bg-white text-neutral-800 border border-neutral-300 hover:bg-neutral-100",
    filled: "bg-neutral-100 text-neutral-800",
    primary: "bg-[#131313] text-white"
  };
  
  return (
    <div 
      className={cn(
        "rounded-full flex items-center", 
        sizeClasses[size],
        variantClasses[variant],
        onClick && "cursor-pointer hover:opacity-80",
        className
      )}
      onClick={onClick}
    >
      <i className={`fas ${icon} ${variant === 'primary' ? 'mr-2' : 'mr-1'}`}></i>
      <span>{label}</span>
    </div>
  );
}
