import { db } from './db';
import { 
  users, properties, neighborhoods, favorites, messages,
  insertUserSchema, insertPropertySchema, insertNeighborhoodSchema, insertFavoriteSchema, insertMessageSchema
} from '../shared/schema';
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

// Hash password with salt - same function as in auth.ts
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Delete all existing data to reset the database
    await db.delete(messages);
    await db.delete(favorites);
    await db.delete(properties);
    await db.delete(neighborhoods);
    await db.delete(users);
    console.log('Existing data deleted, seeding fresh data');
    
    // Create users with hashed passwords
    console.log('Creating users...');
    
    // Create simple test users for easy login (all with password 'test123')
    
    // Test regular user
    const [testUser] = await db.insert(users).values({
      username: 'user',
      password: await hashPassword('test123'),
      email: 'testuser@example.com',
      fullName: 'Test Regular User',
      role: 'user',
      subscriptionTier: 'free',
      preferredLanguage: 'en',
      avatar: null,
      phone: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null
    }).returning();
    
    // Test agent user
    const [testAgent] = await db.insert(users).values({
      username: 'agent',
      password: await hashPassword('test123'),
      email: 'testagent@example.com',
      fullName: 'Test Agent User',
      role: 'agent',
      subscriptionTier: 'premium',
      preferredLanguage: 'en',
      avatar: null,
      phone: null,
      stripeCustomerId: 'cus_test12345',
      stripeSubscriptionId: 'sub_test12345'
    }).returning();
    
    // Test admin user
    const [admin] = await db.insert(users).values({
      username: 'admin',
      password: await hashPassword('test123'),
      email: 'admin@inmobi.com',
      fullName: 'Admin User',
      role: 'admin',
      subscriptionTier: 'enterprise',
      preferredLanguage: 'en',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      phone: '+1234567890',
      stripeCustomerId: 'cus_admin123',
      stripeSubscriptionId: 'sub_admin123'
    }).returning();
    
    const [agent1] = await db.insert(users).values({
      username: 'agent1',
      password: await hashPassword('agent123'),
      email: 'agent1@inmobi.com',
      fullName: 'Sophia Rodriguez',
      role: 'agent',
      subscriptionTier: 'premium',
      preferredLanguage: 'en',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      phone: '+1987654321',
      stripeCustomerId: 'cus_agent1',
      stripeSubscriptionId: 'sub_agent1'
    }).returning();
    
    const [agent2] = await db.insert(users).values({
      username: 'agent2',
      password: await hashPassword('agent456'),
      email: 'agent2@inmobi.com',
      fullName: 'James Wilson',
      role: 'agent',
      subscriptionTier: 'premium',
      preferredLanguage: 'en',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      phone: '+1122334455',
      stripeCustomerId: 'cus_agent2',
      stripeSubscriptionId: 'sub_agent2'
    }).returning();
    
    const [user1] = await db.insert(users).values({
      username: 'user1',
      password: await hashPassword('user123'),
      email: 'user1@example.com',
      fullName: 'Emily Johnson',
      role: 'user',
      subscriptionTier: 'free',
      preferredLanguage: 'en',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      phone: '+1555666777',
      stripeCustomerId: null,
      stripeSubscriptionId: null
    }).returning();
    
    // Create neighborhoods
    console.log('Creating neighborhoods...');
    const [downtown] = await db.insert(neighborhoods).values({
      name: 'Downtown',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      latitude: 40.7128,
      longitude: -74.0060,
      scores: {
        overall: 4.5,
        safety: 4.0,
        schools: 4.2,
        transit: 5.0
      },
      medianHomePrice: 1200000
    }).returning();
    
    const [brooklyn] = await db.insert(neighborhoods).values({
      name: 'Brooklyn Heights',
      city: 'New York',
      state: 'NY',
      zipCode: '11201',
      latitude: 40.6958,
      longitude: -73.9936,
      scores: {
        overall: 4.7,
        safety: 4.3,
        schools: 4.5,
        transit: 4.8
      },
      medianHomePrice: 1500000
    }).returning();
    
    const [beachside] = await db.insert(neighborhoods).values({
      name: 'Beachside',
      city: 'Miami',
      state: 'FL',
      zipCode: '33139',
      latitude: 25.7907,
      longitude: -80.1300,
      scores: {
        overall: 4.8,
        safety: 4.2,
        schools: 4.0,
        transit: 3.8
      },
      medianHomePrice: 950000
    }).returning();
    
    const [westwood] = await db.insert(neighborhoods).values({
      name: 'Westwood',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90024',
      latitude: 34.0636,
      longitude: -118.4468,
      scores: {
        overall: 4.6,
        safety: 4.3,
        schools: 4.7,
        transit: 3.5
      },
      medianHomePrice: 1800000
    }).returning();
    
    // Create properties
    console.log('Creating properties...');
    
    // Property 1
    await db.insert(properties).values({
      title: 'Luxury Penthouse with City Views',
      description: `This stunning penthouse offers breathtaking views of the city skyline. The spacious open-concept living area features floor-to-ceiling windows, allowing abundant natural light. The gourmet kitchen includes top-of-the-line appliances and custom cabinetry. The primary suite boasts a spa-like bathroom and a large walk-in closet. Additional features include a private terrace, smart home technology, and two dedicated parking spots.`,
      price: 2500000,
      address: '123 Skyline Ave',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
      latitude: 40.7505,
      longitude: -73.9934,
      bedrooms: 3,
      bathrooms: 3.5,
      squareFeet: 2800,
      lotSize: 0,
      propertyType: 'penthouse',
      features: ['Swimming Pool', 'Gym', 'Elevator', 'Concierge', 'Smart Home', 'Balcony', 'Central AC', 'Hardwood Floors'],
      images: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      ],
      isPremium: true,
      listingType: 'buy',
      ownerId: agent1.id,
      neighborhoodId: downtown.id,
      isVerified: true,
      installmentPlan: { years: 15, downPayment: 500000 }
    });
    
    // Property 2
    await db.insert(properties).values({
      title: 'Charming Townhouse in Brooklyn',
      description: `A beautifully renovated townhouse in Brooklyn's most desirable neighborhood. This home features an elegant blend of historic character and modern amenities. The main floor has a spacious living room with a fireplace, a chef's kitchen with marble countertops, and a dining area that opens to a landscaped garden. Three bedrooms upstairs including a primary suite with a luxurious bathroom. Finished basement provides additional living space.`,
      price: 1850000,
      address: '456 Brownstone St',
      city: 'New York',
      state: 'NY',
      zipCode: '11201',
      country: 'USA',
      latitude: 40.6984,
      longitude: -73.9900,
      bedrooms: 3,
      bathrooms: 2.5,
      squareFeet: 2200,
      lotSize: 0.05,
      propertyType: 'townhouse',
      features: ['Garden', 'Fireplace', 'Basement', 'Renovated', 'High Ceilings', 'Original Woodwork', 'Dishwasher', 'Washer/Dryer'],
      images: [
        'https://images.unsplash.com/photo-1571055107559-3e67626fa8be?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      ],
      isPremium: true,
      listingType: 'buy',
      ownerId: agent2.id,
      neighborhoodId: brooklyn.id,
      isVerified: true
    });
    
    // Property 3
    await db.insert(properties).values({
      title: 'Beach View Apartment',
      description: `Wake up to stunning ocean views in this beachfront apartment. Recently renovated with modern fixtures and finishes. The open floor plan features a stylish kitchen with stainless steel appliances, a comfortable living room that opens to a private balcony overlooking the beach, and a spacious bedroom with ample closet space. Building amenities include a pool, fitness center, and 24-hour security.`,
      price: 4500,
      address: '789 Ocean Dr',
      city: 'Miami',
      state: 'FL',
      zipCode: '33139',
      country: 'USA',
      latitude: 25.7796,
      longitude: -80.1312,
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: 850,
      lotSize: 0,
      propertyType: 'apartment',
      features: ['Ocean View', 'Swimming Pool', 'Gym', 'Security', 'Air Conditioning', 'Furnished', 'Balcony', 'Elevator'],
      images: [
        'https://images.unsplash.com/photo-1560185008-a33f5c7b1844?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1484101403633-562f891dc89a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1556912173-3bb406ef7e97?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      ],
      isPremium: false,
      listingType: 'rent',
      ownerId: agent1.id,
      neighborhoodId: beachside.id,
      isVerified: true
    });
    
    // Property 4
    await db.insert(properties).values({
      title: 'Modern Villa with Pool',
      description: `Experience luxury living in this modern villa featuring an infinity pool and panoramic city views. This stunning property includes a spacious living room with double-height ceilings, a gourmet kitchen with custom cabinetry and high-end appliances, and four generously sized bedrooms, each with an en-suite bathroom. The outdoor space includes a landscaped garden, an infinity pool, and a covered patio perfect for entertaining.`,
      price: 3200000,
      address: '101 Hillside Rd',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'USA',
      latitude: 34.0901,
      longitude: -118.4065,
      bedrooms: 4,
      bathrooms: 4.5,
      squareFeet: 3800,
      lotSize: 0.25,
      propertyType: 'villa',
      features: ['Infinity Pool', 'Smart Home', 'Home Theater', 'Wine Cellar', 'Garden', 'Mountain View', '3-Car Garage', 'Chef\'s Kitchen'],
      images: [
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      ],
      isPremium: true,
      listingType: 'buy',
      ownerId: agent2.id,
      neighborhoodId: westwood.id,
      isVerified: true,
      installmentPlan: { years: 30, downPayment: 640000 }
    });
    
    // Property 5
    await db.insert(properties).values({
      title: 'Spacious Office in Business District',
      description: `Prime office space in the heart of downtown. This spacious office features an open layout with large windows providing abundant natural light and stunning city views. Amenities include a modern reception area, multiple conference rooms, a break room, and dedicated parking spaces. The building offers 24/7 security, a fitness center, and is conveniently located near public transportation, restaurants, and shops.`,
      price: 1200000,
      address: '555 Business Ave',
      city: 'New York',
      state: 'NY',
      zipCode: '10007',
      country: 'USA',
      latitude: 40.7127,
      longitude: -74.0059,
      squareFeet: 2500,
      propertyType: 'office',
      features: ['Reception Area', 'Conference Rooms', 'Break Room', 'Security', 'High-Speed Internet', 'Parking', 'ADA Accessible', 'Central Location'],
      images: [
        'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1524758631624-e2822e304c36?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      ],
      isPremium: false,
      listingType: 'buy',
      ownerId: agent1.id,
      neighborhoodId: downtown.id,
      isVerified: true
    });
    
    // Property 6
    await db.insert(properties).values({
      title: 'Downtown Apartment with City Views',
      description: `Stylish apartment in the heart of downtown with breathtaking city views. This modern unit features an open floor plan with a gourmet kitchen, stainless steel appliances, and a breakfast bar. The spacious living room opens to a private balcony offering panoramic views. Building amenities include a rooftop pool, fitness center, and 24-hour concierge service.`,
      price: 3200,
      address: '789 Urban St',
      city: 'New York',
      state: 'NY',
      zipCode: '10016',
      country: 'USA',
      latitude: 40.7484,
      longitude: -73.9857,
      bedrooms: 2,
      bathrooms: 2,
      squareFeet: 1200,
      propertyType: 'apartment',
      features: ['City View', 'Balcony', 'Doorman', 'Gym', 'Rooftop Pool', 'Elevator', 'Dishwasher', 'Central AC'],
      images: [
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1533779283484-8ad4940aa3a8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      ],
      isPremium: true,
      listingType: 'rent',
      ownerId: agent2.id,
      neighborhoodId: downtown.id,
      isVerified: true
    });
    
    // Property 7
    await db.insert(properties).values({
      title: 'Retail Space in Prime Location',
      description: `Exceptional retail opportunity in a high-traffic area. This well-maintained space features large display windows, ample storage, and an open floor plan that can be customized to suit various business needs. The property benefits from excellent visibility, substantial foot traffic, and easy access to public transportation. Perfect for boutiques, cafes, or service businesses.`,
      price: 850000,
      address: '222 Shop St',
      city: 'Miami',
      state: 'FL',
      zipCode: '33130',
      country: 'USA',
      latitude: 25.7617,
      longitude: -80.1918,
      squareFeet: 1500,
      propertyType: 'retail',
      features: ['High Foot Traffic', 'Display Windows', 'Storage Space', 'HVAC System', 'Security System', 'Restroom', 'Loading Area', 'Signage Opportunity'],
      images: [
        'https://images.unsplash.com/photo-1472851294608-062f824d29cc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1464890100898-a385f744067f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1604014237800-1c9102c219da?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      ],
      isPremium: false,
      listingType: 'buy',
      ownerId: agent1.id,
      neighborhoodId: beachside.id,
      isVerified: true
    });
    
    // Property 8
    await db.insert(properties).values({
      title: 'Investment Opportunity: Development Land',
      description: `Prime development land in rapidly growing area. This valuable parcel offers excellent opportunity for residential or commercial development. The property is located in a zone with favorable building regulations and has all utilities available at the street. Surrounded by successful developments and with strong demographic trends, this land represents an exceptional investment opportunity.`,
      price: 1500000,
      address: '333 Future Blvd',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90035',
      country: 'USA',
      latitude: 34.0522,
      longitude: -118.2437,
      lotSize: 1.2,
      propertyType: 'land',
      features: ['Utilities Available', 'Road Access', 'Flat Terrain', 'Zoned Mixed-Use', 'Corner Lot', 'Survey Available', 'Environmental Study Completed', 'No Restrictions'],
      images: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1510279770292-4b34de9f5c23?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      ],
      isPremium: true,
      listingType: 'buy',
      ownerId: agent2.id,
      neighborhoodId: westwood.id,
      isVerified: true
    });
    
    // Create the first property before creating favorites
    const luxuryPenthouse = await db.insert(properties).values({
      title: 'Luxury Penthouse with City Views',
      description: `This stunning penthouse offers panoramic views of the city skyline from its wraparound terrace. Features include floor-to-ceiling windows, gourmet kitchen with top-of-the-line appliances, marble bathrooms, and a private elevator entrance. Building amenities include a 24-hour doorman, fitness center, and rooftop pool.`,
      price: 2500000,
      address: '123 Luxury Ave',
      city: 'New York',
      country: 'United States',
      zipCode: '10001',
      bedrooms: 3,
      bathrooms: 3.5,
      squareFeet: 2800,
      yearBuilt: 2018,
      status: 'active',
      latitude: 40.7128,
      longitude: -74.0060,
      lotSize: 0,
      propertyType: 'apartment',
      features: ['Doorman', 'Elevator', 'Fitness Center', 'Rooftop Deck', 'Balcony', 'Central Air', 'Hardwood Floors', 'Pet Friendly', 'Washer/Dryer', 'Garage Parking'],
      images: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1502005097973-6a7082348e28?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      ],
      isPremium: true,
      listingType: 'buy',
      ownerId: agent1.id,
      neighborhoodId: downtown.id,
      isVerified: true
    }).returning();

    // We'll create favorites after all properties are created
    // Moving the code below to the end of the function

    // Property 9
    await db.insert(properties).values({
      title: 'Luxury Waterfront Condo',
      description: `Experience the ultimate in waterfront living with this exquisite condominium. Floor-to-ceiling windows showcase breathtaking ocean views from every room. The open-concept design features premium finishes, including marble countertops, custom cabinetry, and hardwood flooring. The master suite includes a spa-like bathroom and a private balcony. Building amenities include an infinity pool, fitness center, and 24-hour concierge.`,
      price: 1750000,
      address: '777 Ocean Front Dr',
      city: 'Miami',
      state: 'FL',
      zipCode: '33139',
      country: 'USA',
      latitude: 25.7747,
      longitude: -80.1300,
      bedrooms: 3,
      bathrooms: 3,
      squareFeet: 2100,
      lotSize: 0,
      propertyType: 'apartment',
      features: ['Ocean View', 'Balcony', 'Concierge', 'Swimming Pool', 'Gym', 'Smart Home', 'Wine Cellar', 'Floor-to-ceiling Windows'],
      images: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      ],
      isPremium: true,
      listingType: 'buy',
      ownerId: agent1.id,
      neighborhoodId: beachside.id,
      isVerified: true,
      installmentPlan: { years: 20, downPayment: 350000 }
    });

    // Property 10
    await db.insert(properties).values({
      title: 'Rustic Mountain Cabin',
      description: `Escape to the serenity of the mountains in this charming log cabin. This cozy retreat features an open living area with a stone fireplace, vaulted ceilings with exposed beams, and panoramic mountain views. The chef's kitchen includes custom cabinetry and high-end appliances. Enjoy the outdoors on the wraparound deck or relax in the hot tub while taking in the breathtaking scenery.`,
      price: 875000,
      address: '555 Pine Ridge Rd',
      city: 'Aspen',
      state: 'CO',
      zipCode: '81611',
      country: 'USA',
      latitude: 39.1911,
      longitude: -106.8175,
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1800,
      lotSize: 0.75,
      propertyType: 'villa',
      features: ['Mountain View', 'Fireplace', 'Hot Tub', 'Deck', 'Wood Floors', 'Vaulted Ceilings', 'Hiking Trails', 'Privacy'],
      images: [
        'https://images.unsplash.com/photo-1542718610-a1d656d1884c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1510798831971-661eb04b3739?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1520608760-eff2c38b06e0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      ],
      isPremium: false,
      listingType: 'buy',
      ownerId: agent2.id,
      neighborhoodId: westwood.id,
      isVerified: true
    });

    // Property 11
    await db.insert(properties).values({
      title: 'Modern Loft in Arts District',
      description: `Stylish urban loft in the vibrant Arts District. This modern space features soaring ceilings, exposed brick walls, and industrial-style windows that flood the space with natural light. The open floor plan includes a chef's kitchen with concrete countertops, a spacious living area, and a home office nook. Building amenities include a rooftop terrace, fitness center, and secure parking.`,
      price: 3800,
      address: '123 Artist Way',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90013',
      country: 'USA',
      latitude: 34.0403,
      longitude: -118.2353,
      bedrooms: 1,
      bathrooms: 1.5,
      squareFeet: 1100,
      lotSize: 0,
      propertyType: 'apartment',
      features: ['High Ceilings', 'Exposed Brick', 'Rooftop Terrace', 'Pet Friendly', 'Secured Parking', 'Fitness Center', 'Stainless Appliances', 'City Views'],
      images: [
        'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1604014237800-1c9102c219da?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      ],
      isPremium: true,
      listingType: 'rent',
      ownerId: agent1.id,
      neighborhoodId: westwood.id,
      isVerified: true
    });

    // Property 12
    await db.insert(properties).values({
      title: 'Family-Friendly Suburban Home',
      description: `Spacious family home in a sought-after suburban neighborhood. This well-maintained property features an open-concept main level with a gourmet kitchen, formal dining room, and a comfortable family room with a fireplace. Upstairs you'll find a primary suite with a walk-in closet and a spa-like bathroom, plus three additional bedrooms. The backyard includes a covered patio, in-ground pool, and a fenced play area.`,
      price: 750000,
      address: '456 Family Lane',
      city: 'Austin',
      state: 'TX',
      zipCode: '78703',
      country: 'USA',
      latitude: 30.2962,
      longitude: -97.7662,
      bedrooms: 4,
      bathrooms: 3.5,
      squareFeet: 2900,
      lotSize: 0.3,
      propertyType: 'villa',
      features: ['Swimming Pool', 'Fenced Yard', 'Fireplace', 'Covered Patio', '2-Car Garage', 'Walk-in Closet', 'Great Schools', 'Family Room'],
      images: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1576941089067-2de3c901e126?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1584723854181-9e91968836e5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      ],
      isPremium: false,
      listingType: 'buy',
      ownerId: agent2.id,
      neighborhoodId: downtown.id,
      isVerified: true
    });

    // Property 13
    await db.insert(properties).values({
      title: 'Historic Brownstone with Garden',
      description: `Beautifully renovated brownstone in a historic district. This elegant home maintains its classic character with restored original details, including hardwood floors, crown molding, and marble fireplaces. Modern updates include a chef's kitchen, updated bathrooms, and energy-efficient systems. The private garden offers a tranquil outdoor retreat in the heart of the city.`,
      price: 2950000,
      address: '789 Historic St',
      city: 'Boston',
      state: 'MA',
      zipCode: '02116',
      country: 'USA',
      latitude: 42.3505,
      longitude: -71.0754,
      bedrooms: 4,
      bathrooms: 3.5,
      squareFeet: 3200,
      lotSize: 0.1,
      propertyType: 'townhouse',
      features: ['Historic Details', 'Garden', 'Fireplaces', 'Updated Kitchen', 'Period Moldings', 'Hardwood Floors', 'High Ceilings', 'Central Location'],
      images: [
        'https://images.unsplash.com/photo-1571055107559-3e67626fa8be?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1509660933844-6910e12765a0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1600585154526-990dced4db0d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      ],
      isPremium: true,
      listingType: 'buy',
      ownerId: agent1.id,
      neighborhoodId: brooklyn.id,
      isVerified: true,
      installmentPlan: { years: 30, downPayment: 590000 }
    });

    // Property 14
    await db.insert(properties).values({
      title: 'Trendy Studio in Fashion District',
      description: `Chic studio apartment in the vibrant Fashion District. This efficiently designed space features an updated kitchen with stainless steel appliances, a comfortable living area, and a wall of windows offering city views. The building provides a range of amenities, including a rooftop lounge, fitness center, and co-working space. Located within walking distance of trendy boutiques, restaurants, and nightlife.`,
      price: 1950,
      address: '101 Fashion Ave',
      city: 'New York',
      state: 'NY',
      zipCode: '10018',
      country: 'USA',
      latitude: 40.7536,
      longitude: -73.9932,
      bedrooms: 0,
      bathrooms: 1,
      squareFeet: 550,
      lotSize: 0,
      propertyType: 'apartment',
      features: ['City Views', 'Stainless Appliances', 'Rooftop Lounge', 'Fitness Center', 'Co-Working Space', 'Pet Friendly', 'Elevator', 'Central AC'],
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      ],
      isPremium: false,
      listingType: 'rent',
      ownerId: agent2.id,
      neighborhoodId: downtown.id,
      isVerified: true
    });

    // Property 15
    await db.insert(properties).values({
      title: 'Eco-Friendly Modern Home',
      description: `Sustainable living in this award-winning eco-friendly home. This architectural masterpiece features passive solar design, energy-efficient systems, and sustainable materials throughout. The open floor plan includes a chef's kitchen with energy-efficient appliances, spacious living areas with bamboo flooring, and a primary suite with a green roof terrace. Solar panels, rainwater harvesting, and native landscaping complete this environmentally conscious property.`,
      price: 1200000,
      address: '222 Green Way',
      city: 'Portland',
      state: 'OR',
      zipCode: '97209',
      country: 'USA',
      latitude: 45.5231,
      longitude: -122.6765,
      bedrooms: 3,
      bathrooms: 2.5,
      squareFeet: 2400,
      lotSize: 0.15,
      propertyType: 'villa',
      features: ['Solar Panels', 'Energy Efficient', 'Green Roof', 'Bamboo Flooring', 'Rainwater Harvesting', 'Triple-Pane Windows', 'Electric Car Charger', 'Native Landscaping'],
      images: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      ],
      isPremium: true,
      listingType: 'buy',
      ownerId: agent1.id,
      neighborhoodId: westwood.id,
      isVerified: true
    });

    // Property 16
    await db.insert(properties).values({
      title: 'Converted Warehouse Loft',
      description: `Stunning converted warehouse loft in a trendy neighborhood. This unique space features 18-foot ceilings, original brick walls, and massive industrial windows. The open concept design includes a gourmet kitchen with a center island, a spacious living area, and a separate sleeping area. Building amenities include a shared rooftop deck, bike storage, and secure entry. Walking distance to galleries, cafes, and nightlife.`,
      price: 4200,
      address: '333 Industrial St',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60607',
      country: 'USA',
      latitude: 41.8758,
      longitude: -87.6560,
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: 1400,
      lotSize: 0,
      propertyType: 'apartment',
      features: ['High Ceilings', 'Exposed Brick', 'Industrial Windows', 'Rooftop Deck', 'Open Floor Plan', 'Original Details', 'Bike Storage', 'Walk to Restaurants'],
      images: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1556912173-3bb406ef7e97?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1592247350590-4d47129e111c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      ],
      isPremium: true,
      listingType: 'rent',
      ownerId: agent2.id,
      neighborhoodId: downtown.id,
      isVerified: true
    });

    // Property 17
    await db.insert(properties).values({
      title: 'Upscale Restaurant Space',
      description: `Prime opportunity to lease a fully-equipped restaurant space in a high-traffic location. This ready-to-use establishment features a professionally designed interior with seating for 80, a fully equipped commercial kitchen, bar area, and outdoor patio. The space has been recently renovated with new HVAC, electrical, and plumbing systems. Excellent visibility and parking make this an ideal location for your culinary venture.`,
      price: 7500,
      address: '444 Culinary Ave',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94110',
      country: 'USA',
      latitude: 37.7614,
      longitude: -122.4308,
      squareFeet: 2800,
      lotSize: 0,
      propertyType: 'retail',
      features: ['Commercial Kitchen', 'Bar Area', 'Outdoor Patio', 'High Traffic', 'Recently Renovated', 'Ample Parking', 'Hood System', 'ADA Compliant'],
      images: [
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1579027989536-b7b1f875659b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      ],
      isPremium: false,
      listingType: 'rent',
      ownerId: agent1.id,
      neighborhoodId: downtown.id,
      isVerified: true
    });

    // Property 18
    await db.insert(properties).values({
      title: 'Luxury Penthouse with Private Rooftop',
      description: `Exclusive penthouse offering the ultimate in luxury living. This magnificent residence features over 4,000 square feet of interior space plus a private 1,500 square foot rooftop terrace with panoramic city views. The home boasts soaring ceilings, floor-to-ceiling windows, and premium finishes throughout. Amenities include a chef's kitchen with top-of-the-line appliances, a primary suite with dual bathrooms, a home theater, and a wine cellar. Building services include 24-hour concierge, valet parking, and a wellness center.`,
      price: 7500000,
      address: '999 Luxury Blvd',
      city: 'New York',
      state: 'NY',
      zipCode: '10022',
      country: 'USA',
      latitude: 40.7583,
      longitude: -73.9690,
      bedrooms: 4,
      bathrooms: 5.5,
      squareFeet: 4200,
      lotSize: 0,
      propertyType: 'penthouse',
      features: ['Private Rooftop', 'Panoramic Views', 'Wine Cellar', 'Home Theater', '24-Hour Concierge', 'Valet Parking', 'Wellness Center', 'Smart Home System'],
      images: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1517098135735-0c1777e4e404?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1551215748-cb6e6a252a3c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1600566753051-f0b89df2dd90?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      ],
      isPremium: true,
      listingType: 'buy',
      ownerId: agent2.id,
      neighborhoodId: downtown.id,
      isVerified: true,
      installmentPlan: { years: 25, downPayment: 1500000 }
    });
    
    // Get first property ID for favorite
    const [firstProperty] = await db
      .select()
      .from(properties)
      .limit(1);
      
    if (firstProperty) {
      await db.insert(favorites).values({
        userId: user1.id,
        propertyId: firstProperty.id
      });
    }
    
    // Create messages
    console.log('Creating messages...');
    if (firstProperty) {
      await db.insert(messages).values({
        senderId: user1.id,
        receiverId: agent1.id,
        propertyId: firstProperty.id,
        content: "Hi, I'm interested in this property. Is it still available for viewing this weekend?"
      });
      
      await db.insert(messages).values({
        senderId: agent1.id,
        receiverId: user1.id,
        propertyId: firstProperty.id,
        content: "Hello! Yes, it's available. I can schedule a viewing for Saturday at 2pm if that works for you?"
      });
    }
    
    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

export { seed };