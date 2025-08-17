import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";

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

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      if (includeTime && date) {
        // Preserve existing time if time is enabled
        const newDate = new Date(selectedDate);
        newDate.setHours(date.getHours(), date.getMinutes(), 0, 0);
        onDateChange(newDate);
      } else if (includeTime) {
        // Set default time (9:00 AM) if no existing time
        const newDate = new Date(selectedDate);
        newDate.setHours(9, 0, 0, 0);
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

  const handleTimeChange = (hours: number, minutes: number) => {
    if (date) {
      const newDate = new Date(date);
      newDate.setHours(hours, minutes, 0, 0);
      onDateChange(newDate);
    }
  };

  const handleClear = () => {
    onDateChange(undefined);
    setIsOpen(false);
  };

  const currentHour = date ? date.getHours() : 9;
  const currentMinute = date ? date.getMinutes() : 0;

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
                onCheckedChange={setIncludeTime}
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
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">
                  Time
                </label>
                <div className="flex items-center space-x-1">
                  <Select
                    value={currentHour.toString()}
                    onValueChange={(value) => 
                      handleTimeChange(parseInt(value), currentMinute)
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
                    value={currentMinute.toString()}
                    onValueChange={(value) => 
                      handleTimeChange(currentHour, parseInt(value))
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
          date.getHours() !== 0 || date.getMinutes() !== 0 ?
            `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` :
            date.toLocaleDateString()
        ) : (
          <span>{placeholder}</span>
        )}
      </Button>
    </SimpleDatePicker>
  );
}
