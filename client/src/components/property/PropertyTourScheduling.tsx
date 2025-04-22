import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { PropertyTourService, TimeSlot, TourAvailability } from "@/lib/property-tour-service";
import { Calendar as CalendarIcon, Clock, Loader2 } from "lucide-react";
import { format, addHours, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PropertyTourSchedulingProps {
  propertyId: number;
}

// Form schema
const tourFormSchema = z.object({
  date: z.date({
    required_error: "Please select a date",
  }),
  time: z.string({
    required_error: "Please select a time",
  }),
  notes: z.string().optional(),
});

type TourFormValues = z.infer<typeof tourFormSchema>;

export default function PropertyTourScheduling({ propertyId }: PropertyTourSchedulingProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  
  // Initialize form
  const form = useForm<TourFormValues>({
    resolver: zodResolver(tourFormSchema),
    defaultValues: {
      notes: "",
    },
  });
  
  // Get property availability for selected date
  const { data: availability, isLoading: isLoadingAvailability, refetch: refetchAvailability } = useQuery({
    queryKey: ["property-availability", propertyId, selectedDate],
    queryFn: async () => {
      if (!selectedDate) return null;
      
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      return await PropertyTourService.checkAvailability(propertyId, formattedDate);
    },
    enabled: !!selectedDate,
  });
  
  // Update time slots when availability data changes
  useEffect(() => {
    if (availability) {
      // Generate time slots with availability info
      const slots = PropertyTourService.generateTimeSlots(availability.available);
      setTimeSlots(slots);
    }
  }, [availability]);
  
  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    form.setValue("date", date as Date);
    form.clearErrors("date");
    
    // Reset time selection when date changes
    form.setValue("time", "");
  };
  
  // Handle time selection
  const handleTimeSelect = (time: string) => {
    form.setValue("time", time);
    form.clearErrors("time");
  };
  
  // Mutation for scheduling a tour
  const scheduleTourMutation = useMutation({
    mutationFn: async (data: TourFormValues) => {
      if (!user) {
        throw new Error("You must be logged in to schedule a tour");
      }
      
      const tourData = {
        propertyId,
        userId: user.id,
        scheduledDate: format(data.date, "yyyy-MM-dd") + "T" + data.time,
        endTime: format(
          addHours(parseISO(format(data.date, "yyyy-MM-dd") + "T" + data.time), 1),
          "yyyy-MM-dd'T'HH:mm"
        ),
        notes: data.notes,
      };
      
      return await PropertyTourService.scheduleTour(tourData);
    },
    onSuccess: () => {
      toast({
        title: "Tour scheduled successfully!",
        description: "You'll receive a confirmation from the agent soon.",
        variant: "default",
        className: "bg-green-50 text-green-800 border-green-300",
      });
      setIsDialogOpen(false);
      form.reset();
      setSelectedDate(undefined);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to schedule tour",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: TourFormValues) => {
    if (!user) {
      setIsLoginPromptOpen(true);
      return;
    }
    
    scheduleTourMutation.mutate(data);
  };
  
  const handleScheduleClick = () => {
    if (!user) {
      setIsLoginPromptOpen(true);
      return;
    }
    
    setIsDialogOpen(true);
  };
  
  return (
    <div>
      <Button 
        onClick={handleScheduleClick}
        className="w-full bg-black text-white hover:bg-gray-800"
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        Schedule a Tour
      </Button>

      {/* Tour Scheduling Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule a Property Tour</DialogTitle>
            <DialogDescription>
              Select your preferred date and time to visit this property.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Date Selection */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Select Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={handleDateSelect}
                          disabled={(date) => 
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Time Selection */}
              {selectedDate && (
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Time</FormLabel>
                      <Select 
                        onValueChange={handleTimeSelect}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a time slot" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingAvailability ? (
                            <div className="flex items-center justify-center py-2">
                              <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                              <span className="ml-2">Loading availability...</span>
                            </div>
                          ) : timeSlots.length > 0 ? (
                            timeSlots.map((slot) => (
                              <SelectItem
                                key={slot.time}
                                value={slot.time}
                                disabled={!slot.available}
                              >
                                <div className="flex items-center">
                                  <Clock className="mr-2 h-4 w-4" />
                                  <span>
                                    {slot.time} 
                                    {!slot.available && " (Unavailable)"}
                                  </span>
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            <div className="py-2 px-4 text-center text-gray-500">
                              No available time slots for this date
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {/* Notes/Comments */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any special requests or questions for the agent..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-black text-white hover:bg-gray-800"
                  disabled={scheduleTourMutation.isPending}
                >
                  {scheduleTourMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    "Schedule Tour"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Login Prompt Dialog */}
      <Dialog open={isLoginPromptOpen} onOpenChange={setIsLoginPromptOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              You need to be logged in to schedule a property tour.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsLoginPromptOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-black text-white hover:bg-gray-800"
              onClick={() => {
                // Navigate to auth page
                window.location.href = "/auth";
              }}
            >
              Log In
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}