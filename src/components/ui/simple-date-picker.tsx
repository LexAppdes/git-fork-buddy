import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { X, Calendar } from "lucide-react";

interface SimpleDatePickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  children: React.ReactNode;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  allowClear?: boolean;
}

export function SimpleDatePicker({
  date,
  onDateChange,
  children,
  align = "center",
  side = "right",
  allowClear = true
}: SimpleDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const [includeTime, setIncludeTime] = useState(false);
  const [startTime, setStartTime] = useState({ hour: 9, minute: 0 });
  const [endTime, setEndTime] = useState({ hour: 10, minute: 0 });

  // Auto-detect if time should be included based on existing date
  useEffect(() => {
    const hasExistingTime = date && (date.getHours() !== 0 || date.getMinutes() !== 0 || (date as any).__endTime);
    setIncludeTime(hasExistingTime || false);
  }, [date]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      if (includeTime) {
        // When time is enabled, store both start and end times in the date object
        // We'll use a custom property to store the end time
        const newDate = new Date(selectedDate);
        newDate.setHours(startTime.hour, startTime.minute, 0, 0);
        // Store end time as a custom property
        (newDate as any).__endTime = { hour: endTime.hour, minute: endTime.minute };
        onDateChange(newDate);
      } else {
        // No time - set to start of day
        const newDate = new Date(selectedDate);
        newDate.setHours(0, 0, 0, 0);
        onDateChange(newDate);
      }
    } else {
      onDateChange(undefined);
    }
  };

  const handleStartTimeChange = (hours: number, minutes: number) => {
    setStartTime({ hour: hours, minute: minutes });
    if (date) {
      const newDate = new Date(date);
      newDate.setHours(hours, minutes, 0, 0);
      // Preserve end time
      (newDate as any).__endTime = { hour: endTime.hour, minute: endTime.minute };
      onDateChange(newDate);
    }
  };

  const handleEndTimeChange = (hours: number, minutes: number) => {
    setEndTime({ hour: hours, minute: minutes });
    if (date) {
      const newDate = new Date(date);
      newDate.setHours(startTime.hour, startTime.minute, 0, 0);
      // Store end time
      (newDate as any).__endTime = { hour: hours, minute: minutes };
      onDateChange(newDate);
    }
  };

  const handleTimeToggle = (checked: boolean) => {
    setIncludeTime(checked);

    if (!checked && date) {
      // When toggling time off, clear the time but keep the date
      const newDate = new Date(date);
      newDate.setHours(0, 0, 0, 0);
      // Remove the end time property
      delete (newDate as any).__endTime;
      onDateChange(newDate);
    } else if (checked && date) {
      // When toggling time on, apply the current start/end times
      const newDate = new Date(date);
      newDate.setHours(startTime.hour, startTime.minute, 0, 0);
      (newDate as any).__endTime = { hour: endTime.hour, minute: endTime.minute };
      onDateChange(newDate);
    }
  };

  const handleClear = () => {
    onDateChange(undefined);
    setIsOpen(false);
  };

  // Initialize times from existing date
  const currentStartHour = date ? date.getHours() : startTime.hour;
  const currentStartMinute = date ? date.getMinutes() : startTime.minute;
  const currentEndHour = date && (date as any).__endTime ? (date as any).__endTime.hour : endTime.hour;
  const currentEndMinute = date && (date as any).__endTime ? (date as any).__endTime.minute : endTime.minute;

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 15, 30, 45];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0" 
        align={align}
        side={side}
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
          
          {/* Time Toggle */}
          <div className="border-t pt-3">
            <div className="flex items-center space-x-2">
              <Switch
                id="set-time-simple"
                checked={includeTime}
                onCheckedChange={handleTimeToggle}
              />
              <label 
                htmlFor="set-time-simple" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Set time
              </label>
            </div>
          </div>

          {/* Time Selection */}
          {includeTime && (
            <div className="space-y-3">
              {/* Start Time */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">
                  Start Time
                </label>
                <div className="flex items-center space-x-1">
                  <Select
                    value={currentStartHour.toString()}
                    onValueChange={(value) =>
                      handleStartTimeChange(parseInt(value), currentStartMinute)
                    }
                  >
                    <SelectTrigger className="w-16 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {hours.map((hour) => (
                        <SelectItem key={hour} value={hour.toString()}>
                          {hour.toString().padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-sm">:</span>
                  <Select
                    value={currentStartMinute.toString()}
                    onValueChange={(value) =>
                      handleStartTimeChange(currentStartHour, parseInt(value))
                    }
                  >
                    <SelectTrigger className="w-16 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {minutes.map((minute) => (
                        <SelectItem key={minute} value={minute.toString()}>
                          {minute.toString().padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* End Time */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">
                  End Time
                </label>
                <div className="flex items-center space-x-1">
                  <Select
                    value={currentEndHour.toString()}
                    onValueChange={(value) =>
                      handleEndTimeChange(parseInt(value), currentEndMinute)
                    }
                  >
                    <SelectTrigger className="w-16 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {hours.map((hour) => (
                        <SelectItem key={hour} value={hour.toString()}>
                          {hour.toString().padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-sm">:</span>
                  <Select
                    value={currentEndMinute.toString()}
                    onValueChange={(value) =>
                      handleEndTimeChange(currentEndHour, parseInt(value))
                    }
                  >
                    <SelectTrigger className="w-16 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {minutes.map((minute) => (
                        <SelectItem key={minute} value={minute.toString()}>
                          {minute.toString().padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
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
                OK
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Button version of the date picker
interface SimpleDatePickerButtonProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  allowClear?: boolean;
}

export function SimpleDatePickerButton({
  date,
  onDateChange,
  placeholder = "Pick a date",
  className,
  align = "center",
  side = "right",
  allowClear = true
}: SimpleDatePickerButtonProps) {
  return (
    <SimpleDatePicker
      date={date}
      onDateChange={onDateChange}
      align={align}
      side={side}
      allowClear={allowClear}
    >
      <Button
        variant="outline"
        className={cn(
          "w-full justify-start text-left font-normal",
          !date && "text-muted-foreground",
          className
        )}
      >
        {date ? (
          // Only show time if it's not midnight (00:00) or if there's an end time
          date.getHours() !== 0 || date.getMinutes() !== 0 || (date as any).__endTime ?
            `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${
              (date as any).__endTime ?
                ` - ${(date as any).__endTime.hour.toString().padStart(2, '0')}:${(date as any).__endTime.minute.toString().padStart(2, '0')}` :
                ''
            }` :
            date.toLocaleDateString()
        ) : (
          <span>{placeholder}</span>
        )}
      </Button>
    </SimpleDatePicker>
  );
}
