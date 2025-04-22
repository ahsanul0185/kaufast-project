import { useState, useEffect } from 'react';
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
import { Save, FileText, FilePlus, Plus, Upload, Loader2 } from 'lucide-react';
import { queryClient } from '@/lib/queryClient';

interface PropertyDraft {
  id?: string;
  title: string;
  description: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  propertyType: string;
  createdAt: string;
}

const defaultDraft: PropertyDraft = {
  title: '',
  description: '',
  price: '',
  bedrooms: '',
  bathrooms: '',
  propertyType: 'house',
  createdAt: new Date().toISOString(),
};

export default function PropertyDraftButton() {
  const [open, setOpen] = useState(false);
  const [showDrafts, setShowDrafts] = useState(false);
  const [currentDraft, setCurrentDraft] = useState<PropertyDraft>(defaultDraft);
  const [drafts, setDrafts] = useState<PropertyDraft[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Load drafts from localStorage on component mount
  useEffect(() => {
    const savedDrafts = localStorage.getItem('propertyDrafts');
    if (savedDrafts) {
      try {
        setDrafts(JSON.parse(savedDrafts));
      } catch (e) {
        console.error('Failed to parse drafts:', e);
      }
    }
  }, []);

  // Save drafts to localStorage
  const saveDrafts = (updatedDrafts: PropertyDraft[]) => {
    localStorage.setItem('propertyDrafts', JSON.stringify(updatedDrafts));
    setDrafts(updatedDrafts);
  };

  // Save current draft
  const saveDraft = () => {
    if (!currentDraft.title.trim()) {
      toast({
        title: 'Title is required',
        description: 'Please enter a title for your property draft.',
        className: 'bg-red-50 border-red-200 text-red-800',
      });
      return;
    }

    const now = new Date().toISOString();
    const updatedDraft = {
      ...currentDraft,
      createdAt: now,
      id: currentDraft.id || `draft_${Date.now()}`,
    };

    let updatedDrafts: PropertyDraft[];
    if (currentDraft.id) {
      // Update existing draft
      updatedDrafts = drafts.map(d => d.id === currentDraft.id ? updatedDraft : d);
    } else {
      // Create new draft
      updatedDrafts = [...drafts, updatedDraft];
    }

    saveDrafts(updatedDrafts);
    toast({
      title: 'Draft saved',
      description: 'Your property draft has been saved successfully.',
      className: 'bg-blue-50 border-blue-200 text-blue-800',
    });
    
    setCurrentDraft(defaultDraft);
    setOpen(false);
  };
  
  // Submit property to server
  const submitProperty = async (draft: PropertyDraft) => {
    if (!draft.title.trim()) {
      toast({
        title: 'Title is required',
        description: 'Please enter a title for your property.',
        className: 'bg-red-50 border-red-200 text-red-800',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Convert draft to property format
      const propertyData = {
        title: draft.title,
        description: draft.description,
        price: Number(draft.price) || 0,
        address: draft.title, // Using title as address for now
        bedrooms: Number(draft.bedrooms) || 0,
        bathrooms: Number(draft.bathrooms) || 0,
        propertyType: draft.propertyType,
        status: 'available',
        listingType: 'buy',
        size: 0,
        yearBuilt: new Date().getFullYear(),
        features: [],
        agentId: 232, // Set to agent ID - in a real app, use current user ID
        neighborhoodId: 1,
        latitude: 40.7128,
        longitude: -74.0060,
        images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9'],
        views: 0,
        isVerified: true,
        isPremium: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Send to server
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(propertyData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit property');
      }
      
      // If this was a draft with an ID, remove it from drafts
      if (draft.id) {
        const updatedDrafts = drafts.filter(d => d.id !== draft.id);
        saveDrafts(updatedDrafts);
      }
      
      // Refresh properties list
      queryClient.invalidateQueries({queryKey: ['/api/properties']});
      queryClient.invalidateQueries({queryKey: ['/api/properties/featured']});
      
      toast({
        title: 'Property added successfully',
        description: 'Your property has been added to the listings.',
        className: 'bg-green-50 border-green-200 text-green-800',
      });
      
      setShowDrafts(false);
    } catch (error) {
      console.error('Error submitting property:', error);
      toast({
        title: 'Failed to add property',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        className: 'bg-red-50 border-red-200 text-red-800',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load a draft for editing
  const editDraft = (draft: PropertyDraft) => {
    setCurrentDraft(draft);
    setShowDrafts(false);
    setOpen(true);
  };

  // Delete a draft
  const deleteDraft = (draftId: string) => {
    const updatedDrafts = drafts.filter(d => d.id !== draftId);
    saveDrafts(updatedDrafts);
    toast({
      title: 'Draft deleted',
      description: 'Your property draft has been deleted.',
      className: 'bg-orange-50 border-orange-200 text-orange-800',
    });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Create a new draft
  const createNewDraft = () => {
    setCurrentDraft(defaultDraft);
    setShowDrafts(false);
    setOpen(true);
  };

  return (
    <div>
      {/* Main draft button */}
      <Button
        className="bg-[#131313] text-white hover:bg-white hover:text-[#131313] transition-all"
        onClick={createNewDraft}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Property
      </Button>

      {/* Button to show drafts */}
      {drafts.length > 0 && (
        <Button
          variant="outline"
          className="ml-2 border-[#131313] text-[#131313] hover:bg-[#131313] hover:text-white"
          onClick={() => setShowDrafts(true)}
        >
          <FileText className="h-4 w-4 mr-2" />
          Drafts ({drafts.length})
        </Button>
      )}

      {/* New draft dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentDraft.id ? 'Edit Property Draft' : 'Create New Property'}</DialogTitle>
            <DialogDescription>
              {currentDraft.id ? 
                'Edit your property draft. The changes will be saved as a draft until you submit it.' :
                'Fill out the property details. You can save this as a draft to finish later.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                className="col-span-3"
                placeholder="Luxury Apartment in Downtown"
                value={currentDraft.title}
                onChange={(e) => setCurrentDraft({...currentDraft, title: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price
              </Label>
              <Input
                id="price"
                className="col-span-3"
                placeholder="250000"
                type="number"
                value={currentDraft.price}
                onChange={(e) => setCurrentDraft({...currentDraft, price: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="propertyType" className="text-right">
                Property Type
              </Label>
              <Select 
                value={currentDraft.propertyType}
                onValueChange={(value) => setCurrentDraft({...currentDraft, propertyType: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="condo">Condo</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bedrooms" className="text-right">
                Bedrooms
              </Label>
              <Input
                id="bedrooms"
                className="col-span-3"
                placeholder="3"
                type="number"
                value={currentDraft.bedrooms}
                onChange={(e) => setCurrentDraft({...currentDraft, bedrooms: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bathrooms" className="text-right">
                Bathrooms
              </Label>
              <Input
                id="bathrooms"
                className="col-span-3"
                placeholder="2"
                type="number"
                value={currentDraft.bathrooms}
                onChange={(e) => setCurrentDraft({...currentDraft, bathrooms: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="description"
                className="col-span-3"
                placeholder="Describe the property..."
                rows={5}
                value={currentDraft.description}
                onChange={(e) => setCurrentDraft({...currentDraft, description: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="mr-2 bg-[#131313] text-white hover:bg-white hover:text-[#131313] transition-all"
              onClick={saveDraft}
            >
              <Save className="h-4 w-4 mr-2" />
              Save as Draft
            </Button>
            <Button 
              className="bg-green-600 text-white hover:bg-green-700"
              onClick={() => {
                if (currentDraft.title.trim()) {
                  submitProperty(currentDraft);
                  setOpen(false);
                } else {
                  toast({
                    title: 'Title is required',
                    description: 'Please enter a title for your property.',
                    className: 'bg-red-50 border-red-200 text-red-800',
                  });
                }
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {isSubmitting ? "Submitting..." : "Submit Property"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Drafts list dialog */}
      <Dialog open={showDrafts} onOpenChange={setShowDrafts}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Saved Property Drafts</DialogTitle>
            <DialogDescription>
              View and manage your saved property drafts.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto py-4">
            {drafts.map((draft) => (
              <div 
                key={draft.id} 
                className="border rounded-md p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{draft.title}</h4>
                    <p className="text-sm text-muted-foreground truncate">{draft.description || 'No description'}</p>
                    <div className="flex mt-2 text-sm">
                      <span className="text-muted-foreground mr-3">
                        ${parseInt(draft.price).toLocaleString() || '0'}
                      </span>
                      {draft.bedrooms && (
                        <span className="text-muted-foreground mr-3">
                          {draft.bedrooms} bed
                        </span>
                      )}
                      {draft.bathrooms && (
                        <span className="text-muted-foreground">
                          {draft.bathrooms} bath
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Last edited: {formatDate(draft.createdAt)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => editDraft(draft)}
                    >
                      Edit
                    </Button>
                    <Button 
                      className="bg-[#131313] text-white hover:bg-white hover:text-[#131313] transition-all"
                      size="sm"
                      onClick={() => submitProperty(draft)}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-1" />
                      )}
                      {isSubmitting ? "Submitting..." : "Submit"}
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => deleteDraft(draft.id!)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {drafts.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No drafts yet</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  You haven't saved any property drafts.
                </p>
                <Button 
                  className="mt-4 bg-[#131313] text-white hover:bg-white hover:text-[#131313] transition-all" 
                  onClick={() => {
                    setShowDrafts(false);
                    createNewDraft();
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Property
                </Button>
              </div>
            )}
          </div>
          
          <DialogFooter>
            {drafts.length > 0 && (
              <Button 
                className="bg-[#131313] text-white hover:bg-white hover:text-[#131313] transition-all" 
                onClick={() => {
                  setShowDrafts(false);
                  createNewDraft();
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Property
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}