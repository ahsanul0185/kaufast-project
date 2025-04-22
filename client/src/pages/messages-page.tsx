import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Message } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { 
  Loader2, 
  MessageSquare, 
  Search, 
  Send,
  Save,
  File,
  Plus
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function MessagesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [draftMode, setDraftMode] = useState(false);
  const [showDrafts, setShowDrafts] = useState(false);
  
  // Load drafts from localStorage
  useEffect(() => {
    const savedDrafts = localStorage.getItem('messageDrafts');
    if (savedDrafts) {
      try {
        setDrafts(JSON.parse(savedDrafts));
      } catch (e) {
        console.error('Failed to parse drafts:', e);
      }
    }
  }, []);
  
  // Load draft for selected conversation
  useEffect(() => {
    if (selectedConversation && drafts[selectedConversation]) {
      setMessageText(drafts[selectedConversation]);
      setDraftMode(true);
    } else {
      setMessageText("");
      setDraftMode(false);
    }
  }, [selectedConversation, drafts]);
  
  // Save draft
  const saveDraft = () => {
    if (selectedConversation && messageText.trim()) {
      const newDrafts = {
        ...drafts,
        [selectedConversation]: messageText
      };
      setDrafts(newDrafts);
      localStorage.setItem('messageDrafts', JSON.stringify(newDrafts));
      setDraftMode(true);
      toast({
        title: "Draft saved",
        description: "Your message draft has been saved.",
        className: "bg-blue-50 border-blue-200 text-blue-800",
      });
    }
  };
  
  // Delete draft
  const deleteDraft = (conversationId: number, silent = false) => {
    const newDrafts = { ...drafts };
    delete newDrafts[conversationId];
    setDrafts(newDrafts);
    localStorage.setItem('messageDrafts', JSON.stringify(newDrafts));
    
    if (selectedConversation === conversationId) {
      setMessageText("");
      setDraftMode(false);
    }
    
    if (!silent) {
      toast({
        title: "Draft deleted",
        description: "Your message draft has been removed.",
        className: "bg-orange-50 border-orange-200 text-orange-800",
      });
    }
  };
  
  // Fetch messages for the current user
  const { data: messages, isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`/api/messages/${user.id}`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
  });
  
  // Get unique conversation partners
  const uniqueContacts = messages && messages.length > 0
    ? Array.from(new Set(messages.map(m => 
        m.senderId === user?.id ? m.receiverId : m.senderId
      )))
    : [];
    
  // Helper to get initials from a name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Get messages for the selected conversation
  const conversationMessages = messages?.filter(m => 
    (m.senderId === user?.id && m.receiverId === selectedConversation) ||
    (m.receiverId === user?.id && m.senderId === selectedConversation)
  ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  
  // Format timestamp
  const formatMessageTime = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!user || !selectedConversation || !messageText.trim()) return;
    
    try {
      const newMessage = {
        senderId: user.id,
        receiverId: selectedConversation,
        content: messageText.trim(),
        propertyId: null, // We'd set this if the message is about a specific property
        createdAt: new Date().toISOString()
      };
      
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMessage),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      // If this was a draft, remove it from drafts
      if (draftMode && drafts[selectedConversation]) {
        deleteDraft(selectedConversation, true); // Pass true to avoid showing delete notification
      }
      
      // Clear input field
      setMessageText("");
      
      // Show success notification
      toast({
        title: "Message sent",
        description: "Your message has been delivered.",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      
      // Refetch messages to show the new one
      queryClient.invalidateQueries({queryKey: ["/api/messages", user.id]});
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Failed to send message",
        description: "Please try again later.",
        className: "bg-red-50 border-red-200 text-red-800",
      });
    }
  };
  
  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        <div className="border-b">
          <div className="px-6 py-3 flex justify-between items-center">
            <h2 className="text-xl font-bold tracking-tight">Messages</h2>
            <div className="relative w-64">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                className="pl-8"
              />
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <div className="grid h-full md:grid-cols-[280px_1fr]">
            {/* Conversations list */}
            <div className="flex flex-col border-r">
              <div className="p-4 font-medium">
                Conversations
                {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin inline" />}
              </div>
              
              <div className="overflow-auto">
                {!isLoading && uniqueContacts.length === 0 ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center space-y-2">
                      <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No conversations yet</p>
                    </div>
                  </div>
                ) : (
                  uniqueContacts.map((contactId) => {
                    // In a real app, you would fetch user details for each contact
                    const contactName = `User ${contactId}`;
                    const lastMessage = messages?.find(m => 
                      (m.senderId === user?.id && m.receiverId === contactId) ||
                      (m.receiverId === user?.id && m.senderId === contactId)
                    );
                    const isActive = contactId === selectedConversation;
                    
                    return (
                      <div
                        key={contactId}
                        className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 ${
                          isActive ? "bg-muted" : ""
                        }`}
                        onClick={() => setSelectedConversation(contactId)}
                      >
                        <Avatar>
                          <AvatarFallback>{getInitials(contactName)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                          <div className="font-medium">{contactName}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {lastMessage?.content || "No messages yet"}
                          </div>
                        </div>
                        {lastMessage && (
                          <div className="text-xs text-muted-foreground">
                            {formatMessageTime(lastMessage.createdAt)}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            
            {/* Chat area */}
            <div className="flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat header */}
                  <div className="border-b p-3 flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{getInitials(`User ${selectedConversation}`)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">User {selectedConversation}</div>
                      <div className="text-xs text-muted-foreground">Active now</div>
                    </div>
                  </div>
                  
                  {/* Messages container */}
                  <div className="flex-1 overflow-auto p-4 space-y-4">
                    {conversationMessages && conversationMessages.length > 0 ? (
                      conversationMessages.map((message) => {
                        const isSentByMe = message.senderId === user?.id;
                        
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isSentByMe ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`rounded-lg p-3 max-w-[80%] ${
                                isSentByMe
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <div>{message.content}</div>
                              <div className="text-xs mt-1 opacity-70">
                                {formatMessageTime(message.createdAt)}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center space-y-2">
                          <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">No messages yet</p>
                          <p className="text-xs text-muted-foreground">Send a message to start a conversation</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Message input */}
                  <div className="border-t p-3 flex flex-col gap-2">
                    {/* Draft message indicator */}
                    {draftMode && (
                      <div className="flex items-center justify-between py-1 px-2 bg-amber-50 text-amber-800 rounded text-xs">
                        <div className="flex items-center">
                          <File className="h-3 w-3 mr-1" />
                          <span>Draft message</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 px-1 text-amber-800 hover:text-amber-900 hover:bg-amber-100"
                          onClick={() => {
                            if (selectedConversation) deleteDraft(selectedConversation);
                          }}
                        >
                          Clear
                        </Button>
                      </div>
                    )}
                    
                    {/* Message textarea */}
                    <Textarea
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="min-h-[80px] resize-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.ctrlKey && messageText.trim()) {
                          handleSendMessage();
                        }
                      }}
                    />
                    
                    {/* Action buttons */}
                    <div className="flex justify-between items-center">
                      <div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mr-2"
                          onClick={() => saveDraft()}
                          disabled={!messageText.trim() || !selectedConversation}
                        >
                          <Save className="h-4 w-4 mr-1" />
                          Save as Draft
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowDrafts(!showDrafts)}
                        >
                          <File className="h-4 w-4 mr-1" />
                          {showDrafts ? 'Hide Drafts' : 'Show Drafts'}
                        </Button>
                      </div>
                      
                      <Button
                        disabled={!messageText.trim()}
                        onClick={handleSendMessage}
                        className="bg-[#131313] text-white hover:bg-white hover:text-[#131313] transition-all"
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Send
                      </Button>
                    </div>
                    
                    {/* Drafts list */}
                    {showDrafts && Object.keys(drafts).length > 0 && (
                      <div className="mt-2 border rounded p-2">
                        <h4 className="text-sm font-medium mb-2">Your Drafts</h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {Object.entries(drafts).map(([convId, text]) => (
                            <div key={convId} className="flex justify-between items-center p-2 bg-muted/50 rounded text-sm">
                              <div className="truncate flex-1">
                                <span className="font-medium">To: User {convId}</span>
                                <p className="text-xs text-muted-foreground truncate">{text}</p>
                              </div>
                              <div className="flex">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-7 w-7 p-0 mr-1"
                                  onClick={() => {
                                    setSelectedConversation(Number(convId));
                                    setShowDrafts(false);
                                  }}
                                >
                                  <MessageSquare className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-7 w-7 p-0 text-destructive"
                                  onClick={() => deleteDraft(Number(convId))}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="text-lg font-medium">Your Messages</h3>
                    <p className="text-sm text-muted-foreground">
                      Select a conversation from the sidebar to view messages
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}