# Chain of Thought Improvements Demo

Interactive demonstration of Chain of Thought (CoT) improvements in AI responses.

## 🌐 Live Demo

**Try it now:** https://cot-demo-qzziphrwp-jason-bices-projects.vercel.app

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

- **4 Different CoT Approaches**: Compare Raw, Prompt-Shaped, Code-Structured, and Hybrid implementations
- **Customizable Prompt Presets**: Switch between different personas and tones:
  - Professional Analyst (standard business tone)
  - Executive Summary (C-suite focused)
  - ELI5 - Explain Like I'm 5 (simplified for non-technical users)
  - Data-Heavy Technical (detailed statistical analysis)
- **MODEL UX ZONE**: Content designers can modify prompts to control AI responses without code changes
- **Real-time Analysis**: Live API calls to Claude 3.5 Sonnet (when API key provided)
- **Security Demonstration**: Shows attack surface exposure and risk comparison
- **Performance Metrics**: Token usage, latency, and cost tracking across all approaches
- **Interactive Scenarios**: Multiple realistic business use cases
- **Works Out-of-the-Box**: Demo mode with realistic mock data requires no API key

## 🎯 Perfect For

- **AI Safety Presentations**: Demonstrates security risks and mitigation strategies
- **UX Design Discussions**: Shows how prompt design affects user experience
- **Engineering Best Practices**: Compares structured vs. unstructured AI responses
- **Content Design Workshops**: Illustrates the MODEL UX ZONE concept
- **Cross-functional Team Alignment**: Bridges product, engineering, and design
- **Client Demonstrations**: Professional, polished interactive demo

## 🔧 Technical Details

- **Frontend**: React + Tailwind CSS
- **Backend**: Node.js proxy server (for CORS)
- **API**: Anthropic Claude 3.5 Sonnet
- **Deployment**: Live on Vercel with automatic deployments

## 📊 Demo Scenarios

Each scenario includes realistic business data and demonstrates how different CoT approaches handle the same question:

- **Q2 to Q3 Expense Analysis**: Typical quarter-over-quarter expense increase (10%)
- **Seasonal Spending**: Holiday vs. regular month spending patterns
- **Department Budget Comparison**: Cross-departmental budget vs. actual analysis

## 🎨 How Prompt Presets Work

The demo includes a **MODEL UX ZONE** concept - a set of configurable prompts that content designers can modify without touching code. Each preset provides:

- **System Prompt**: Sets the AI's persona and expertise level
- **Thinking Guidance**: Shapes the internal reasoning process
- **Answer Guidance**: Controls tone, length, and structure of final responses

This demonstrates how prompt engineering can dramatically change user experience while maintaining the same underlying data and logic.

---

The demo works perfectly without any API keys - just visit the live link or clone and run! 🎉