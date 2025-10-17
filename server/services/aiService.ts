import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';

// AI Service Configuration
interface AIConfig {
  provider: 'openai' | 'google' | 'anthropic' | 'hybrid';
  openai?: {
    apiKey: string;
    model: string;
    maxTokens: number;
    temperature: number;
  };
  google?: {
    apiKey: string;
    model: string;
  };
  anthropic?: {
    apiKey: string;
    model: string;
  };
  features: {
    smartRouting: boolean;
    demandPrediction: boolean;
    customerSupport: boolean;
    dynamicPricing: boolean;
    fraudDetection: boolean;
    sentimentAnalysis: boolean;
  };
  settings: {
    cacheTtl: number;
    maxConcurrentRequests: number;
    rateLimitPerMinute: number;
  };
}

class AIService {
  private config: AIConfig;
  private openai?: OpenAI;
  private google?: GoogleGenerativeAI;
  private anthropic?: Anthropic;
  private requestQueue: Array<() => Promise<any>> = [];
  private activeRequests = 0;

  constructor() {
    this.config = this.loadConfig();
    this.initializeClients();
  }

  private loadConfig(): AIConfig {
    return {
      provider: (process.env.AI_SERVICE_PROVIDER as any) || 'openai',
      openai: {
        apiKey: process.env.OPENAI_API_KEY || '',
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '1000'),
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
      },
      google: {
        apiKey: process.env.GOOGLE_AI_API_KEY || '',
        model: process.env.GOOGLE_AI_MODEL || 'gemini-1.5-flash',
      },
      anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY || '',
        model: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
      },
      features: {
        smartRouting: process.env.ENABLE_SMART_ROUTING === 'true',
        demandPrediction: process.env.ENABLE_DEMAND_PREDICTION === 'true',
        customerSupport: process.env.ENABLE_CUSTOMER_SUPPORT_AI === 'true',
        dynamicPricing: process.env.ENABLE_DYNAMIC_PRICING === 'true',
        fraudDetection: process.env.ENABLE_FRAUD_DETECTION === 'true',
        sentimentAnalysis: process.env.ENABLE_SENTIMENT_ANALYSIS === 'true',
      },
      settings: {
        cacheTtl: parseInt(process.env.AI_RESPONSE_CACHE_TTL || '3600'),
        maxConcurrentRequests: parseInt(process.env.AI_MAX_CONCURRENT_REQUESTS || '10'),
        rateLimitPerMinute: parseInt(process.env.AI_RATE_LIMIT_PER_MINUTE || '60'),
      },
    };
  }

  private initializeClients() {
    if (this.config.openai?.apiKey) {
      this.openai = new OpenAI({
        apiKey: this.config.openai.apiKey,
      });
    }

    if (this.config.google?.apiKey) {
      this.google = new GoogleGenerativeAI(this.config.google.apiKey);
    }

    if (this.config.anthropic?.apiKey) {
      this.anthropic = new Anthropic({
        apiKey: this.config.anthropic.apiKey,
      });
    }
  }

  private async executeWithRateLimit<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.activeRequests >= this.config.settings.maxConcurrentRequests || this.requestQueue.length === 0) {
      return;
    }

    this.activeRequests++;
    const nextRequest = this.requestQueue.shift();
    if (nextRequest) {
      try {
        await nextRequest();
      } finally {
        this.activeRequests--;
        this.processQueue();
      }
    }
  }

  // Smart Routing AI
  async optimizeRoute(orders: any[], riders: any[]): Promise<any[]> {
    if (!this.config.features.smartRouting) {
      return orders; // Return original if AI routing is disabled
    }

    const prompt = `
    Optimize delivery routes for the following orders and available riders:
    
    Orders: ${JSON.stringify(orders, null, 2)}
    Riders: ${JSON.stringify(riders, null, 2)}
    
    Consider:
    - Distance optimization
    - Traffic patterns
    - Rider capacity
    - Delivery time windows
    - Customer priority
    
    Return optimized route assignments in JSON format.
    `;

    return this.executeWithRateLimit(async () => {
      const response = await this.generateResponse(prompt, 'routing');
      return JSON.parse(response);
    });
  }

  // Demand Prediction AI
  async predictDemand(location: any, timeHorizon: number = 24): Promise<any> {
    if (!this.config.features.demandPrediction) {
      return { predictedDemand: 0, confidence: 0 };
    }

    const prompt = `
    Predict delivery demand for the next ${timeHorizon} hours for location: ${JSON.stringify(location)}
    
    Consider:
    - Historical data patterns
    - Time of day/week
    - Weather conditions
    - Local events
    - Seasonal trends
    
    Return prediction with confidence score in JSON format.
    `;

    return this.executeWithRateLimit(async () => {
      const response = await this.generateResponse(prompt, 'prediction');
      return JSON.parse(response);
    });
  }

  // Customer Support AI
  async generateSupportResponse(customerMessage: string, context?: any): Promise<string> {
    if (!this.config.features.customerSupport) {
      return "Thank you for contacting us. A support agent will respond shortly.";
    }

    const prompt = `
    Respond to this customer support message professionally and helpfully:
    
    Customer Message: "${customerMessage}"
    Context: ${context ? JSON.stringify(context, null, 2) : 'No additional context'}
    
    Guidelines:
    - Be professional and empathetic
    - Provide clear, actionable solutions
    - Escalate complex issues appropriately
    - Maintain brand voice
    `;

    return this.executeWithRateLimit(async () => {
      return this.generateResponse(prompt, 'support');
    });
  }

  // Dynamic Pricing AI
  async calculateDynamicPrice(basePrice: number, demand: number, supply: number, location: any): Promise<number> {
    if (!this.config.features.dynamicPricing) {
      return basePrice;
    }

    const prompt = `
    Calculate dynamic pricing for delivery service:
    
    Base Price: ${basePrice}
    Current Demand: ${demand}
    Available Supply: ${supply}
    Location: ${JSON.stringify(location)}
    
    Consider:
    - Supply and demand balance
    - Peak hours
    - Distance factors
    - Weather conditions
    - Local competition
    
    Return the optimal price multiplier (1.0 = base price, 1.5 = 50% increase, etc.)
    `;

    return this.executeWithRateLimit(async () => {
      const response = await this.generateResponse(prompt, 'pricing');
      const multiplier = parseFloat(response);
      const maxMultiplier = parseFloat(process.env.PRICING_MAX_MULTIPLIER || '3.0');
      const minMultiplier = parseFloat(process.env.PRICING_MIN_MULTIPLIER || '1.0');
      
      return Math.min(Math.max(multiplier, minMultiplier), maxMultiplier) * basePrice;
    });
  }

  // Fraud Detection AI
  async detectFraud(order: any, user: any, payment: any): Promise<{ isFraud: boolean; confidence: number; reasons: string[] }> {
    if (!this.config.features.fraudDetection) {
      return { isFraud: false, confidence: 0, reasons: [] };
    }

    const prompt = `
    Analyze this order for potential fraud:
    
    Order: ${JSON.stringify(order, null, 2)}
    User: ${JSON.stringify(user, null, 2)}
    Payment: ${JSON.stringify(payment, null, 2)}
    
    Check for:
    - Unusual patterns
    - Suspicious payment methods
    - High-value orders from new users
    - Geographic inconsistencies
    - Rapid successive orders
    
    Return fraud analysis in JSON format with isFraud (boolean), confidence (0-1), and reasons (array of strings).
    `;

    return this.executeWithRateLimit(async () => {
      const response = await this.generateResponse(prompt, 'fraud');
      return JSON.parse(response);
    });
  }

  // Sentiment Analysis AI
  async analyzeSentiment(text: string, source: string = 'general'): Promise<{ sentiment: 'positive' | 'negative' | 'neutral'; score: number; confidence: number }> {
    if (!this.config.features.sentimentAnalysis) {
      return { sentiment: 'neutral', score: 0, confidence: 0 };
    }

    const prompt = `
    Analyze the sentiment of this text:
    
    Text: "${text}"
    Source: ${source}
    
    Determine:
    - Overall sentiment (positive, negative, neutral)
    - Sentiment score (-1 to 1)
    - Confidence level (0 to 1)
    
    Return analysis in JSON format.
    `;

    return this.executeWithRateLimit(async () => {
      const response = await this.generateResponse(prompt, 'sentiment');
      return JSON.parse(response);
    });
  }

  // Generic AI Response Generation
  private async generateResponse(prompt: string, context: string): Promise<string> {
    switch (this.config.provider) {
      case 'openai':
        return this.generateOpenAIResponse(prompt);
      case 'google':
        return this.generateGoogleResponse(prompt);
      case 'anthropic':
        return this.generateAnthropicResponse(prompt);
      case 'hybrid':
        return this.generateHybridResponse(prompt, context);
      default:
        throw new Error(`Unsupported AI provider: ${this.config.provider}`);
    }
  }

  private async generateOpenAIResponse(prompt: string): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

    const response = await this.openai.chat.completions.create({
      model: this.config.openai!.model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: this.config.openai!.maxTokens,
      temperature: this.config.openai!.temperature,
    });

    return response.choices[0]?.message?.content || '';
  }

  private async generateGoogleResponse(prompt: string): Promise<string> {
    if (!this.google) {
      throw new Error('Google AI client not initialized');
    }

    const model = this.google.getGenerativeModel({ model: this.config.google!.model });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  private async generateAnthropicResponse(prompt: string): Promise<string> {
    if (!this.anthropic) {
      throw new Error('Anthropic client not initialized');
    }

    const response = await this.anthropic.messages.create({
      model: this.config.anthropic!.model,
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    });

    return response.content[0]?.type === 'text' ? response.content[0].text : '';
  }

  private async generateHybridResponse(prompt: string, context: string): Promise<string> {
    // Use different providers based on context for optimal results
    const providers = ['openai', 'google', 'anthropic'];
    const provider = providers[Math.floor(Math.random() * providers.length)];
    
    // Temporarily switch provider for this request
    const originalProvider = this.config.provider;
    this.config.provider = provider as any;
    
    try {
      return await this.generateResponse(prompt, context);
    } finally {
      this.config.provider = originalProvider;
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; providers: any }> {
    const providers = {
      openai: !!this.openai,
      google: !!this.google,
      anthropic: !!this.anthropic,
    };

    return {
      status: 'healthy',
      providers,
    };
  }
}

export const aiService = new AIService();
export default aiService;
