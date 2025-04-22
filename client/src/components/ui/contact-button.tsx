import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { MessageSquare, HelpCircle, AlertTriangle } from 'lucide-react';

export default function ContactButton({ 
  variant = 'fixed', 
  label = '',
  reportType = 'feedback'
}: { 
  variant?: 'fixed' | 'inline';
  label?: string;
  reportType?: 'feedback' | 'error' | 'any'; 
}) {
  const [open, setOpen] = useState(false);
  const [messageType, setMessageType] = useState<string>(reportType === 'any' ? 'feedback' : reportType);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // In a real app, this would send the message to the server
    // Simulate API call with setTimeout
    setTimeout(() => {
      toast({
        title: 'Message sent',
        description: 'Thank you for your feedback! We will get back to you soon.',
      });
      setOpen(false);
      setSubject('');
      setMessage('');
      setIsSubmitting(false);
    }, 1000);
  };

  const getIcon = () => {
    switch (messageType) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 mr-2" />;
      case 'feedback':
        return <MessageSquare className="h-4 w-4 mr-2" />;
      case 'help':
        return <HelpCircle className="h-4 w-4 mr-2" />;
      default:
        return <MessageSquare className="h-4 w-4 mr-2" />;
    }
  };

  const getMessage = () => {
    switch (messageType) {
      case 'error':
        return 'Report a problem or error you encountered while using our platform.';
      case 'feedback':
        return 'Share your thoughts, suggestions, or general feedback about our platform.';
      case 'help':
        return 'Ask a question or request assistance with using our platform.';
      default:
        return 'We appreciate your message and will respond as soon as possible.';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {variant === 'fixed' ? (
          <Button 
            className="fixed bottom-6 right-6 z-50 rounded-full h-14 w-14 shadow-lg bg-[#131313] text-white hover:bg-white hover:text-[#131313] transition-all"
            size="icon"
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        ) : (
          <Button 
            className="bg-[#131313] text-white hover:bg-white hover:text-[#131313] transition-all"
            size={label ? 'default' : 'icon'}
          >
            {label ? (
              <>
                <MessageSquare className="h-4 w-4 mr-2" />
                {label}
              </>
            ) : (
              <MessageSquare className="h-4 w-4" />
            )}
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Contact Us</DialogTitle>
            <DialogDescription>
              Send us a message and we'll get back to you as soon as possible.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {reportType === 'any' && (
              <div className="space-y-2">
                <Label htmlFor="messageType">Message Type</Label>
                <Select value={messageType} onValueChange={setMessageType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select message type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feedback">Feedback</SelectItem>
                    <SelectItem value="error">Report Error</SelectItem>
                    <SelectItem value="help">Get Help</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                {getIcon()}
                <Label htmlFor="subject">{messageType === 'error' ? 'Error Description' : 'Subject'}</Label>
              </div>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={messageType === 'error' ? 'Briefly describe the error' : 'What is your message about?'}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={getMessage()}
                className="h-32"
                required
              />
            </div>
            
            {user ? (
              <p className="text-sm text-muted-foreground">
                You will be contacted at: {user.email}
              </p>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  required
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-[#131313] text-white hover:bg-white hover:text-[#131313] transition-all"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}