"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CalendarOff, Plus, X } from "lucide-react";
import { format, isSameDay } from "date-fns";

interface LeaveDay {
  date: Date;
  reason: string;
}

interface LeaveCalendarProps {
  leaveDays: LeaveDay[];
  onAddLeave: (date: Date, reason: string) => void;
  onRemoveLeave: (date: Date) => void;
  isLoading?: boolean;
}

export function LeaveCalendar({
  leaveDays,
  onAddLeave,
  onRemoveLeave,
  isLoading = false,
}: LeaveCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [reason, setReason] = useState("");

  const leaveDateSet = new Set(
    leaveDays.map((ld) => format(new Date(ld.date), "yyyy-MM-dd"))
  );

  const handleAdd = () => {
    if (selectedDate) {
      onAddLeave(selectedDate, reason);
      setReason("");
      setSelectedDate(undefined);
    }
  };

  const isLeaveDay = (date: Date) => {
    return leaveDateSet.has(format(date, "yyyy-MM-dd"));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarOff className="h-5 w-5" />
            Mark Leave
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => date < new Date() || isLeaveDay(date)}
            modifiers={{ leave: (date) => isLeaveDay(date) }}
            modifiersClassNames={{ leave: "bg-red-100 text-red-800" }}
            className="rounded-md border"
          />
          {selectedDate && (
            <div className="space-y-3 pt-2">
              <div className="space-y-2">
                <Label htmlFor="leave-reason">Reason (optional)</Label>
                <Input
                  id="leave-reason"
                  placeholder="e.g., Conference, Personal"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
              <Button
                onClick={handleAdd}
                className="w-full"
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Mark {format(selectedDate, "MMM d, yyyy")} as Leave
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upcoming Leave Days</CardTitle>
        </CardHeader>
        <CardContent>
          {leaveDays.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No leave days scheduled
            </p>
          ) : (
            <div className="space-y-2">
              {leaveDays
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((leave, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {format(new Date(leave.date), "EEEE, MMM d, yyyy")}
                      </p>
                      {leave.reason && (
                        <p className="text-sm text-muted-foreground">
                          {leave.reason}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500"
                      onClick={() => onRemoveLeave(new Date(leave.date))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
