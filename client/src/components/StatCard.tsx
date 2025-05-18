import React from "react";

interface StatCardProps {
  value: string | number;
  label: string;
  color: "success" | "error" | "gray";
}

export default function StatCard({ value, label, color }: StatCardProps) {
  const getColorClass = (color: string) => {
    switch (color) {
      case "success":
        return "text-success";
      case "error":
        return "text-error";
      default:
        return "text-gray-800";
    }
  };

  return (
    <div className="text-center p-3 bg-gray-50 rounded-lg">
      <div className={`text-2xl font-bold ${getColorClass(color)}`}>{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}
