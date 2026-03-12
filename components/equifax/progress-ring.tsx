import { cn } from "@/lib/utils"

interface ProgressRingProps {
  progress: number
  size?: number
  strokeWidth?: number
  className?: string
  color?: string
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 10,
  className,
  color = "text-emerald-500",
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      {/* Background Ring */}
      <svg className="absolute top-0 left-0 -rotate-90 transform" width={size} height={size}>
        <circle
          className="text-slate-100"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress Ring */}
        <circle
          className={cn("transition-all duration-1000 ease-out", color)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {/* Percentage Text */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-black italic tracking-tighter text-slate-900">{Math.round(progress)}%</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Complete</span>
      </div>
    </div>
  )
}
