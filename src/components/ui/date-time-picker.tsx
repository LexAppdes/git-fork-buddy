import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, X } from "lucide-react";
import { format } from "date-fns";

interface DateTimePickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  align?: "start" | "center" | "end";
  showTime?: boolean;
  allowClear?: boolean;
}

export function DateTimePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  className,
  align = "start",
  showTime = true,
  allowClear = true
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState({
    hour: date ? date.getHours() : 9,
    minute: date ? date.getMinutes() : 0
  });

  const timeSlots = [
    { label: "9:00", hour: 9, minute: 0 },
    { label: "10:00", hour: 10, minute: 0 },
    { label: "11:00", hour: 11, minute: 0 },
    { label: "12:00", hour: 12, minute: 0 },
    { label: "13:00", hour: 13, minute: 0 },
    { label: "14:00", hour: 14, minute: 0 },
    { label: "15:00", hour: 15, minute: 0 },
    { label: "16:00", hour: 16, minute: 0 },
    { label: "17:00", hour: 17, minute: 0 },
    { label: "18:00", hour: 18, minute: 0 },
  ];

  const durationOptions = [
    { label: "15 min", minutes: 15 },
    { label: "30 min", minutes: 30 },
    { label: "1 hour", minutes: 60 },
    { label: "2 hours", minutes: 120 },
    { label: "3 hours", minutes: 180 },
    { label: "4 hours", minutes: 240 },
    { label: "All day", minutes: null }
  ];

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Combine the selected date with the current time
      const newDate = new Date(selectedDate);
      newDate.setHours(selectedTime.hour, selectedTime.minute);
      onDateChange(newDate);
    } else {
      onDateChange(undefined);
    }
  };

  const handleTimeChange = (hour: number, minute: number) => {
    setSelectedTime({ hour, minute });
    if (date) {
      const newDate = new Date(date);
      newDate.setHours(hour, minute);
      onDateChange(newDate);
    }
  };

  const handleClear = () => {
    onDateChange(undefined);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {date ? (
            showTime ? format(date, "PPP p") : format(date, "PPP")
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0" 
        align={align}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-3 p-3">
          {/* Calendar */}
          <CalendarComponent
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
          />
          
          {/* Time and Duration Selection */}
          {showTime && (
            <>
              <div className="border-t pt-3 space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Time</span>
                </div>
                
                {/* Quick Time Slots */}
                <div className="grid grid-cols-5 gap-1">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot.label}
                      variant={
                        selectedTime.hour === slot.hour && selectedTime.minute === slot.minute
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => handleTimeChange(slot.hour, slot.minute)}
                    >
                      {slot.label}
                    </Button>
                  ))}
                </div>
                
                {/* Duration Options */}
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Duration</span>
                  <div className="grid grid-cols-4 gap-1 mt-2">
                    {durationOptions.map((duration) => (
                      <Button
                        key={duration.label}
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => {
                          // This could be used to set end time or duration metadata
                          // For now, we'll just show the options
                        }}
                      >
                        {duration.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
          
          {/* Action Buttons */}
          <div className="flex justify-between pt-3 border-t">
            {allowClear && date && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="text-destructive hover:text-destructive"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
            <div className="ml-auto">
              <Button
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Simplified version for inline use (like calendar icon buttons)
interface InlineDateTimePickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  children: React.ReactNode;
  align?: "start" | "center" | "end";
  showTime?: boolean;
  allowClear?: boolean;
}

export function InlineDateTimePicker({
  date,
  onDateChange,
  children,
  align = "start",
  showTime = false,
  allowClear = true
}: InlineDateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClear = () => {
    onDateChange(undefined);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0" 
        align={align}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-3 p-3">
          <CalendarComponent
            mode="single"
            selected={date}
            onSelect={(selectedDate) => {
              onDateChange(selectedDate);
              if (!showTime) {
                setIsOpen(false);
              }
            }}
            initialFocus
          />
          
          {allowClear && date && (
            <div className="flex justify-between pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="text-destructive hover:text-destructive"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
              {showTime && (
                <Button
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  Done
                </Button>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
