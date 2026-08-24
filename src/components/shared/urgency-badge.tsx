import { Badge } from "@/components/ui/badge";

interface UrgencyBadgeProps {
  level: "low" | "medium" | "high" | "critical" | "";
}

const urgencyConfig = {
  low: {
    label: "Low",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
  },
  medium: {
    label: "Medium",
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  },
  high: {
    label: "High",
    className: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  },
  critical: {
    label: "Critical",
    className: "bg-red-100 text-red-800 hover:bg-red-100",
  },
  "": {
    label: "Unknown",
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  },
};

export function UrgencyBadge({ level }: UrgencyBadgeProps) {
  const normalizedLevel = (level || "").toLowerCase() as keyof typeof urgencyConfig;
  const config = urgencyConfig[normalizedLevel] || urgencyConfig[""];

  return (
    <Badge variant="secondary" className={config.className}>
      {config.label}
    </Badge>
  );
}
