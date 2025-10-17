# AI Features Integration Guide

This document outlines the AI features integrated into your delivery system and how to configure and use them.

## 🚀 Available AI Features

### 1. **Smart Route Optimization**
- **Purpose**: Optimize delivery routes for maximum efficiency
- **AI Provider**: Configurable (OpenAI, Google AI, Anthropic)
- **Endpoint**: `POST /api/ai/optimize-routes`
- **Input**: Orders array, Riders array
- **Output**: Optimized route assignments

### 2. **Demand Prediction**
- **Purpose**: Predict delivery demand for better resource allocation
- **AI Provider**: Configurable
- **Endpoint**: `POST /api/ai/predict-demand`
- **Input**: Location data, time horizon
- **Output**: Predicted demand with confidence score

### 3. **AI Customer Support**
- **Purpose**: Generate intelligent responses to customer inquiries
- **AI Provider**: Configurable
- **Endpoint**: `POST /api/ai/customer-support`
- **Input**: Customer message, context (optional)
- **Output**: AI-generated support response

### 4. **Dynamic Pricing**
- **Purpose**: Adjust pricing based on demand, supply, and conditions
- **AI Provider**: Configurable
- **Endpoint**: `POST /api/ai/dynamic-pricing`
- **Input**: Base price, location, demand/supply data
- **Output**: Optimized price with multiplier

### 5. **Fraud Detection**
- **Purpose**: Identify potentially fraudulent orders
- **AI Provider**: Configurable
- **Endpoint**: `POST /api/ai/detect-fraud`
- **Input**: Order, user, and payment data
- **Output**: Fraud analysis with confidence score

### 6. **Sentiment Analysis**
- **Purpose**: Analyze customer sentiment from messages and feedback
- **AI Provider**: Configurable
- **Endpoint**: `POST /api/ai/analyze-sentiment`
- **Input**: Text content, source type
- **Output**: Sentiment analysis (positive/negative/neutral)

### 7. **AI Insights Dashboard**
- **Purpose**: Generate comprehensive business insights
- **AI Provider**: Configurable
- **Endpoint**: `GET /api/ai/insights`
- **Input**: Time range (optional)
- **Output**: Business metrics and AI-powered insights

## 🔧 Configuration

### Environment Variables

Copy the AI configuration from `env.example` to your `.env` file:

```env
# AI Features Toggle
ENABLE_AI_FEATURES=true
ENABLE_SMART_ROUTING=true
ENABLE_DEMAND_PREDICTION=true
ENABLE_CUSTOMER_SUPPORT_AI=true
ENABLE_DYNAMIC_PRICING=true
ENABLE_FRAUD_DETECTION=true
ENABLE_SENTIMENT_ANALYSIS=true

# AI Service Selection
AI_SERVICE_PROVIDER=openai  # Options: openai, google, anthropic, hybrid

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.7

# Google AI Configuration
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
GOOGLE_AI_MODEL=gemini-1.5-flash

# Anthropic Configuration
ANTHROPIC_API_KEY=your_anthropic_api_key_here
ANTHROPIC_MODEL=claude-3-haiku-20240307
```

### AI Provider Setup

#### OpenAI Setup
1. Get API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Set `OPENAI_API_KEY` in your `.env` file
3. Choose model: `gpt-4o-mini` (recommended for cost-effectiveness)

#### Google AI Setup
1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Set `GOOGLE_AI_API_KEY` in your `.env` file
3. Model: `gemini-1.5-flash` (fast and efficient)

#### Anthropic Setup
1. Get API key from [Anthropic Console](https://console.anthropic.com/)
2. Set `ANTHROPIC_API_KEY` in your `.env` file
3. Model: `claude-3-haiku-20240307` (cost-effective)

## 📊 API Usage Examples

### 1. Smart Route Optimization

```javascript
// POST /api/ai/optimize-routes
{
  "orders": [
    {
      "id": "ORD-001",
      "pickup_location": { "coordinates": [36.8219, -1.2921] },
      "delivery_location": { "coordinates": [36.8172, -1.2862] },
      "priority": "high"
    }
  ],
  "riders": [
    {
      "id": "RD-001",
      "current_location": { "coordinates": [36.8200, -1.2900] },
      "capacity": 5
    }
  ]
}
```

### 2. Demand Prediction

```javascript
// POST /api/ai/predict-demand
{
  "location": {
    "name": "Nairobi CBD",
    "coordinates": [36.8219, -1.2921],
    "type": "commercial"
  },
  "timeHorizon": 24
}
```

### 3. AI Customer Support

```javascript
// POST /api/ai/customer-support
{
  "message": "My order is delayed, when will it arrive?",
  "customerId": "USR-001",
  "orderId": "ORD-001"
}
```

### 4. Dynamic Pricing

```javascript
// POST /api/ai/dynamic-pricing
{
  "basePrice": 500,
  "location": {
    "name": "Nairobi CBD",
    "coordinates": [36.8219, -1.2921]
  },
  "timeOfDay": "evening"
}
```

### 5. Fraud Detection

```javascript
// POST /api/ai/detect-fraud
{
  "orderId": "ORD-001",
  "userId": "USR-001",
  "paymentId": "PAY-001"
}
```

### 6. Sentiment Analysis

```javascript
// POST /api/ai/analyze-sentiment
{
  "text": "Great service! Fast delivery and friendly rider.",
  "source": "feedback",
  "messageId": "MSG-001"
}
```

## 🎯 Integration with Existing Features

### Order Processing
- AI fraud detection can be integrated into order creation
- Dynamic pricing can be applied during checkout
- Route optimization can be used when assigning riders

### Customer Support
- AI responses can be used in chat systems
- Sentiment analysis can monitor customer satisfaction
- Automated escalation based on sentiment scores

### Business Intelligence
- AI insights dashboard provides real-time analytics
- Demand prediction helps with resource planning
- Sentiment trends help improve service quality

## 🔒 Security Considerations

1. **API Key Security**: Store API keys securely in environment variables
2. **Rate Limiting**: AI services have built-in rate limiting
3. **Data Privacy**: Customer data is processed securely
4. **Cost Control**: Monitor AI usage to control costs

## 💰 Cost Optimization

### Tips to Reduce AI Costs:
1. **Use Efficient Models**: `gpt-4o-mini`, `gemini-1.5-flash`, `claude-3-haiku`
2. **Cache Responses**: AI responses are cached for repeated queries
3. **Batch Processing**: Use bulk operations when possible
4. **Smart Triggers**: Only use AI when necessary
5. **Hybrid Mode**: Use different providers for different tasks

## 🚨 Monitoring and Alerts

### Health Check
```bash
curl http://localhost:3000/api/ai/health
```

### AI Insights
```bash
curl http://localhost:3000/api/ai/insights
```

## 🔄 Fallback Mechanisms

- If AI services are unavailable, the system falls back to default behavior
- Each AI feature can be individually disabled via environment variables
- Error handling ensures system stability even with AI failures

## 📈 Performance Optimization

- **Concurrent Request Limiting**: Prevents overwhelming AI services
- **Response Caching**: Reduces redundant API calls
- **Queue Management**: Handles high-volume requests efficiently
- **Provider Selection**: Choose optimal provider for each task type

## 🛠️ Troubleshooting

### Common Issues:

1. **API Key Errors**: Verify API keys are correct and have sufficient credits
2. **Rate Limiting**: Reduce concurrent requests or upgrade API plan
3. **Model Errors**: Check if the specified model is available
4. **Network Issues**: Ensure stable internet connection for AI services

### Debug Mode:
Set `NODE_ENV=development` to see detailed AI service logs.

## 🎉 Getting Started

1. **Set up API keys** for your preferred AI provider(s)
2. **Configure environment variables** in your `.env` file
3. **Test AI health** with `GET /api/ai/health`
4. **Start using AI features** in your application
5. **Monitor usage** and optimize based on your needs

Your delivery system now has powerful AI capabilities that can significantly improve efficiency, customer satisfaction, and business insights!
