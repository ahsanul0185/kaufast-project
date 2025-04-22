import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { searchPropertySchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth } from "./auth";
import { processVoiceCommand, analyzeText } from "./anthropic";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Missing STRIPE_SECRET_KEY env variable. Stripe functionality will not work.');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  const apiRouter = express.Router();
  
  // Properties API
  apiRouter.get("/properties", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      const properties = await storage.getProperties(limit, offset);
      res.json(properties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });
  
  apiRouter.get("/properties/featured", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
      const featuredProperties = await storage.getFeaturedProperties(limit);
      res.json(featuredProperties);
    } catch (error) {
      console.error("Error fetching featured properties:", error);
      res.status(500).json({ message: "Failed to fetch featured properties" });
    }
  });
  
  apiRouter.get("/properties/search", async (req: Request, res: Response) => {
    try {
      // Parse query parameters
      const params = {
        query: req.query.query as string | undefined,
        city: req.query.city as string | undefined,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        bedrooms: req.query.bedrooms ? parseInt(req.query.bedrooms as string) : undefined,
        bathrooms: req.query.bathrooms ? parseInt(req.query.bathrooms as string) : undefined,
        propertyType: req.query.propertyType as any,
        listingType: req.query.listingType as any,
        minSquareFeet: req.query.minSquareFeet ? parseFloat(req.query.minSquareFeet as string) : undefined,
        maxSquareFeet: req.query.maxSquareFeet ? parseFloat(req.query.maxSquareFeet as string) : undefined,
        features: req.query.features ? (req.query.features as string).split(',') : undefined,
        lat: req.query.lat ? parseFloat(req.query.lat as string) : undefined,
        lng: req.query.lng ? parseFloat(req.query.lng as string) : undefined,
        radius: req.query.radius ? parseFloat(req.query.radius as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 9,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      };
      
      // Validate parameters
      const validParams = searchPropertySchema.parse(params);
      
      // Search properties
      const result = await storage.searchProperties(validParams);
      
      res.json(result);
    } catch (error) {
      console.error("Error searching properties:", error);
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: "Failed to search properties" });
      }
    }
  });
  
  apiRouter.get("/properties/:id", async (req: Request, res: Response) => {
    try {
      const propertyId = parseInt(req.params.id);
      const property = await storage.getProperty(propertyId);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      res.json(property);
    } catch (error) {
      console.error("Error fetching property:", error);
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });
  
  // Single property create endpoint
  apiRouter.post("/properties", async (req: Request, res: Response) => {
    try {
      // In a real app, verify user is authenticated
      // if (!req.isAuthenticated()) {
      //   return res.status(401).json({ message: "Not authenticated" });
      // }
      
      const propertyData = req.body;
      
      // Process and validate property data
      const processedProperty = {
        ...propertyData,
        // Convert any necessary fields
        price: Number(propertyData.price),
        bedrooms: Number(propertyData.bedrooms),
        bathrooms: Number(propertyData.bathrooms),
        size: Number(propertyData.size) || 0,
        // Format array properties correctly
        features: Array.isArray(propertyData.features) ? propertyData.features : 
          (propertyData.features ? String(propertyData.features).split(';') : []),
        images: Array.isArray(propertyData.images) ? propertyData.images : 
          (propertyData.images ? String(propertyData.images).split(';') : [])
      };
      
      // Create the property
      const property = await storage.createProperty(processedProperty);
      
      res.status(201).json(property);
    } catch (error) {
      console.error("Error creating property:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to create property" 
      });
    }
  });
  
  // Neighborhoods API
  apiRouter.get("/neighborhoods", async (req: Request, res: Response) => {
    try {
      const neighborhoods = await storage.getNeighborhoods();
      res.json(neighborhoods);
    } catch (error) {
      console.error("Error fetching neighborhoods:", error);
      res.status(500).json({ message: "Failed to fetch neighborhoods" });
    }
  });
  
  apiRouter.get("/neighborhoods/:id", async (req: Request, res: Response) => {
    try {
      const neighborhoodId = parseInt(req.params.id);
      const neighborhood = await storage.getNeighborhood(neighborhoodId);
      
      if (!neighborhood) {
        return res.status(404).json({ message: "Neighborhood not found" });
      }
      
      res.json(neighborhood);
    } catch (error) {
      console.error("Error fetching neighborhood:", error);
      res.status(500).json({ message: "Failed to fetch neighborhood" });
    }
  });
  
  // Favorites API (requires auth in real app)
  apiRouter.get("/favorites/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      // Note: In a real app, we would check if the authenticated user is authorized
      const favorites = await storage.getFavoritesByUserId(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });
  
  apiRouter.post("/favorites", async (req: Request, res: Response) => {
    try {
      const favorite = await storage.addFavorite(req.body);
      res.status(201).json(favorite);
    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });
  
  apiRouter.delete("/favorites/:userId/:propertyId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const propertyId = parseInt(req.params.propertyId);
      // Note: In a real app, we would check if the authenticated user is authorized
      const success = await storage.removeFavorite(userId, propertyId);
      
      if (!success) {
        return res.status(404).json({ message: "Favorite not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });
  
  // Messages API (requires auth in real app)
  apiRouter.get("/messages/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      // Note: In a real app, we would check if the authenticated user is authorized
      const messages = await storage.getMessagesByUserId(userId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });
  
  apiRouter.post("/messages", async (req: Request, res: Response) => {
    try {
      const message = await storage.createMessage(req.body);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });
  
  // Check bulk upload status (free first-time use or premium required)
  apiRouter.get("/user/bulk-upload-status", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, message: "You must be logged in to check bulk upload status" });
      }
      
      const user = req.user;
      
      // Check if the user is an agent (only agents can use bulk upload)
      if (user.role !== 'agent' && user.role !== 'admin') {
        return res.status(403).json({ success: false, message: "Only agents can use bulk uploads" });
      }
      
      // Check if user has used their free bulk upload
      const hasUsedFreeUpload = user.hasUsedFreeUpload || false;
      const isPremium = user.subscriptionTier === 'premium' || user.subscriptionTier === 'enterprise';
      
      res.json({
        success: true,
        hasUsedFreeUpload,
        isPremium,
        canUseFeature: isPremium || !hasUsedFreeUpload
      });
    } catch (error: any) {
      console.error("Error checking bulk upload status:", error);
      res.status(500).json({ success: false, message: error.message || "Error checking bulk upload status" });
    }
  });
  
  // Bulk property upload endpoint
  apiRouter.post("/properties/bulk", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = req.user;
      
      // Check if user has required role
      if (user.role !== 'admin' && user.role !== 'agent') {
        return res.status(403).json({ 
          message: "Bulk upload is available only for agents and admins"
        });
      }
      
      // Check if user is eligible for bulk upload (premium/enterprise subscription OR first-time free use)
      const isPremium = user.subscriptionTier === 'premium' || user.subscriptionTier === 'enterprise';
      const hasUsedFreeUpload = user.hasUsedFreeUpload || false;
      
      // If not premium and already used free upload, deny access
      if (user.role === 'agent' && !isPremium && hasUsedFreeUpload) {
        return res.status(403).json({ 
          message: "You've already used your free bulk upload. Premium subscription required for additional uploads."
        });
      }
      
      const { properties } = req.body;
      
      if (!Array.isArray(properties) || properties.length === 0) {
        return res.status(400).json({ message: "No properties provided for upload" });
      }
      
      // Limit number of properties for safety
      const maxProperties = user.role === 'admin' ? 100 : 50;
      if (properties.length > maxProperties) {
        return res.status(400).json({ 
          message: `Maximum ${maxProperties} properties can be uploaded at once` 
        });
      }
      
      // Process and prepare properties for database insertion
      const processedProperties = properties.map(property => {
        // Convert string values to appropriate types
        const processedProperty = {
          ...property,
          // Ensure required fields with correct types
          title: String(property.title),
          description: String(property.description),
          price: Number(property.price),
          address: String(property.address),
          city: String(property.city),
          country: String(property.country),
          // Convert to appropriate types when present
          bedrooms: property.bedrooms ? Number(property.bedrooms) : null,
          bathrooms: property.bathrooms ? Number(property.bathrooms) : null,
          squareFeet: property.squareFeet ? Number(property.squareFeet) : null,
          lotSize: property.lotSize ? Number(property.lotSize) : null,
          // Set appropriate boolean values
          isPremium: Boolean(property.isPremium),
          isVerified: Boolean(property.isVerified),
          // Assign owner ID
          ownerId: user.id,
          // Format the properties that might require special handling
          features: Array.isArray(property.features) ? property.features : 
            (property.features ? String(property.features).split(';') : []),
          images: Array.isArray(property.images) ? property.images : 
            (property.images ? String(property.images).split(';') : [])
        };
        
        return processedProperty;
      });
      
      // Insert properties in bulk
      const result = await storage.createPropertiesBulk(processedProperties);
      
      // If this is a non-premium user's first free use, mark them as having used it
      let isFirstFreeUse = false;
      if (user.role === 'agent' && !isPremium && !hasUsedFreeUpload) {
        await storage.updateUser(user.id, { hasUsedFreeUpload: true });
        isFirstFreeUse = true;
      }
      
      res.status(201).json({
        message: "Properties uploaded successfully",
        inserted: result.length,
        properties: result,
        isFirstFreeUse
      });
    } catch (error) {
      console.error('Error uploading properties in bulk:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to upload properties'
      });
    }
  });
  
  // AI and voice search routes
  apiRouter.post("/ai/analyze", async (req: Request, res: Response) => {
    try {
      const { prompt } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ message: "No prompt provided" });
      }
      
      const analysis = await analyzeText(prompt);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing text:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to analyze text" 
      });
    }
  });
  
  apiRouter.post("/ai/search-properties", async (req: Request, res: Response) => {
    try {
      const { voiceCommand } = req.body;
      
      if (!voiceCommand) {
        return res.status(400).json({ message: "No voice command provided" });
      }
      
      // Process the voice command to extract search parameters
      const searchParams = await processVoiceCommand(voiceCommand);
      
      // Use the extracted parameters to search for properties
      const result = await storage.searchProperties(searchParams);
      
      res.json({
        parameters: searchParams,
        results: result
      });
    } catch (error) {
      console.error("Error processing voice search:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to process voice search" 
      });
    }
  });
  
  // Subscription endpoints
  apiRouter.post("/get-or-create-subscription", async (req: Request, res: Response) => {
    try {
      // Verify authentication
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = req.user;

      // Only agents and admins can subscribe
      if (user.role !== 'agent' && user.role !== 'admin') {
        return res.status(403).json({ 
          message: "Only agents can subscribe to premium plans"
        });
      }

      // Check if user already has an active subscription
      let subscription = await storage.getSubscriptionByUserId(user.id);
      
      if (subscription) {
        // If there's an existing active subscription, return it
        if (subscription.status === 'active') {
          return res.json({
            message: "You already have an active subscription",
            subscription
          });
        }
        
        // Retrieve the Stripe subscription to get the latest payment intent
        try {
          // Handle null values safely
          if (subscription.stripeSubscriptionId) {
            const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
            
            // Check if the subscription has a latest invoice
            if (stripeSubscription.latest_invoice) {
              let invoiceId: string;
              
              // Get the invoice ID safely
              if (typeof stripeSubscription.latest_invoice === 'string') {
                invoiceId = stripeSubscription.latest_invoice;
              } else if (stripeSubscription.latest_invoice.id) {
                invoiceId = stripeSubscription.latest_invoice.id;
              } else {
                throw new Error('Could not determine invoice ID');
              }
              
              // Retrieve the full invoice
              const invoice = await stripe.invoices.retrieve(invoiceId);
              
              // Check if the invoice has a payment intent
              if (invoice.payment_intent) {
                let paymentIntentId: string;
                
                // Get the payment intent ID safely
                if (typeof invoice.payment_intent === 'string') {
                  paymentIntentId = invoice.payment_intent;
                } else if (invoice.payment_intent.id) {
                  paymentIntentId = invoice.payment_intent.id;
                } else {
                  throw new Error('Could not determine payment intent ID');
                }
                
                // Retrieve the payment intent to get the client secret
                const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
                
                return res.json({
                  subscriptionId: subscription.id,
                  clientSecret: paymentIntent.client_secret
                });
              }
            }
          }
        } catch (error) {
          console.error("Error retrieving Stripe subscription:", error);
          // If we can't retrieve the existing subscription, we'll create a new one
        }
      }

      // Create a Stripe customer if the user doesn't have one
      let stripeCustomerId = user.stripeCustomerId;
      
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email || 'no-email@example.com',
          name: user.username,
          metadata: {
            userId: user.id.toString()
          }
        });
        
        // Update user with the new Stripe customer ID
        await storage.updateStripeCustomerId(user.id, customer.id);
        stripeCustomerId = customer.id;
      }
      
      // Get the price ID from environment variables or use a default for testing
      const priceId = process.env.STRIPE_PRICE_ID || 'price_1PAqXCPEa7wLXG8DkpzFX5jo';
      
      // Create a subscription with Stripe
      const stripeSubscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [
          {
            price: priceId
          }
        ],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription'
        },
        expand: ['latest_invoice.payment_intent']
      });
      
      // Get dates from the subscription with conversion from Unix timestamps
      const currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
      const currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
      
      // Create a subscription record in our database
      const newSubscription = await storage.createSubscription({
        userId: user.id,
        stripeSubscriptionId: stripeSubscription.id,
        status: stripeSubscription.status,
        tier: 'premium',
        currentPeriodStart: currentPeriodStart,
        currentPeriodEnd: currentPeriodEnd,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end
      });
      
      // Update user subscription tier
      await storage.updateUserSubscription(user.id, 'premium');
      
      // Get latest invoice and payment intent
      if (stripeSubscription.latest_invoice) {
        let invoiceId: string;
        
        // Get the invoice ID safely
        if (typeof stripeSubscription.latest_invoice === 'string') {
          invoiceId = stripeSubscription.latest_invoice;
        } else if (stripeSubscription.latest_invoice.id) {
          invoiceId = stripeSubscription.latest_invoice.id;
        } else {
          throw new Error('Could not determine invoice ID');
        }
        
        // Retrieve the full invoice
        const invoice = await stripe.invoices.retrieve(invoiceId);
        
        // Check if the invoice has a payment intent
        if (invoice.payment_intent) {
          let paymentIntentId: string;
          
          // Get the payment intent ID safely
          if (typeof invoice.payment_intent === 'string') {
            paymentIntentId = invoice.payment_intent;
          } else if (invoice.payment_intent.id) {
            paymentIntentId = invoice.payment_intent.id;
          } else {
            throw new Error('Could not determine payment intent ID');
          }
          
          // Retrieve the payment intent to get the client secret
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
          
          return res.json({
            subscriptionId: newSubscription.id,
            clientSecret: paymentIntent.client_secret
          });
        }
      }
      
      res.status(500).json({ message: "Failed to create payment intent" });
    } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to create subscription" 
      });
    }
  });
  
  // Stripe webhook handler for subscription events
  apiRouter.post("/webhook", express.raw({type: 'application/json'}), async (req: Request, res: Response) => {
    try {
      // Verify the webhook signature
      const sig = req.headers['stripe-signature'] as string;
      
      if (!sig) {
        return res.status(400).json({ message: "Missing Stripe signature" });
      }
      
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!endpointSecret) {
        return res.status(500).json({ message: "Webhook secret not configured" });
      }
      
      let event;
      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          endpointSecret
        );
      } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return res.status(400).json({ message: "Invalid signature" });
      }
      
      // Handle specific events
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          const subscription = event.data.object;
          // Update subscription status in database
          await storage.updateSubscriptionStatus(subscription.id, subscription.status);
          break;
          
        case 'customer.subscription.deleted':
          const deletedSubscription = event.data.object;
          // Update subscription status to canceled
          await storage.updateSubscriptionStatus(deletedSubscription.id, 'canceled');
          
          // Update user subscription tier to free
          const subRecord = await storage.getSubscriptionByStripeId(deletedSubscription.id);
          if (subRecord) {
            await storage.updateUserSubscription(subRecord.userId, 'free');
          }
          break;
          
        case 'invoice.payment_succeeded':
          const invoice = event.data.object;
          if (invoice.subscription) {
            // Update subscription status to active
            await storage.updateSubscriptionStatus(invoice.subscription, 'active');
          }
          break;
          
        case 'invoice.payment_failed':
          const failedInvoice = event.data.object;
          if (failedInvoice.subscription) {
            // Update subscription status to past_due
            await storage.updateSubscriptionStatus(failedInvoice.subscription, 'past_due');
          }
          break;
          
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
      
      res.status(200).json({ received: true });
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to process webhook" 
      });
    }
  });

  // Property Tours API
  apiRouter.get("/property-tours/user/:userId", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated and authorized
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Ensure user can only view their own tours unless they're an agent
      if (req.user.id !== parseInt(req.params.userId) && req.user.role !== 'agent' && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to view these tours" });
      }
      
      const userId = parseInt(req.params.userId);
      const tours = await storage.getPropertyToursByUserId(userId);
      
      // Fetch property details for each tour
      const toursWithDetails = await Promise.all(tours.map(async (tour) => {
        const property = await storage.getProperty(tour.propertyId);
        return {
          ...tour,
          property
        };
      }));
      
      res.json(toursWithDetails);
    } catch (error) {
      console.error("Error fetching property tours:", error);
      res.status(500).json({ message: "Failed to fetch property tours" });
    }
  });
  
  apiRouter.get("/property-tours/agent/:agentId", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated and authorized
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Ensure user can only view their own tours as an agent
      if (req.user.id !== parseInt(req.params.agentId) && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to view these tours" });
      }
      
      const agentId = parseInt(req.params.agentId);
      const tours = await storage.getPropertyToursByAgentId(agentId);
      
      // Fetch property and user details for each tour
      const toursWithDetails = await Promise.all(tours.map(async (tour) => {
        const property = await storage.getProperty(tour.propertyId);
        const user = await storage.getUser(tour.userId);
        return {
          ...tour,
          property,
          user: user ? {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone
          } : null
        };
      }));
      
      res.json(toursWithDetails);
    } catch (error) {
      console.error("Error fetching agent property tours:", error);
      res.status(500).json({ message: "Failed to fetch agent property tours" });
    }
  });
  
  apiRouter.get("/property-tours/property/:propertyId", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated and authorized
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const propertyId = parseInt(req.params.propertyId);
      
      // Get the property
      const property = await storage.getProperty(propertyId);
      
      // Ensure user can only view tours for their own property
      if (property && property.ownerId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to view these tours" });
      }
      
      const tours = await storage.getPropertyToursByPropertyId(propertyId);
      res.json(tours);
    } catch (error) {
      console.error("Error fetching property tours:", error);
      res.status(500).json({ message: "Failed to fetch property tours" });
    }
  });
  
  apiRouter.post("/property-tours", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { propertyId, agentId, scheduledDate, endTime, notes } = req.body;
      
      // Validate required fields
      if (!propertyId || !agentId || !scheduledDate || !endTime) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Check if the property exists
      const property = await storage.getProperty(propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      // Check if the agent exists and is an agent
      const agent = await storage.getUser(agentId);
      if (!agent || agent.role !== 'agent') {
        return res.status(400).json({ message: "Invalid agent" });
      }
      
      // Check availability
      const scheduledDateObj = new Date(scheduledDate);
      const endTimeObj = new Date(endTime);
      
      const isAvailable = await storage.checkPropertyTourAvailability(
        propertyId, 
        scheduledDateObj, 
        endTimeObj
      );
      
      if (!isAvailable) {
        return res.status(409).json({ message: "This time slot is not available" });
      }
      
      // Create the tour
      const tour = await storage.createPropertyTour({
        propertyId,
        userId: req.user.id,
        agentId,
        scheduledDate: scheduledDateObj,
        endTime: endTimeObj,
        status: 'pending',
        notes: notes || null
      });
      
      res.status(201).json(tour);
    } catch (error) {
      console.error("Error creating property tour:", error);
      res.status(500).json({ message: "Failed to create property tour" });
    }
  });
  
  apiRouter.get("/property-tours/availability/:propertyId", async (req: Request, res: Response) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      const { date, endTime } = req.query;
      
      if (!date || !endTime) {
        return res.status(400).json({ message: "Missing required date parameters" });
      }
      
      const dateObj = new Date(date as string);
      const endTimeObj = new Date(endTime as string);
      
      const isAvailable = await storage.checkPropertyTourAvailability(
        propertyId,
        dateObj,
        endTimeObj
      );
      
      res.json({ available: isAvailable });
    } catch (error) {
      console.error("Error checking availability:", error);
      res.status(500).json({ message: "Failed to check availability" });
    }
  });
  
  apiRouter.patch("/property-tours/:id/status", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const tourId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !['pending', 'confirmed', 'completed', 'canceled'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      // Get the tour
      const tour = await storage.getPropertyTour(tourId);
      
      if (!tour) {
        return res.status(404).json({ message: "Tour not found" });
      }
      
      // Check authorization - only the user who booked, the agent, or an admin can update status
      if (tour.userId !== req.user.id && tour.agentId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to update this tour" });
      }
      
      // Update the status
      const updatedTour = await storage.updatePropertyTourStatus(tourId, status);
      res.json(updatedTour);
    } catch (error) {
      console.error("Error updating tour status:", error);
      res.status(500).json({ message: "Failed to update tour status" });
    }
  });
  
  apiRouter.delete("/property-tours/:id", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const tourId = parseInt(req.params.id);
      
      // Get the tour
      const tour = await storage.getPropertyTour(tourId);
      
      if (!tour) {
        return res.status(404).json({ message: "Tour not found" });
      }
      
      // Check authorization - only the user who booked, the agent, or an admin can cancel
      if (tour.userId !== req.user.id && tour.agentId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to cancel this tour" });
      }
      
      // Cancel the tour
      const canceledTour = await storage.cancelPropertyTour(tourId);
      res.json(canceledTour);
    } catch (error) {
      console.error("Error canceling tour:", error);
      res.status(500).json({ message: "Failed to cancel tour" });
    }
  });

  // Mount API routes
  app.use("/api", apiRouter);
  
  const httpServer = createServer(app);
  return httpServer;
}
