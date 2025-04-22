import { desc, eq, and, like, gte, lte, inArray, or, sql } from "drizzle-orm";
import { db } from "./db";
import { pool } from "./db";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { 
  users, neighborhoods, properties, favorites, messages, subscriptions, propertyTours,
  type User, type InsertUser, 
  type Property, type InsertProperty,
  type Neighborhood, type InsertNeighborhood,
  type Favorite, type InsertFavorite,
  type Message, type InsertMessage,
  type Subscription, type InsertSubscription,
  type PropertyTour, type InsertPropertyTour,
  type PropertySearchParams
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  updateStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User>;
  updateUserSubscription(userId: number, tier: string): Promise<User>;
  
  // Properties
  getProperty(id: number): Promise<Property | undefined>;
  getProperties(limit?: number, offset?: number): Promise<Property[]>;
  getFeaturedProperties(limit?: number): Promise<Property[]>;
  searchProperties(params: PropertySearchParams): Promise<{properties: Property[], total: number}>;
  createProperty(property: InsertProperty): Promise<Property>;
  createPropertiesBulk(properties: InsertProperty[]): Promise<Property[]>;
  updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(id: number): Promise<boolean>;
  
  // Neighborhoods
  getNeighborhood(id: number): Promise<Neighborhood | undefined>;
  getNeighborhoods(): Promise<Neighborhood[]>;
  createNeighborhood(neighborhood: InsertNeighborhood): Promise<Neighborhood>;
  
  // For session management
  sessionStore: session.Store;
  
  // Favorites
  getFavoritesByUserId(userId: number): Promise<Property[]>;
  isFavorite(userId: number, propertyId: number): Promise<boolean>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: number, propertyId: number): Promise<boolean>;
  
  // Messages
  getMessagesByUserId(userId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Subscriptions
  getSubscription(id: number): Promise<Subscription | undefined>;
  getSubscriptionByUserId(userId: number): Promise<Subscription | undefined>;
  getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, subscription: Partial<Subscription>): Promise<Subscription | undefined>;
  updateSubscriptionStatus(stripeSubscriptionId: string, status: string): Promise<Subscription | undefined>;
  deleteSubscription(id: number): Promise<boolean>;
  updateUserStripeInfo(userId: number, data: {customerId: string, subscriptionId: string}): Promise<User>;
  
  // Property Tours
  getPropertyTour(id: number): Promise<PropertyTour | undefined>;
  getPropertyToursByUserId(userId: number): Promise<PropertyTour[]>;
  getPropertyToursByAgentId(agentId: number): Promise<PropertyTour[]>;
  getPropertyToursByPropertyId(propertyId: number): Promise<PropertyTour[]>;
  createPropertyTour(tour: InsertPropertyTour): Promise<PropertyTour>;
  updatePropertyTourStatus(id: number, status: string): Promise<PropertyTour | undefined>;
  cancelPropertyTour(id: number): Promise<PropertyTour | undefined>;
  checkPropertyTourAvailability(propertyId: number, scheduledDate: Date, endTime: Date): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }
  
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }
  
  async updateStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ stripeCustomerId })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }
  
  async updateUserSubscription(userId: number, tier: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        subscriptionTier: tier as any
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }
  
  async updateUserStripeInfo(userId: number, data: {customerId: string, subscriptionId: string}): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        stripeCustomerId: data.customerId,
        stripeSubscriptionId: data.subscriptionId
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }
  
  // Properties
  async getProperty(id: number): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property;
  }
  
  async getProperties(limit = 10, offset = 0): Promise<Property[]> {
    return db.select().from(properties).limit(limit).offset(offset);
  }
  
  async getFeaturedProperties(limit = 6): Promise<Property[]> {
    return db.select()
      .from(properties)
      .where(eq(properties.isPremium, true))
      .limit(limit)
      .orderBy(desc(properties.createdAt));
  }
  
  async searchProperties(params: PropertySearchParams): Promise<{properties: Property[], total: number}> {
    const conditions = [];
    
    if (params.query) {
      conditions.push(or(
        like(properties.title, `%${params.query}%`),
        like(properties.description, `%${params.query}%`),
        like(properties.address, `%${params.query}%`),
        like(properties.city, `%${params.query}%`)
      ));
    }
    
    if (params.city) {
      conditions.push(eq(properties.city, params.city));
    }
    
    if (params.minPrice) {
      conditions.push(gte(properties.price, params.minPrice));
    }
    
    if (params.maxPrice) {
      conditions.push(lte(properties.price, params.maxPrice));
    }
    
    if (params.bedrooms) {
      conditions.push(gte(properties.bedrooms, params.bedrooms));
    }
    
    if (params.bathrooms) {
      conditions.push(gte(properties.bathrooms, params.bathrooms));
    }
    
    if (params.propertyType) {
      conditions.push(eq(properties.propertyType, params.propertyType));
    }
    
    if (params.listingType) {
      conditions.push(eq(properties.listingType, params.listingType));
    }
    
    if (params.minSquareFeet) {
      conditions.push(gte(properties.squareFeet, params.minSquareFeet));
    }
    
    if (params.maxSquareFeet) {
      conditions.push(lte(properties.squareFeet, params.maxSquareFeet));
    }
    
    // Prepare the base query
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    // Check for spatial search parameters
    if (params.lat && params.lng && params.radius) {
      // We'll handle the spatial search with raw SQL
      // Convert radius from km to meters
      const radiusInMeters = params.radius * 1000;
      
      // Create the spatial SQL query
      const spatialQuery = `
        SELECT 
          p.*,
          ST_Distance(
            ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326)::geography, 
            ST_SetSRID(ST_MakePoint(${params.lng}, ${params.lat}), 4326)::geography
          ) as distance
        FROM properties p
        WHERE ${whereClause ? 'AND ' : ''}
          ST_DWithin(
            ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326)::geography,
            ST_SetSRID(ST_MakePoint(${params.lng}, ${params.lat}), 4326)::geography,
            ${radiusInMeters}
          )
        ORDER BY distance
        LIMIT ${params.limit}
        OFFSET ${params.offset}
      `;
      
      // Count query to get total properties within radius
      const countSpatialQuery = `
        SELECT COUNT(*) 
        FROM properties p
        WHERE ${whereClause ? 'AND ' : ''}
          ST_DWithin(
            ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326)::geography,
            ST_SetSRID(ST_MakePoint(${params.lng}, ${params.lat}), 4326)::geography,
            ${radiusInMeters}
          )
      `;
      
      // Execute the spatial queries using the pool directly
      const propertiesResult = await pool.query(spatialQuery);
      const countResult = await pool.query(countSpatialQuery);
      
      // Return the results
      return {
        properties: propertiesResult.rows,
        total: parseInt(countResult.rows[0].count, 10)
      };
    } else {
      // Regular search without spatial component
      // Get total count
      const propertiesCount = await db.select().from(properties).where(whereClause);
      const count = propertiesCount.length;
      
      // Get properties
      const results = await db.select()
        .from(properties)
        .where(whereClause)
        .limit(params.limit)
        .offset(params.offset)
        .orderBy(desc(properties.createdAt));
      
      return {
        properties: results,
        total: Number(count)
      };
    }
    
    // This section is now handled in the if/else blocks above
  }
  
  async createProperty(property: InsertProperty): Promise<Property> {
    const newProperty = await db.insert(properties).values(property as any).returning();
    return newProperty[0];
  }
  
  async createPropertiesBulk(propertiesData: InsertProperty[]): Promise<Property[]> {
    // Validate all properties before inserting
    propertiesData.forEach(property => {
      if (!property.title || !property.price || !property.address) {
        throw new Error('All properties must have title, price, and address');
      }
    });
    
    // Make sure to have required fields for each property
    const processedProperties = propertiesData.map(property => ({
      ...property,
      isPremium: property.isPremium !== undefined ? property.isPremium : false,
      isVerified: property.isVerified !== undefined ? property.isVerified : false,
      images: property.images || [],
      features: property.features || [],
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    // Insert properties one by one to handle errors better
    const results: Property[] = [];
    
    for (const property of processedProperties) {
      try {
        const [newProperty] = await db
          .insert(properties)
          .values(property as any)
          .returning();
        
        results.push(newProperty);
      } catch (error) {
        console.error('Error inserting property:', error);
        // Continue with next property instead of failing the whole batch
      }
    }
    
    return results;
  }
  
  async updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property | undefined> {
    // Create a clean properties object with only the fields that are in the property parameter
    const cleanUpdate: Record<string, any> = {};
    
    // Add each property to the cleanUpdate object
    if (property.title !== undefined) cleanUpdate.title = property.title;
    if (property.description !== undefined) cleanUpdate.description = property.description;
    if (property.price !== undefined) cleanUpdate.price = property.price;
    if (property.address !== undefined) cleanUpdate.address = property.address;
    if (property.city !== undefined) cleanUpdate.city = property.city;
    if (property.country !== undefined) cleanUpdate.country = property.country;
    if (property.zipCode !== undefined) cleanUpdate.zipCode = property.zipCode;
    if (property.bedrooms !== undefined) cleanUpdate.bedrooms = property.bedrooms;
    if (property.bathrooms !== undefined) cleanUpdate.bathrooms = property.bathrooms;
    if (property.squareFeet !== undefined) cleanUpdate.squareFeet = property.squareFeet;
    if (property.lotSize !== undefined) cleanUpdate.lotSize = property.lotSize;
    if (property.propertyType !== undefined) cleanUpdate.propertyType = property.propertyType;
    if (property.listingType !== undefined) cleanUpdate.listingType = property.listingType;
    if (property.images !== undefined) cleanUpdate.images = property.images;
    if (property.features !== undefined) cleanUpdate.features = property.features;
    if (property.isPremium !== undefined) cleanUpdate.isPremium = property.isPremium;
    if (property.isVerified !== undefined) cleanUpdate.isVerified = property.isVerified;
    if (property.latitude !== undefined) cleanUpdate.latitude = property.latitude;
    if (property.longitude !== undefined) cleanUpdate.longitude = property.longitude;
    if (property.ownerId !== undefined) cleanUpdate.ownerId = property.ownerId;
    if (property.neighborhoodId !== undefined) cleanUpdate.neighborhoodId = property.neighborhoodId;
    
    // Add the updatedAt field
    cleanUpdate.updatedAt = new Date();
    
    const updatedProperty = await db
      .update(properties)
      .set(cleanUpdate)
      .where(eq(properties.id, id))
      .returning();
    return updatedProperty[0];
  }
  
  async deleteProperty(id: number): Promise<boolean> {
    await db
      .delete(properties)
      .where(eq(properties.id, id));
    return true;
  }
  
  // Neighborhoods
  async getNeighborhood(id: number): Promise<Neighborhood | undefined> {
    const [neighborhood] = await db.select().from(neighborhoods).where(eq(neighborhoods.id, id));
    return neighborhood;
  }
  
  async getNeighborhoods(): Promise<Neighborhood[]> {
    return db.select().from(neighborhoods);
  }
  
  async createNeighborhood(neighborhood: InsertNeighborhood): Promise<Neighborhood> {
    const [newNeighborhood] = await db.insert(neighborhoods).values(neighborhood).returning();
    return newNeighborhood;
  }
  
  // Favorites
  async getFavoritesByUserId(userId: number): Promise<Property[]> {
    const result = await db
      .select({ property: properties })
      .from(favorites)
      .innerJoin(properties, eq(favorites.propertyId, properties.id))
      .where(eq(favorites.userId, userId));
    
    return result.map(r => r.property);
  }
  
  async isFavorite(userId: number, propertyId: number): Promise<boolean> {
    const [favorite] = await db
      .select()
      .from(favorites)
      .where(and(
        eq(favorites.userId, userId),
        eq(favorites.propertyId, propertyId)
      ));
    
    return !!favorite;
  }
  
  async addFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const [newFavorite] = await db
      .insert(favorites)
      .values(favorite)
      .returning();
    
    return newFavorite;
  }
  
  async removeFavorite(userId: number, propertyId: number): Promise<boolean> {
    await db
      .delete(favorites)
      .where(and(
        eq(favorites.userId, userId),
        eq(favorites.propertyId, propertyId)
      ));
    
    return true;
  }
  
  // Messages
  async getMessagesByUserId(userId: number): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(or(
        eq(messages.senderId, userId),
        eq(messages.receiverId, userId)
      ))
      .orderBy(desc(messages.createdAt));
  }
  
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    
    return newMessage;
  }
  
  // Subscriptions
  async getSubscription(id: number): Promise<Subscription | undefined> {
    const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.id, id));
    return subscription;
  }
  
  async getSubscriptionByUserId(userId: number): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);
    return subscription;
  }
  
  async getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId));
    return subscription;
  }
  
  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [newSubscription] = await db
      .insert(subscriptions)
      .values(subscription)
      .returning();
    return newSubscription;
  }
  
  async updateSubscription(id: number, subscription: Partial<Subscription>): Promise<Subscription | undefined> {
    const [updatedSubscription] = await db
      .update(subscriptions)
      .set({
        ...subscription,
        updatedAt: new Date()
      })
      .where(eq(subscriptions.id, id))
      .returning();
    return updatedSubscription;
  }
  
  async updateSubscriptionStatus(stripeSubscriptionId: string, status: string): Promise<Subscription | undefined> {
    const [updatedSubscription] = await db
      .update(subscriptions)
      .set({
        status,
        updatedAt: new Date()
      })
      .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
      .returning();
    return updatedSubscription;
  }
  
  async deleteSubscription(id: number): Promise<boolean> {
    await db
      .delete(subscriptions)
      .where(eq(subscriptions.id, id));
    return true;
  }
  
  // Property Tours
  async getPropertyTour(id: number): Promise<PropertyTour | undefined> {
    const [tour] = await db.select().from(propertyTours).where(eq(propertyTours.id, id));
    return tour;
  }
  
  async getPropertyToursByUserId(userId: number): Promise<PropertyTour[]> {
    return db.select()
      .from(propertyTours)
      .where(eq(propertyTours.userId, userId))
      .orderBy(desc(propertyTours.scheduledDate));
  }
  
  async getPropertyToursByAgentId(agentId: number): Promise<PropertyTour[]> {
    return db.select()
      .from(propertyTours)
      .where(eq(propertyTours.agentId, agentId))
      .orderBy(desc(propertyTours.scheduledDate));
  }
  
  async getPropertyToursByPropertyId(propertyId: number): Promise<PropertyTour[]> {
    return db.select()
      .from(propertyTours)
      .where(eq(propertyTours.propertyId, propertyId))
      .orderBy(desc(propertyTours.scheduledDate));
  }
  
  async createPropertyTour(tour: InsertPropertyTour): Promise<PropertyTour> {
    const [newTour] = await db.insert(propertyTours).values(tour).returning();
    return newTour;
  }
  
  async updatePropertyTourStatus(id: number, status: string): Promise<PropertyTour | undefined> {
    const [updatedTour] = await db
      .update(propertyTours)
      .set({ 
        status: status as any,
        updatedAt: new Date()
      })
      .where(eq(propertyTours.id, id))
      .returning();
    return updatedTour;
  }
  
  async cancelPropertyTour(id: number): Promise<PropertyTour | undefined> {
    return this.updatePropertyTourStatus(id, 'canceled');
  }
  
  async checkPropertyTourAvailability(propertyId: number, scheduledDate: Date, endTime: Date): Promise<boolean> {
    // Format dates for SQL comparisons
    const scheduledDateSql = sql`${scheduledDate}`;
    const endTimeSql = sql`${endTime}`;
    
    // Check if there are any overlapping tours for this property
    const overlappingTours = await db.select()
      .from(propertyTours)
      .where(
        and(
          eq(propertyTours.propertyId, propertyId),
          or(
            // New tour starts during an existing tour
            and(
              gte(scheduledDateSql, propertyTours.scheduledDate),
              lte(scheduledDateSql, propertyTours.endTime)
            ),
            // New tour ends during an existing tour
            and(
              gte(endTimeSql, propertyTours.scheduledDate),
              lte(endTimeSql, propertyTours.endTime)
            ),
            // New tour completely encompasses an existing tour
            and(
              lte(scheduledDateSql, propertyTours.scheduledDate),
              gte(endTimeSql, propertyTours.endTime)
            )
          ),
          // Only consider active tours
          or(
            eq(propertyTours.status, 'pending'),
            eq(propertyTours.status, 'confirmed')
          )
        )
      );
      
    // Return true if no overlapping tours (available)
    return overlappingTours.length === 0;
  }
}

export const storage = new DatabaseStorage();
