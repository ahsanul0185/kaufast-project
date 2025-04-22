import Anthropic from '@anthropic-ai/sdk';
import { PropertySearchParams } from '@shared/schema';

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const MODEL = 'claude-3-7-sonnet-20250219';

// Initialize Anthropic client with API key from environment variables
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Define the system prompt for property search
const SYSTEM_PROMPT = `You are an AI assistant for a real estate website called Inmobi. 
Users will give you voice commands to search for properties, and your job is to extract search parameters.

You should extract the following parameters (when mentioned):
- listingType: "buy", "rent", or "sell"
- propertyType: "apartment", "house", "condo", "villa", "land"
- minPrice: number
- maxPrice: number
- minBedrooms: number
- minBathrooms: number
- city: string
- sortBy: "price", "date", "bedrooms", "bathrooms"
- sortOrder: "asc" or "desc"

Respond ONLY with a JSON object containing the extracted parameters. Do not include any other text.
Example:
{
  "listingType": "buy",
  "propertyType": "apartment",
  "minPrice": 200000,
  "maxPrice": 500000,
  "minBedrooms": 2,
  "city": "Miami"
}`;

// Function to process voice command and extract search parameters
export async function processVoiceCommand(voiceCommand: string): Promise<PropertySearchParams> {
  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: voiceCommand }
      ],
    });

    // Extract and parse the JSON from the response
    const contentBlock = response.content[0];
    
    if (contentBlock.type !== 'text') {
      throw new Error('Expected text response from Claude');
    }
    
    // Use any type assertion here to access text
    let jsonString = (contentBlock as any).text;
    
    // Handle any response formatting issues
    if (jsonString.includes('```json')) {
      jsonString = jsonString.split('```json')[1].split('```')[0].trim();
    } else if (jsonString.includes('```')) {
      jsonString = jsonString.split('```')[1].split('```')[0].trim();
    }
    
    const searchParams: PropertySearchParams = JSON.parse(jsonString);
    return searchParams;
  } catch (error) {
    console.error('Error processing voice command:', error);
    throw error;
  }
}

// Function to analyze text with Claude
export async function analyzeText(text: string): Promise<any> {
  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      messages: [
        { role: 'user', content: text }
      ],
    });

    const contentBlock = response.content[0];
    
    // Make sure we're getting a text block
    if (contentBlock.type !== 'text') {
      throw new Error('Expected text response from Claude');
    }
    
    // Use any type assertion to access text property
    return {
      analysis: (contentBlock as any).text
    };
  } catch (error) {
    console.error('Error analyzing text:', error);
    throw error;
  }
}