# Secure Raindrop API Integration Guide

Your diet tracking app now supports **secure Raindrop API integration** for real AI-powered SmartBuckets functionality. This replaces the previous organization ID approach with proper API key authentication.

## 🔐 **Security Features**

### ✅ **Secure by Design**
- **API key validation** with Raindrop servers
- **Client-side only** storage (no server storage)
- **Encrypted transmission** to Raindrop servers
- **Session-based** credentials (not persistent)
- **Automatic fallback** to mock mode on errors

### ✅ **Zero Trust Approach**
- Your API keys **never touch our servers**
- Validation happens **directly with Raindrop**
- Failed authentication **auto-falls back** to mock mode
- You control **when and how** to connect

## 🚀 **How to Get Your API Key**

### **Step 1: Access Raindrop Dashboard**
1. Go to [raindrop.run](https://raindrop.run)
2. Sign in to your account
3. Navigate to **Settings → API Keys**

### **Step 2: Generate API Key**
1. Click **"Generate New API Key"**
2. Select permissions:
   - ✅ SmartBuckets: Read/Write
   - ✅ Query: Read
   - ✅ Search: Read
3. Copy the API key (starts with `lm_`)

### **Step 3: Get Organization ID**
1. In dashboard, go to **Organization Settings**
2. Copy your **Organization ID**
3. This is used for request routing

### **Step 4: Configure Your App**
1. In your app, go to **Summary → AI Insights**
2. Click **"Connect to Raindrop API"**
3. Enter your API key and Organization ID
4. Click **"Connect Securely"**

## 🛠️ **API Key Format & Validation**

### **Valid API Key Format**
```
lm_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### **Validation Requirements**
- ✅ Starts with `lm_`
- ✅ Minimum 20 characters
- ✅ Alphanumeric after prefix
- ✅ Validated against Raindrop servers

### **Organization ID Format**
```
your-org-id (alphanumeric, hyphens allowed)
```

## 🔧 **Environment Variables (Optional)**

For development, you can set environment variables:

```env
# .env file
VITE_RAINDROP_API_KEY=lm_your_actual_api_key_here
VITE_RAINDROP_API_URL=https://api.liquidmetal.ai
VITE_RAINDROP_ORG_ID=your_organization_id_here
```

**Note:** These are **optional**. The app works perfectly without them. When set, the app will automatically connect to real Raindrop on startup.

## 📊 **Real vs Mock Mode Comparison**

| Feature | Mock Mode | Real API Mode |
|---------|-----------|----------------|
| Meal Storage | ✅ Supabase | ✅ SmartBuckets |
| Search | 🔍 Keyword-based | 🤖 Semantic AI |
| Insights | 📊 Rule-based | 🧠 AI-powered |
| Recommendations | 💭 Generic | 🎯 Personalized |
| Setup | ⚡ Instant | 🔑 API key needed |
| Cost | 💰 Free | 💳 Raindrop pricing |

## 🔄 **API Connection Process**

### **Automatic Validation**
1. **Client Validation** - Basic format checks
2. **Server Validation** - Raindrop auth check
3. **Permission Check** - SmartBuckets access verified
4. **Connection Test** - Live connectivity confirmed

### **Graceful Fallback**
- If API key invalid → Mock mode
- If network error → Mock mode  
- If permissions insufficient → Mock mode
- If Raindrop down → Mock mode

## 🛡️ **Security Best Practices**

### ✅ **Do**
- Keep your API key private
- Use read-only permissions when possible
- Regenerate keys if compromised
- Use environment variables in production

### ❌ **Don't**
- Share API keys in public repositories
- Hard-code keys in frontend code
- Use overly permissive permissions
- Store keys in browsers persistently

## 🔍 **API Usage Monitoring**

### **In Your App**
- Connection status clearly displayed
- Error messages for failed connections
- Easy disconnect/reconnect options
- Real-time mode indicators

### **In Raindrop Dashboard**
- API usage metrics
- Request logs
- Rate limiting info
- Billing information

## 🚨 **Troubleshooting**

### **"Invalid API Key"**
- Check key starts with `lm_`
- Ensure minimum 20 characters
- Verify key is still active in dashboard
- Try regenerating a new key

### **"Connection Failed"**
- Check internet connectivity
- Verify Raindrop services status
- Ensure correct organization ID
- Try connecting again

### **"Permission Denied"**
- Check key has SmartBuckets permissions
- Verify organization access
- Ensure key isn't expired
- Contact Raindrop support if needed

### **"Falls Back to Mock Mode"**
- This is expected behavior on errors
- Your app continues working normally
- Try reconnecting when issue resolved
- Check Raindrop service status

## 🎯 **When to Use Each Mode**

### **Use Mock Mode When:**
- 🧪 Testing and development
- 💰 Budget-conscious usage
- 🔧 API not yet configured
- 🌐 Network connectivity issues
- 🧪 Learning the features

### **Use Real API When:**
- 🚀 Production deployment
- 🤖 True AI insights needed
- 🔍 Semantic search required
- 📊 Advanced analytics
- 💼 Commercial application

## 🔄 **Switching Between Modes**

### **From Mock to Real**
1. Click "Connect to Raindrop API"
2. Enter valid API key and org ID
3. Connection validates automatically
4. Start using AI features immediately

### **From Real to Mock**
1. Click "Disconnect" in status indicator
2. App returns to mock mode
3. No data loss occurs
4. Can reconnect anytime

## 🎉 **You're All Set!**

Your app now has:
- ✅ **Secure API integration** with proper authentication
- ✅ **Automatic fallback** to mock mode
- ✅ **Real-time validation** of credentials
- ✅ **User-friendly setup** with guided dialogs
- ✅ **Zero-risk approach** - everything works even without API

**Test it now:** Go to Summary → AI Insights and click "Connect to Raindrop API" to experience the secure setup process!