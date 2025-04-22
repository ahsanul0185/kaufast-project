import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import anthropicClient from '@/lib/anthropic-service';
import { useLocation } from 'wouter';
import { PropertySearchParams } from '@shared/schema';

export default function VoiceSearch() {
  const [isListening, setIsListening] = useState(false);
  const [processingCommand, setProcessingCommand] = useState(false);
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable
  } = useSpeechRecognition();
  
  useEffect(() => {
    setIsListening(listening);
  }, [listening]);
  
  // Voice search mutation
  const voiceSearchMutation = useMutation({
    mutationFn: async (command: string) => {
      return await anthropicClient.searchProperties(command);
    },
    onSuccess: (data) => {
      // Navigate to search results with the extracted parameters
      const queryParams = new URLSearchParams();
      
      // Add all valid search parameters to the URL
      Object.entries(data.parameters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
      
      navigate(`/search?${queryParams.toString()}`);
      
      // Show success toast
      toast({
        title: 'Search completed',
        description: `Found ${data.results.total} properties matching your criteria`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Voice search failed',
        description: error instanceof Error ? error.message : 'Failed to process voice command',
        variant: 'destructive',
      });
    },
  });
  
  const handleVoiceCommand = async () => {
    if (!transcript.trim()) {
      toast({
        title: 'No voice input detected',
        description: 'Please speak clearly into your microphone',
        variant: 'destructive',
      });
      return;
    }
    
    setProcessingCommand(true);
    try {
      await voiceSearchMutation.mutateAsync(transcript);
    } finally {
      setProcessingCommand(false);
      resetTranscript();
    }
  };
  
  const startListening = () => {
    resetTranscript();
    SpeechRecognition.startListening({ continuous: true });
  };
  
  const stopListening = () => {
    SpeechRecognition.stopListening();
  };
  
  if (!browserSupportsSpeechRecognition) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Voice Search</CardTitle>
          <CardDescription>Voice search is not available</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">
            Your browser doesn't support speech recognition.
            Please try using a different browser, such as Chrome.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  if (!isMicrophoneAvailable) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Voice Search</CardTitle>
          <CardDescription>Microphone access required</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">
            Please allow microphone access to use voice search.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Voice Search</span>
          {isListening && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
        </CardTitle>
        <CardDescription>
          {isListening 
            ? "I'm listening... Speak clearly" 
            : "Click the microphone to start speaking"}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="min-h-[100px] p-4 border rounded-md bg-muted/50">
          {transcript ? transcript : 
            <span className="text-muted-foreground">
              {isListening ? "Listening..." : "Your voice command will appear here"}
            </span>
          }
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>Try saying:</p>
          <ul className="list-disc list-inside">
            <li>"Show me apartments for rent in Miami under $2000"</li>
            <li>"Find 3 bedroom houses for sale in New York"</li>
            <li>"I'm looking for luxury villas with a pool"</li>
          </ul>
        </div>
      </CardContent>
      
      <CardFooter className="flex gap-2 justify-between">
        <Button
          variant={isListening ? "destructive" : "default"}
          size="icon"
          onClick={isListening ? stopListening : startListening}
          disabled={processingCommand}
          className={`h-12 w-12 rounded-full ${isListening ? 'bg-red-600 text-white hover:bg-white hover:text-red-600' : 'bg-[#131313] text-white hover:bg-white hover:text-[#131313]'} transition-all`}
        >
          {isListening ? <MicOff /> : <Mic />}
        </Button>
        
        <Button
          onClick={handleVoiceCommand}
          disabled={!transcript || processingCommand || isListening}
          className="flex-1 bg-[#131313] text-white hover:bg-white hover:text-[#131313] transition-all"
        >
          {processingCommand ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Search Properties'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}