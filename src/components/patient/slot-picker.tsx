"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { format } from "date-fns";

interface Slot {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
}

interface SlotPickerProps {
  slots: Slot[];
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  onSlotSelect: (slot: Slot) => void;
  isLoading?: boolean;
}

export function SlotPicker({
  slots,
  selectedDate,
  onDateSelect,
  onSlotSelect,
  isLoading = false,
}: SlotPickerProps) {
  const availableSlots = slots.filter((s) => s.status === "available");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Date</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateSelect}
            disabled={(date) => date < new Date()}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Available Slots
            {selectedDate && (
              <Badge variant="secondary" className="ml-auto">
                {format(selectedDate, "MMM d, yyyy")}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-600" />
            </div>
          ) : !selectedDate ? (
            <p className="text-muted-foreground text-center py-8">
              Please select a date to view available slots
            </p>
          ) : availableSlots.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No available slots for this date
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {availableSlots.map((slot) => (
                <Button
                  key={slot._id}
                  variant="outline"
                  className="h-auto py-3 flex flex-col items-center gap-1 hover:bg-sky-50 hover:border-sky-300"
                  onClick={() => onSlotSelect(slot)}
                >
                  <span className="font-medium">{slot.startTime}</span>
                  <span className="text-xs text-muted-foreground">
                    to {slot.endTime}
                  </span>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
