import { pgTable, text, serial, integer, boolean, jsonb, doublePrecision, timestamp, foreignKey, primaryKey, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ENUMS
export const propertyTypeEnum = pgEnum('property_type', [
  'apartment', 'villa', 'penthouse', 'townhouse', 'office', 'retail', 'land'
]);

export const listingTypeEnum = pgEnum('listing_type', ['buy', 'rent', 'sell']);

export const userRoleEnum = pgEnum('user_role', ['user', 'agent', 'admin']);

export const subscriptionTierEnum = pgEnum('subscription_tier', ['free', 'premium', 'enterprise']);
export const tourStatusEnum = pgEnum('tour_status', ['pending', 'confirmed', 'completed', 'canceled']);

// USERS
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: userRoleEnum("role").default('user').notNull(),
  subscriptionTier: subscriptionTierEnum("subscription_tier").default('free').notNull(),
  preferredLanguage: text("preferred_language").default('en'),
  avatar: text("avatar"),
  phone: text("phone"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  hasUsedFreeUpload: boolean("has_used_free_upload").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// PROPERTIES
export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: doublePrecision("price").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state"),
  zipCode: text("zip_code"),
  country: text("country").notNull(),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  bedrooms: integer("bedrooms"),
  bathrooms: doublePrecision("bathrooms"),
  squareFeet: doublePrecision("square_feet"),
  lotSize: doublePrecision("lot_size"),
  propertyType: propertyTypeEnum("property_type").notNull(),
  features: jsonb("features").$type<string[]>(),
  images: jsonb("images").$type<string[]>().notNull(),
  isPremium: boolean("is_premium").default(false),
  listingType: listingTypeEnum("listing_type").notNull(),
  ownerId: integer("owner_id").references(() => users.id),
  neighborhoodId: integer("neighborhood_id").references(() => neighborhoods.id),
  isVerified: boolean("is_verified").default(false),
  installmentPlan: jsonb("installment_plan").$type<{ years: number; downPayment?: number }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  // We don't define the PostGIS geometry column here
  // It's added directly to the database with SQL ALTER TABLE
});

// NEIGHBORHOODS
export const neighborhoods = pgTable("neighborhoods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  city: text("city").notNull(),
  state: text("state"),
  zipCode: text("zip_code"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  scores: jsonb("scores").$type<{
    overall: number;
    safety: number;
    schools: number;
    transit: number;
  }>(),
  medianHomePrice: doublePrecision("median_home_price"),
});

// FAVORITES
export const favorites = pgTable("favorites", {
  userId: integer("user_id").notNull().references(() => users.id),
  propertyId: integer("property_id").notNull().references(() => properties.id),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId, table.propertyId] }),
  };
});

// MESSAGES
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  propertyId: integer("property_id").references(() => properties.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// SUBSCRIPTIONS
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  tier: subscriptionTierEnum("tier").default('free').notNull(),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripeCustomerId: text("stripe_customer_id"),
  status: text("status").notNull().default('inactive'),
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// PROPERTY TOURS
export const propertyTours = pgTable("property_tours", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull().references(() => properties.id),
  userId: integer("user_id").notNull().references(() => users.id),
  agentId: integer("agent_id").notNull().references(() => users.id),
  scheduledDate: timestamp("scheduled_date").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: tourStatusEnum("status").default('pending').notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// SCHEMAS
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNeighborhoodSchema = createInsertSchema(neighborhoods).omit({
  id: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites);

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPropertyTourSchema = createInsertSchema(propertyTours).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// TYPES
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;

export type Neighborhood = typeof neighborhoods.$inferSelect;
export type InsertNeighborhood = z.infer<typeof insertNeighborhoodSchema>;

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

export type PropertyTour = typeof propertyTours.$inferSelect;
export type InsertPropertyTour = z.infer<typeof insertPropertyTourSchema>;

// SEARCH SCHEMA
export const searchPropertySchema = z.object({
  query: z.string().optional(),
  city: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  propertyType: z.enum(propertyTypeEnum.enumValues).optional(),
  listingType: z.enum(listingTypeEnum.enumValues).optional(),
  minSquareFeet: z.number().optional(),
  maxSquareFeet: z.number().optional(),
  features: z.array(z.string()).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  radius: z.number().optional(), // in km
  limit: z.number().default(9),
  offset: z.number().default(0),
});

export type PropertySearchParams = z.infer<typeof searchPropertySchema>;
