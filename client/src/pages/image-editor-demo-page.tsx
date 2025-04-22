import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ImageEditor from "@/components/property/ImageEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ImageEditorDemoPage() {
  const [processedImages, setProcessedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [showEditor, setShowEditor] = useState(true);

  const handleImageProcessed = (file: File) => {
    setProcessedImages(prev => [...prev, file]);
    
    // Create preview URL for the processed image
    const imageUrl = URL.createObjectURL(file);
    setPreviewUrls(prev => [...prev, imageUrl]);
  };

  const resetDemo = () => {
    // Clean up object URLs to prevent memory leaks
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    
    setProcessedImages([]);
    setPreviewUrls([]);
    setShowEditor(true);
  };

  const addAnotherImage = () => {
    setShowEditor(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold mb-8">Image Editor Demo</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Image Editor Component</CardTitle>
              </CardHeader>
              <CardContent>
                {showEditor ? (
                  <ImageEditor 
                    onImageProcessed={(file) => {
                      handleImageProcessed(file);
                      setShowEditor(false);
                    }} 
                  />
                ) : (
                  <div className="text-center p-8">
                    <p className="text-lg mb-4">Image processed successfully!</p>
                    <Button onClick={addAnotherImage} className="bg-black hover:bg-white hover:text-black text-white">
                      Add Another Image
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Processed Images ({processedImages.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {processedImages.length === 0 ? (
                  <div className="text-center py-10 text-neutral-500">
                    <p>No processed images yet. Use the editor to crop and convert images to WebP format.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {processedImages.map((file, index) => (
                      <div key={index} className="border rounded-md p-4">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="rounded-md overflow-hidden">
                            <img 
                              src={previewUrls[index]} 
                              alt={`Processed ${index}`} 
                              className="h-24 w-auto object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{file.name}</h3>
                            <p className="text-sm text-neutral-500">
                              {file.type} • {(file.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <div className="text-sm bg-neutral-100 p-3 rounded-md">
                          <p className="font-mono truncate">
                            <span className="text-neutral-500">// This would be uploaded to the server in a real app</span>
                          </p>
                          <code className="text-neutral-700">
                            formData.append('images', file, file.name);
                          </code>
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex justify-end">
                      <Button variant="outline" onClick={resetDemo}>
                        Reset Demo
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}