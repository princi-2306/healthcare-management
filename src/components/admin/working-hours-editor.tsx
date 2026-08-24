"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Clock } from "lucide-react";

interface WorkingHour {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface WorkingHoursEditorProps {
  workingHours: WorkingHour[];
  onChange: (hours: WorkingHour[]) => void;
}

const DAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday",
];

export function WorkingHoursEditor({
  workingHours,
  onChange,
}: WorkingHoursEditorProps) {
  const addHours = (dayOfWeek: number) => {
    onChange([
      ...workingHours,
      { dayOfWeek, startTime: "09:00", endTime: "17:00", isActive: true },
    ]);
  };

  const updateHours = (index: number, field: string, value: string | boolean) => {
    const updated = [...workingHours];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeHours = (index: number) => {
    onChange(workingHours.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Working Hours
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {DAYS.map((day, dayIndex) => {
          const dayHours = workingHours
            .map((wh, originalIndex) => ({ ...wh, originalIndex }))
            .filter((wh) => wh.dayOfWeek === dayIndex);

          return (
            <div key={day} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <Label className="font-medium">{day}</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addHours(dayIndex)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Shift
                </Button>
              </div>

              {dayHours.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hours set — day off</p>
              ) : (
                <div className="space-y-2">
                  {dayHours.map((wh) => (
                    <div
                      key={wh.originalIndex}
                      className="flex items-center gap-3"
                    >
                      <Input
                        type="time"
                        value={wh.startTime}
                        onChange={(e) =>
                          updateHours(wh.originalIndex, "startTime", e.target.value)
                        }
                        className="w-32"
                      />
                      <span className="text-muted-foreground">to</span>
                      <Input
                        type="time"
                        value={wh.endTime}
                        onChange={(e) =>
                          updateHours(wh.originalIndex, "endTime", e.target.value)
                        }
                        className="w-32"
                      />
                      <Badge
                        variant={wh.isActive ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() =>
                          updateHours(wh.originalIndex, "isActive", !wh.isActive)
                        }
                      >
                        {wh.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500"
                        onClick={() => removeHours(wh.originalIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
