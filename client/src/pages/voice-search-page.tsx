import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import VoiceSearch from '@/components/search/VoiceSearch';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function VoiceSearchPage() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <Link href="/">
          <Button className="flex items-center gap-2 bg-[#131313] text-white hover:bg-white hover:text-[#131313] transition-all">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        
        <Dialog open={showHelp} onOpenChange={setShowHelp}>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center gap-2 bg-[#131313] text-white hover:bg-white hover:text-[#131313] transition-all">
              <HelpCircle className="h-4 w-4" />
              Help
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Voice Search Tips</DialogTitle>
              <DialogDescription>
                Get the most out of AI voice search
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Be specific</h3>
                <p className="text-sm text-muted-foreground">
                  Include details like property type, location, price range, and number of bedrooms.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold">Example phrases</h3>
                <ul className="text-sm text-muted-foreground list-disc list-inside">
                  <li>"Find three bedroom apartments for rent under $2000 in Miami"</li>
                  <li>"Show me houses for sale with at least 2 bathrooms in New York"</li>
                  <li>"I need a luxury penthouse with a pool near downtown"</li>
                  <li>"Search for office spaces for rent in Chicago"</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold">Tips for better results</h3>
                <ul className="text-sm text-muted-foreground list-disc list-inside">
                  <li>Speak clearly and at a normal pace</li>
                  <li>Ensure your microphone is working properly</li>
                  <li>Minimize background noise</li>
                  <li>If the search doesn't understand you, try rephrasing your request</li>
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">AI Voice Search</h1>
          <p className="text-muted-foreground mt-2">
            Find your perfect property using natural language
          </p>
        </div>
        
        <VoiceSearch />
        
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Powered by Claude 3.7 Sonnet, our voice search understands natural language requests
            to help you find properties that match your specific needs.
          </p>
        </div>
      </div>
    </div>
  );
}