import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Checkbox } from "@/components/ui/checkbox";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { insertPropertySchema } from "@shared/schema";

// Add types for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// Extend the insert schema to add more validation rules
const propertyFormSchema = insertPropertySchema.extend({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  bedrooms: z.coerce.number().min(0, "Bedrooms must be 0 or more"),
  bathrooms: z.coerce.number().min(0, "Bathrooms must be 0 or more"),
  squareFeet: z.coerce.number().min(1, "Square feet must be greater than 0"),
});

type PropertyFormData = z.infer<typeof propertyFormSchema>;

interface AddPropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddPropertyDialog({ open, onOpenChange }: AddPropertyDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceField, setVoiceField] = useState<keyof PropertyFormData | null>(null);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);

  // Create form with default values
  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      bedrooms: 0,
      bathrooms: 0,
      squareFeet: 0,
      city: "Barcelona",
      propertyType: "apartment",
      listingType: "sell",
      isPremium: false,
      isVirtual: false,
      features: [],
    }
  });
  
  // Property creation mutation
  const createPropertyMutation = useMutation({
    mutationFn: async (newProperty: PropertyFormData) => {
      const response = await apiRequest("POST", "/api/properties", newProperty);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Property Created",
        description: "Your property has been created successfully!",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create property: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: PropertyFormData) => {
    createPropertyMutation.mutate(data);
  };

  // Common property features
  const propertyFeatures = [
    "Swimming Pool",
    "Near the Sea",
    "Balcony",
    "Air-conditioning",
    "Parking",
    "Gym",
    "Security System",
    "Garden",
    "Ocean Views",
    "Furnished",
    "Pet Friendly",
    "WiFi",
  ];

  // Setup SpeechRecognition
  const speechRecognition = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Voice Input Not Available",
        description: "Your browser does not support voice input.",
        variant: "destructive",
      });
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      speechRecognition.current = new SpeechRecognition();
      speechRecognition.current.continuous = true;
      speechRecognition.current.interimResults = true;
      speechRecognition.current.lang = 'en-US';

      speechRecognition.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setVoiceTranscript(transcript);
      };

      speechRecognition.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsVoiceListening(false);
        toast({
          title: "Voice Recognition Error",
          description: `Error: ${event.error}`,
          variant: "destructive",
        });
      };

      speechRecognition.current.onend = () => {
        setIsVoiceListening(false);
        if (voiceField && voiceTranscript) {
          setIsProcessingVoice(true);
          
          // Apply the transcript to the field
          setTimeout(() => {
            if (voiceField === 'features') {
              // Handle features differently - try to detect features from transcript
              const detectedFeatures = propertyFeatures.filter(feature => 
                voiceTranscript.toLowerCase().includes(feature.toLowerCase())
              );
              
              if (detectedFeatures.length > 0) {
                form.setValue('features', detectedFeatures);
                toast({
                  title: "Features Detected",
                  description: `Added features: ${detectedFeatures.join(', ')}`,
                  variant: "default",
                });
              }
            } else {
              form.setValue(voiceField, voiceTranscript);
            }
            
            setVoiceField(null);
            setVoiceTranscript("");
            setIsProcessingVoice(false);
          }, 1000);
        }
      };
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
      toast({
        title: "Voice Input Error",
        description: "Could not initialize voice recognition.",
        variant: "destructive",
      });
    }
  }, [toast, voiceField, voiceTranscript, form]);

  const startVoiceInput = (field: keyof PropertyFormData) => {
    if (!speechRecognition.current) return;
    
    setVoiceField(field);
    setVoiceTranscript("");
    setIsVoiceListening(true);
    
    try {
      speechRecognition.current.start();
      toast({
        title: "Voice Input Active",
        description: `Speak now to add ${field}...`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsVoiceListening(false);
    }
  };

  const stopVoiceInput = () => {
    if (!speechRecognition.current) return;
    
    try {
      speechRecognition.current.stop();
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen && isVoiceListening) {
        stopVoiceInput();
      }
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Property</DialogTitle>
          <DialogDescription>
            Fill out the form below to create a new property listing.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Title</FormLabel>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        onClick={() => startVoiceInput('title')}
                        disabled={isVoiceListening}
                      >
                        <Mic size={16} />
                      </Button>
                    </div>
                    <FormControl>
                      <Input placeholder="Luxury Apartment in Downtown" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Description</FormLabel>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        onClick={() => startVoiceInput('description')}
                        disabled={isVoiceListening}
                      >
                        <Mic size={16} />
                      </Button>
                    </div>
                    <FormControl>
                      <Textarea 
                        placeholder="Spacious and bright apartment with modern finishes..." 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Property Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Property Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Type</FormLabel>
                      <FormControl>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Property Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="apartment">Apartment</SelectItem>
                            <SelectItem value="villa">Villa</SelectItem>
                            <SelectItem value="penthouse">Penthouse</SelectItem>
                            <SelectItem value="townhouse">Townhouse</SelectItem>
                            <SelectItem value="office">Office</SelectItem>
                            <SelectItem value="retail">Retail</SelectItem>
                            <SelectItem value="land">Land</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="listingType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Listing Type</FormLabel>
                      <FormControl>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Listing Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="buy">For Sale</SelectItem>
                            <SelectItem value="rent">For Rent</SelectItem>
                            <SelectItem value="sell">Selling</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (€)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="250000" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>City</FormLabel>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon"
                          onClick={() => startVoiceInput('city')}
                          disabled={isVoiceListening}
                        >
                          <Mic size={16} />
                        </Button>
                      </div>
                      <FormControl>
                        <Input placeholder="Barcelona" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Property Specifications */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Specifications</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bedrooms</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="2" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bathrooms</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="1" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="squareFeet"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Square Feet</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="1200" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Features Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Features</h3>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => startVoiceInput('features')}
                  disabled={isVoiceListening}
                >
                  <Mic className="h-4 w-4 mr-2" />
                  <span>Add features by voice</span>
                </Button>
              </div>
              
              <FormField
                control={form.control}
                name="features"
                render={() => (
                  <FormItem>
                    <div className="grid grid-cols-2 gap-2">
                      {propertyFeatures.map((feature) => (
                        <FormField
                          key={feature}
                          control={form.control}
                          name="features"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={feature}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(feature)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, feature])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== feature
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {feature}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Premium Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Premium Options</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="isPremium"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Featured Property</FormLabel>
                        <FormDescription>
                          Highlight this property on the homepage
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isVirtual"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Virtual Tour</FormLabel>
                        <FormDescription>
                          Enable virtual tour for this property
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {isVoiceListening && (
              <div className="p-4 border border-primary/20 bg-primary/5 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-primary">Voice Recognition Active</h4>
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="sm"
                    onClick={stopVoiceInput}
                  >
                    <MicOff className="h-4 w-4 mr-2" />
                    <span>Stop</span>
                  </Button>
                </div>
                <p className="text-sm italic">
                  {voiceTranscript || "Speak now..."}
                </p>
              </div>
            )}
            
            {isProcessingVoice && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <p>Processing voice input...</p>
              </div>
            )}
            
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (isVoiceListening) {
                    stopVoiceInput();
                  }
                  onOpenChange(false);
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-[#131313]"
                disabled={isVoiceListening || isProcessingVoice || createPropertyMutation.isPending}
              >
                {createPropertyMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : "Save Property"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}