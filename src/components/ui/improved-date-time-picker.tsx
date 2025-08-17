import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar, X } from "lucide-react";
import { format } from "date-fns";

interface TaskDateTimePickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  allowClear?: boolean;
}

export function TaskDateTimePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  className,
  align = "center",
  side = "right",
  allowClear = true
}: TaskDateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [includeTime, setIncludeTime] = useState(false);
  const [startTime, setStartTime] = useState({ hour: 9, minute: 0, period: 'AM' as 'AM' | 'PM' });
  const [endTime, setEndTime] = useState({ hour: 10, minute: 0, period: 'AM' as 'AM' | 'PM' });

  // Initialize time from existing date
  useEffect(() => {
    if (date) {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      
      // Check if time is not midnight (indicates time was set)
      if (hours !== 0 || minutes !== 0) {
        setIncludeTime(true);
        setStartTime({
          hour: hours > 12 ? hours - 12 : hours === 0 ? 12 : hours,
          minute: minutes,
          period: hours >= 12 ? 'PM' : 'AM'
        });
        // Set end time to 1 hour later by default
        const endHours = hours + 1;
        setEndTime({
          hour: endHours > 12 ? endHours - 12 : endHours === 0 ? 12 : endHours,
          minute: minutes,
          period: endHours >= 12 ? 'PM' : 'AM'
        });
      }
    }
  }, [date]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      if (includeTime) {
        // Convert 12-hour to 24-hour format
        let hour24 = startTime.hour;
        if (startTime.period === 'PM' && startTime.hour !== 12) {
          hour24 += 12;
        } else if (startTime.period === 'AM' && startTime.hour === 12) {
          hour24 = 0;
        }
        
        const newDate = new Date(selectedDate);
        newDate.setHours(hour24, startTime.minute, 0, 0);
        onDateChange(newDate);
      } else {
        // Set to start of day if no time
        const newDate = new Date(selectedDate);
        newDate.setHours(0, 0, 0, 0);
        onDateChange(newDate);
      }
    } else {
      onDateChange(undefined);
    }
  };

  // Handle time changes with loop prevention
  useEffect(() => {
    if (date && includeTime) {
      // Convert 12-hour to 24-hour format
      let hour24 = startTime.hour;
      if (startTime.period === 'PM' && startTime.hour !== 12) {
        hour24 += 12;
      } else if (startTime.period === 'AM' && startTime.hour === 12) {
        hour24 = 0;
      }
      
      const newDate = new Date(date);
      newDate.setHours(hour24, startTime.minute, 0, 0);
      
      // Only update if the time actually changed to prevent loops
      if (newDate.getTime() !== date.getTime()) {
        onDateChange(newDate);
      }
    } else if (date && !includeTime) {
      // Remove time component
      const newDate = new Date(date);
      newDate.setHours(0, 0, 0, 0);
      
      // Only update if the time actually changed to prevent loops
      if (newDate.getTime() !== date.getTime()) {
        onDateChange(newDate);
      }
    }
  }, [includeTime, startTime, date]);

  const handleClear = () => {
    onDateChange(undefined);
    setIsOpen(false);
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = ['00', '15', '30', '45'];

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
            includeTime && (date.getHours() !== 0 || date.getMinutes() !== 0) ? 
              format(date, "PPP p") : 
              format(date, "PPP")
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
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
                id="set-time"
                checked={includeTime}
                onCheckedChange={(checked) => {
                  setIncludeTime(checked);
                  if (!checked && date) {
                    // Reset to start of day
                    const newDate = new Date(date);
                    newDate.setHours(0, 0, 0, 0);
                    onDateChange(newDate);
                  }
                }}
              />
              <label 
                htmlFor="set-time" 
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
                    value={startTime.hour.toString()}
                    onValueChange={(value) => 
                      setStartTime(prev => ({ ...prev, hour: parseInt(value) }))
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
                    value={startTime.minute.toString().padStart(2, '0')}
                    onValueChange={(value) => 
                      setStartTime(prev => ({ ...prev, minute: parseInt(value) }))
                    }
                  >
                    <SelectTrigger className="w-16 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {minutes.map((minute) => (
                        <SelectItem key={minute} value={minute}>
                          {minute}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={startTime.period}
                    onValueChange={(value: 'AM' | 'PM') => 
                      setStartTime(prev => ({ ...prev, period: value }))
                    }
                  >
                    <SelectTrigger className="w-16 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
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
                    value={endTime.hour.toString()}
                    onValueChange={(value) => 
                      setEndTime(prev => ({ ...prev, hour: parseInt(value) }))
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
                    value={endTime.minute.toString().padStart(2, '0')}
                    onValueChange={(value) => 
                      setEndTime(prev => ({ ...prev, minute: parseInt(value) }))
                    }
                  >
                    <SelectTrigger className="w-16 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {minutes.map((minute) => (
                        <SelectItem key={minute} value={minute}>
                          {minute}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={endTime.period}
                    onValueChange={(value: 'AM' | 'PM') => 
                      setEndTime(prev => ({ ...prev, period: value }))
                    }
                  >
                    <SelectTrigger className="w-16 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
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

// Inline version for use with calendar icon triggers
interface InlineTaskDateTimePickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  children: React.ReactNode;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  allowClear?: boolean;
}

export function InlineTaskDateTimePicker({
  date,
  onDateChange,
  children,
  align = "center",
  side = "right",
  allowClear = true
}: InlineTaskDateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [includeTime, setIncludeTime] = useState(false);
  const [startTime, setStartTime] = useState({ hour: 9, minute: 0, period: 'AM' as 'AM' | 'PM' });
  const [endTime, setEndTime] = useState({ hour: 10, minute: 0, period: 'AM' as 'AM' | 'PM' });

  // Initialize time from existing date
  useEffect(() => {
    if (date) {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      
      // Check if time is not midnight (indicates time was set)
      if (hours !== 0 || minutes !== 0) {
        setIncludeTime(true);
        setStartTime({
          hour: hours > 12 ? hours - 12 : hours === 0 ? 12 : hours,
          minute: minutes,
          period: hours >= 12 ? 'PM' : 'AM'
        });
        // Set end time to 1 hour later by default
        const endHours = hours + 1;
        setEndTime({
          hour: endHours > 12 ? endHours - 12 : endHours === 0 ? 12 : endHours,
          minute: minutes,
          period: endHours >= 12 ? 'PM' : 'AM'
        });
      }
    }
  }, [date]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      if (includeTime) {
        // Convert 12-hour to 24-hour format
        let hour24 = startTime.hour;
        if (startTime.period === 'PM' && startTime.hour !== 12) {
          hour24 += 12;
        } else if (startTime.period === 'AM' && startTime.hour === 12) {
          hour24 = 0;
        }
        
        const newDate = new Date(selectedDate);
        newDate.setHours(hour24, startTime.minute, 0, 0);
        onDateChange(newDate);
      } else {
        // Set to start of day if no time
        const newDate = new Date(selectedDate);
        newDate.setHours(0, 0, 0, 0);
        onDateChange(newDate);
      }
      if (!includeTime) {
        setIsOpen(false);
      }
    } else {
      onDateChange(undefined);
    }
  };

  // Handle time changes with loop prevention
  useEffect(() => {
    if (date && includeTime) {
      // Convert 12-hour to 24-hour format
      let hour24 = startTime.hour;
      if (startTime.period === 'PM' && startTime.hour !== 12) {
        hour24 += 12;
      } else if (startTime.period === 'AM' && startTime.hour === 12) {
        hour24 = 0;
      }
      
      const newDate = new Date(date);
      newDate.setHours(hour24, startTime.minute, 0, 0);
      
      // Only update if the time actually changed to prevent loops
      if (newDate.getTime() !== date.getTime()) {
        onDateChange(newDate);
      }
    } else if (date && !includeTime) {
      // Remove time component
      const newDate = new Date(date);
      newDate.setHours(0, 0, 0, 0);
      
      // Only update if the time actually changed to prevent loops
      if (newDate.getTime() !== date.getTime()) {
        onDateChange(newDate);
      }
    }
  }, [includeTime, startTime, date]);

  const handleClear = () => {
    onDateChange(undefined);
    setIsOpen(false);
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = ['00', '15', '30', '45'];

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
                id="set-time-inline"
                checked={includeTime}
                onCheckedChange={(checked) => {
                  setIncludeTime(checked);
                  if (!checked && date) {
                    // Reset to start of day
                    const newDate = new Date(date);
                    newDate.setHours(0, 0, 0, 0);
                    onDateChange(newDate);
                  }
                }}
              />
              <label 
                htmlFor="set-time-inline" 
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
                    value={startTime.hour.toString()}
                    onValueChange={(value) => 
                      setStartTime(prev => ({ ...prev, hour: parseInt(value) }))
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
                    value={startTime.minute.toString().padStart(2, '0')}
                    onValueChange={(value) => 
                      setStartTime(prev => ({ ...prev, minute: parseInt(value) }))
                    }
                  >
                    <SelectTrigger className="w-16 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {minutes.map((minute) => (
                        <SelectItem key={minute} value={minute}>
                          {minute}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={startTime.period}
                    onValueChange={(value: 'AM' | 'PM') => 
                      setStartTime(prev => ({ ...prev, period: value }))
                    }
                  >
                    <SelectTrigger className="w-16 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
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
                    value={endTime.hour.toString()}
                    onValueChange={(value) => 
                      setEndTime(prev => ({ ...prev, hour: parseInt(value) }))
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
                    value={endTime.minute.toString().padStart(2, '0')}
                    onValueChange={(value) => 
                      setEndTime(prev => ({ ...prev, minute: parseInt(value) }))
                    }
                  >
                    <SelectTrigger className="w-16 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {minutes.map((minute) => (
                        <SelectItem key={minute} value={minute}>
                          {minute}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={endTime.period}
                    onValueChange={(value: 'AM' | 'PM') => 
                      setEndTime(prev => ({ ...prev, period: value }))
                    }
                  >
                    <SelectTrigger className="w-16 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
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
