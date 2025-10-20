# Chain of Thought Improvements Demo

Interactive demonstration of Chain of Thought (CoT) improvements in AI responses.

## 🌐 Live Demo

**Try it now:** https://cot-improvements-demo-nywxipjwn-jbicehome-4915s-projects.vercel.app

No setup required - works immediately with live API calls!

## 🚀 Local Development

**Option 1: Run with Demo Data (No API Key Required)**
```bash
git clone https://github.com/sbice-mines/cot-demo.git
cd cot-demo
npm install
npm start
```
Open http://localhost:3000 and click "Run Analysis" - it works immediately with realistic demo data!

**Option 2: Run with Live API Calls**
```bash
# After cloning and installing dependencies:
echo "REACT_APP_ANTHROPIC_KEY=your_api_key_here" > .env
npm start
```

## ✨ Features

- **4 Different CoT Approaches**: Raw, Prompt-Shaped, Code-Structured, and Hybrid
- **Real-time Analysis**: Live API calls to Claude (when API key provided)
- **Security Demonstration**: Shows attack surface exposure
- **Performance Metrics**: Token usage, latency, and cost tracking
- **Interactive Scenarios**: Multiple business use cases
- **Works Out-of-the-Box**: Demo mode requires no setup

## 🎯 Perfect For

- AI safety presentations
- UX design discussions  
- Engineering best practices
- Cross-functional team alignment
- Client demonstrations

## 🔧 Technical Details

- **Frontend**: React + Tailwind CSS
- **Backend**: Node.js proxy server (for CORS)
- **API**: Anthropic Claude 3.5 Sonnet
- **Deployment**: Live on Vercel with automatic deployments

## 📊 Demo Scenarios

- Q2 to Q3 expense analysis
- Seasonal spending patterns
- Department budget comparison

The demo works perfectly without any API keys - just visit the live link or clone and run! 🎉