import React, { useState } from "react";
import {
  Loader2,
  Play,
  Download,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Clock,
  DollarSign,
  Zap,
  Info,
  Shield,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

/**
 * Chain of Thought (CoT) Improvements Demo
 * 
 * This interactive demonstration compares four different approaches to AI response design:
 * 1. Raw CoT - Current state with security risks
 * 2. Prompt-Shaped - Improved via prompt engineering
 * 3. Code-Structured - Systematic validation and structure
 * 4. Hybrid - Best of both worlds
 * 
 * Interactive demonstration of AI safety, UX design, and engineering best practices.
 * 
 * @author Your Name
 * @version 1.0.0
 * @created 2024
 */

// Hotspot annotations for Raw CoT examples
const RAW_COT_HOTSPOTS = {
  clear_selfcontained: {
    phrase: "clear and self-contained",
    issue: "Fluff",
    color: "amber",
    explanation: "Unnecessary meta-commentary. The user didn't ask if their question was clear - just answer it!"
  },
  instruction_set: {
    phrase: "instruction set",
    issue: "Security Risk 🚨",
    color: "red",
    explanation: "Reveals internal configuration structure. Attackers can use this to understand how to manipulate the system."
  },
  date_macro: {
    phrase: "date_macro",
    issue: "System Internals",
    color: "red",
    explanation: "Exposes internal variable names and macro systems. This is backend architecture that should never be user-facing."
  },
  this_year_to_date: {
    phrase: "THIS_YEAR_TO_DATE to LAST_YEAR",
    issue: "Configuration Leak",
    color: "red",
    explanation: "Shows exact internal date handling logic. Reveals how the system transforms user requests behind the scenes."
  },
  question_unchanged: {
    phrase: "question text remains unchanged",
    issue: "Meta-reasoning",
    color: "orange",
    explanation: "Talking about the thinking process itself instead of just doing the analysis. Pure noise."
  },
  selfcontained_clear: {
    phrase: "self-contained and clear",
    issue: "Fluff",
    color: "amber",
    explanation: "Repetitive self-assessment. Users don't care if the system thinks the question is clear."
  },
  downstream_processing: {
    phrase: "downstream processing",
    issue: "Architecture Leak",
    color: "orange",
    explanation: "Reveals system pipeline and data flow. Backend terminology that confuses users."
  },
  profit_loss_report: {
    phrase: "Profit and Loss' report is the most suitable dataset",
    issue: "Dataset Selection Logic",
    color: "yellow",
    explanation: "While this might be educational, it's meta-reasoning about which dataset to use - often TMI for users."
  },
  resolved_entities: {
    phrase: "resolved entities (ITEM_NAME, PROJECT_NAME)",
    issue: "Entity Resolution System",
    color: "red",
    explanation: "Exposes the entity resolution system and internal variable names. Shows how the system parses user input."
  },
  ignored: {
    phrase: "have been ignored",
    issue: "System Decision Process",
    color: "orange",
    explanation: "Revealing what the system chose to ignore exposes decision-making logic that could be exploited."
  },
  summary_report: {
    phrase: "This summary report analyzes",
    issue: "Redundant Fluff",
    color: "amber",
    explanation: "States the obvious. Users already know they asked for analysis - just provide it."
  },
  i_analyzed: {
    phrase: "I analyzed",
    issue: "Unnecessary Narration",
    color: "amber",
    explanation: "Describing the process of analyzing. Just show the result, don't narrate the work."
  },
  i_identified: {
    phrase: "I identified all entries",
    issue: "Process Narration",
    color: "amber",
    explanation: "Step-by-step narration of internal operations. Wastes tokens describing work instead of showing results."
  },
  formatted_month: {
    phrase: "formatted the month information",
    issue: "Implementation Details",
    color: "yellow",
    explanation: "Data formatting is an implementation detail. Users don't need to know about data transformations."
  },
  numerical_amounts: {
    phrase: "correctly interpreted as numerical amounts",
    issue: "Technical Process",
    color: "yellow",
    explanation: "Data type validation is an internal check. Mentioning it suggests the system isn't confident - reduces trust."
  },
  analysis_chain: {
    phrase: "analysis chain focuses on",
    issue: "System Architecture",
    color: "orange",
    explanation: "Reveals the concept of an 'analysis chain' - internal processing pipeline users shouldn't know about."
  }
};

// Prompt style templates for the Model UX Playground
const PROMPT_STYLES = {
  conversational: {
    name: "Conversational (Natural Language)",
    description: "Familiar, easy-to-understand instructions",
    template: `You are a helpful financial analyst. Analyze the expense data provided.

Provide two parts in your response:

THINKING (brief, user-friendly):
Share your thought process in 2-3 sentences. Keep it conversational and educational - like you're explaining to a colleague.

ANSWER (clear and actionable):
Write a concise analysis that includes:
- What you're comparing (one sentence)
- The overall change with specific numbers
- Top 2-3 drivers with their changes
- One sentence about what this means

Keep the answer under 100 words. Use clear, business-friendly language.`,
  },
  structured: {
    name: "JSON Schema (Structured)",
    description: "Machine-readable format with validation",
    template: `You are a financial analysis system. Respond in structured format.

Use these labeled fields to organize your thinking:

THINKING
**Process:** [what comparison you're doing]
**Accounting Method:** [how you're analyzing]

ANSWER
**Key Drivers:**
• [Driver 1 with % and context]
• [Driver 2 with % and context]

**Patterns of Note:** [trends and insights]

**Business Implication:** [impact and recommendations]`,
  },
  technical: {
    name: "DSL-like (Domain Specific)",
    description: "Technical syntax for advanced users",
    template: `@ROLE: FinancialAnalyzer
@MODE: comparative_analysis
@OUTPUT_FORMAT: dual_section

SECTION[thinking]:
  VISIBILITY: optional_user_facing
  LENGTH: 2-3_statements
  STYLE: explanatory
  CONTENT: reasoning_trace + pattern_detection

SECTION[answer]:
  REQUIRED_COMPONENTS:
    - comparison_scope
    - delta_summary[with_metrics]
    - top_contributors[2-3, sorted_by_impact]
    - business_implication
  CONSTRAINTS:
    MAX_TOKENS: ~100
    TONE: professional_concise
  FORMAT: structured_markdown_output
  
@EXECUTE: structured_financial_comparison

Output in this format:

THINKING
[Brief analytical reasoning, 2-3 statements]

ANSWER

═══════════════════════════════════
SCOPE: [comparison description]
───────────────────────────────────
DELTA: [overall change with metrics]
───────────────────────────────────
TOP CONTRIBUTORS:
  → [#1 contributor with % and context]
  → [#2 contributor with % and context]
  → [#3 contributor with % and context]
───────────────────────────────────
IMPLICATION: [business impact]
═══════════════════════════════════`,
  },
};

// Demo scenarios with realistic business data
const SCENARIOS = {
  Q2_to_Q3_increase: {
    name: "Q2 to Q3 (10% increase)",
    description: "Typical quarter-over-quarter expense analysis",
    data: [
      { category: "Marketing", Q2: 12000, Q3: 13400 },
      { category: "Travel", Q2: 8000, Q3: 8650 },
      { category: "Supplies", Q2: 6000, Q3: 6100 },
      { category: "Freight", Q2: 2100, Q3: 2600 },
    ],
    question: "Why did my expenses increase from Q2 to Q3?",
  },
  seasonal_spending: {
    name: "Seasonal Spending Analysis",
    description: "Holiday season vs regular spending patterns",
    data: [
      { category: "Marketing", Regular: 15000, Holiday: 25000 },
      { category: "Inventory", Regular: 8000, Holiday: 15000 },
      { category: "Staffing", Regular: 12000, Holiday: 18000 },
      { category: "Utilities", Regular: 3000, Holiday: 3500 },
    ],
    question: "How does our holiday spending compare to regular months?",
  },
  department_comparison: {
    name: "Department Budget Analysis",
    description: "Cross-departmental budget performance",
    data: [
      { category: "Engineering", Budget: 50000, Actual: 52000 },
      { category: "Sales", Budget: 30000, Actual: 28000 },
      { category: "Marketing", Budget: 20000, Actual: 25000 },
      { category: "Operations", Budget: 15000, Actual: 16000 },
    ],
    question: "Which departments are over or under budget?",
  },
};

// =============================================================================
// MODEL UX ZONE: Prompt configurations that shape how the model responds
// Content designers can modify these to change tone, structure, and response format
// =============================================================================

/**
 * Prompt presets for different user personas and use cases
 * These demonstrate how content designers can control AI responses
 * without requiring code changes - just prompt modifications
 */
const PROMPT_PRESETS = {
  "Professional Analyst": {
    systemPrompt:
      "You are a financial analyst providing professional business analysis.",
    thinkingGuidance:
      "Brief note on what you're comparing and why (2-3 sentences). Mention any interesting patterns you notice. Keep it conversational and educational.",
    answerGuidance:
      "Write a concise analysis with: scope statement, overall change with specific numbers, top 2-3 drivers with their changes, and one sentence implication. Keep under 100 words. Use clear, business-friendly language.",
    description: "Standard professional tone for business users",
  },
  "Executive Summary": {
    systemPrompt:
      "You are an executive advisor providing high-level strategic insights.",
    thinkingGuidance:
      "Note the strategic significance of this comparison and why executives should care.",
    answerGuidance:
      "Lead with the bottom line. Use bold statements. Focus on impact and action items. Maximum 3 sentences. Use metrics that matter to decision-makers.",
    description: "Direct, action-oriented for C-suite",
  },
  "ELI5 (Explain Like I'm 5)": {
    systemPrompt:
      "You are a friendly teacher explaining financial concepts in simple terms.",
    thinkingGuidance:
      "Think about how to make this relatable using everyday examples.",
    answerGuidance:
      "Use simple words and short sentences. Explain it like you're talking to someone with no finance background. Use analogies if helpful. Keep it friendly and approachable.",
    description: "Simplified language for non-finance users",
  },
  "Data-Heavy Technical": {
    systemPrompt:
      "You are a quantitative analyst providing detailed statistical analysis.",
    thinkingGuidance:
      "Note the statistical methods and data quality considerations.",
    answerGuidance:
      "Include all relevant numbers, percentages, and calculations. Show methodology. Be precise about data ranges and confidence. Technical accuracy over readability.",
    description: "Detailed, numbers-focused for technical users",
  },
};

/**
 * Main demo component showcasing CoT improvement approaches
 * 
 * Features:
 * - Interactive comparison of 4 different CoT approaches
 * - Real-time API calls to Claude for authentic responses
 * - Security risk demonstration
 * - Cost and performance metrics
 * - Configurable prompt presets for different user types
 */
export default function ResponseDesignDemo() {
  // Presentation mode state
  const [presentationMode, setPresentationMode] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  
  // State management for demo controls
  const [scenario, setScenario] = useState("Q2_to_Q3_increase");
  const [question, setQuestion] = useState(
    SCENARIOS["Q2_to_Q3_increase"].question
  );
  const [selectedPreset, setSelectedPreset] = useState("Professional Analyst");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [showPromptConfig, setShowPromptConfig] = useState(false);
  const [expandedThinking, setExpandedThinking] = useState({
    raw: true,  // Show raw thinking by default to highlight the problem
    instructed: false,
    coded: false,
    hybrid: false,
  });
  const [showIntro, setShowIntro] = useState(true);
  const [apiKeyStatus, setApiKeyStatus] = useState(null);
  
  // Model UX Playground state
  const [playgroundOpen, setPlaygroundOpen] = useState(false);
  const [selectedPromptStyle, setSelectedPromptStyle] = useState('conversational');
  const [customPrompt, setCustomPrompt] = useState('');
  const [playgroundResults, setPlaygroundResults] = useState(null);
  
  // Interactive hotspot state
  const [activeHotspot, setActiveHotspot] = useState(null);

  const currentScenario = SCENARIOS[scenario];

  // Check API key status on component mount
  React.useEffect(() => {
    const apiKey = process.env.REACT_APP_ANTHROPIC_KEY;
    if (apiKey && apiKey !== "your_api_key_here" && apiKey.startsWith("sk-ant-")) {
      setApiKeyStatus("ready");
    } else {
      setApiKeyStatus("demo"); // Changed from "missing" to "demo"
    }
  }, []);

  // Update custom prompt when prompt style changes
  React.useEffect(() => {
    if (PROMPT_STYLES[selectedPromptStyle]) {
      setCustomPrompt(PROMPT_STYLES[selectedPromptStyle].template);
      setPlaygroundResults(null); // Clear previous results when switching templates
    }
  }, [selectedPromptStyle]);

  const formatDataForPrompt = (data) => {
    return data
      .map((row) => {
        const keys = Object.keys(row).filter((k) => k !== "category");
        return `${row.category}: ${keys
          .map((k) => `${k}=$${row[k].toLocaleString()}`)
          .join(", ")}`;
      })
      .join("\n");
  };

  const estimateTokens = (text) => {
    // Rough estimate: ~4 chars per token
    return Math.ceil(text.length / 4);
  };

  const generateMockResponses = (dataString, question) => {
    // Mock responses for demo when API key is not available
    const rawResponse = `Analyzing your question: The user is asking about expense increases from Q2 to Q3. The instruction set date_macro is set to QUARTERLY_COMPARISON. The question is clear and self-contained, requesting a quarter-over-quarter analysis.

Interpreting your question: This is a financial performance analysis query. The expense data provided is the most suitable dataset for this type of comparison. I'll need to calculate percentage changes and identify the primary drivers of the increase.

Customizing your expense analysis: I'm preparing a quarterly comparison report analyzing the expense categories with percentage change calculations and trend analysis.

**Analysis Results:**

Your expenses increased by 10.2% from Q2 to Q3, rising from $28,100 to $30,750. The primary drivers were:

1. **Marketing expenses** (+11.7%): Increased from $12,000 to $13,400, likely due to seasonal campaigns
2. **Freight costs** (+23.8%): Jumped from $2,100 to $2,600, possibly due to fuel price increases  
3. **Travel expenses** (+8.1%): Rose from $8,000 to $8,650, potentially reflecting increased business activity

Supplies remained relatively stable (+1.7%), suggesting good cost control in that area.

**Implication:** The increase appears to be driven by strategic marketing investments and external cost pressures rather than operational inefficiencies.`;

    const instructedResponse = `THINKING:
I'm comparing Q2 vs Q3 expenses to identify the drivers of the 10.2% increase. The data shows interesting patterns - marketing and freight had the biggest jumps, while supplies stayed stable.

ANSWER:
Your expenses increased 10.2% from Q2 ($28,100) to Q3 ($30,750). Top drivers: Marketing (+11.7% to $13,400), Freight (+23.8% to $2,600), and Travel (+8.1% to $8,650). This suggests strategic marketing investments and external cost pressures rather than operational issues.`;

    const codedResponse = {
      thinking: {
        scope: "Q2 to Q3 expense comparison analysis",
        method: "Quarter-over-quarter percentage change calculation",
        assumptions: ["Data represents complete expense categories", "No one-time charges included"]
      },
      answer: {
        scope: "Analysis of expense increase from Q2 to Q3",
        overall_change: {
          from_total: 28100,
          to_total: 30750,
          percent_change: 10.2,
          description: "Total expenses increased 10.2% from Q2 to Q3"
        },
        top_drivers: [
          { category: "Marketing", percent_change: 11.7, description: "Strategic campaign investments" },
          { category: "Freight", percent_change: 23.8, description: "Fuel price increases" },
          { category: "Travel", percent_change: 8.1, description: "Increased business activity" }
        ],
        implication: "Increase driven by strategic investments and external factors rather than operational inefficiencies"
      }
    };

    const hybridResponse = `Your expenses increased $2,750 from $28,100 to $30,850 (9.8% growth). The three key drivers are:

• **Marketing**: +$1,400 (11.7%) - Strategic campaign investments aligned with Q3 product launches
• **Freight**: +$500 (23.8%) - External cost pressures from fuel prices and carrier rate adjustments  
• **Travel**: +$650 (8.1%) - Increased business development activity

**Context**: This growth pattern is consistent with planned business expansion. Marketing's absolute impact is highest, though Freight shows the steepest percentage increase due to market conditions.

**Recommendation**: Monitor Freight costs closely in Q4 as carrier rates may continue rising. Marketing ROI from Q3 campaigns should be evaluated to justify the continued investment level.`;

    const metrics = {
      raw: { tokens: estimateTokens(rawResponse), ttft: 180, latency: 850 },
      instructed: { tokens: estimateTokens(instructedResponse), ttft: 180, latency: 650 },
      coded: { tokens: estimateTokens(JSON.stringify(codedResponse)), ttft: 180, latency: 600 },
      hybrid: { tokens: estimateTokens(hybridResponse), ttft: 220, latency: 950 }
    };

    return { 
      raw: rawResponse, 
      instructed: instructedResponse, 
      coded: codedResponse,
      hybrid: hybridResponse,
      metrics 
    };
  };

  const callClaude = async (systemPrompt, userPrompt) => {
    const apiKey = process.env.REACT_APP_ANTHROPIC_KEY;
    
    if (!apiKey || apiKey === "your_api_key_here") {
      throw new Error("Anthropic API key not configured. Using mock responses for demo.");
    }

    try {
      // Use our proxy server to avoid CORS issues
      // In production (Vercel), use /api/anthropic. Locally, use localhost:3001
      const apiEndpoint = process.env.NODE_ENV === 'production' 
        ? '/api/anthropic'
        : 'http://localhost:3001/api/anthropic';
      
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          apiKey: apiKey,
          model: "claude-sonnet-4-5-20250929",
          max_tokens: 1500,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(
          `API request failed (${response.status}): ${errorData.error || 'Unknown error'}`
        );
      }

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      // Handle network errors gracefully
      console.warn("API call failed, falling back to mock responses:", error.message);
      throw new Error(`API call failed: ${error.message}. Using mock responses for demo.`);
    }
  };

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    setLoadingStep("Preparing data...");

    try {
      const dataString = formatDataForPrompt(currentScenario.data);
      
      // Check if API key is available and valid
      const apiKey = process.env.REACT_APP_ANTHROPIC_KEY;
      const hasApiKey = apiKey && apiKey !== "your_api_key_here" && apiKey.startsWith("sk-ant-");
      
      if (!hasApiKey) {
        // Show mock responses for demo purposes
        setLoadingStep("Generating demo responses...");
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
        
        const mockResults = generateMockResponses(dataString, question);
        setResults(mockResults);
        setLoading(false);
        return;
      }

      setLoadingStep("Generating Raw CoT response...");

      // RAW COT - Mimics realistic but problematic internal reasoning exposure
      const rawPrompt = `You are analyzing financial data. Here's the expense data:

${dataString}

Question: ${question}

Show your reasoning process in sections, being explicit about your internal analysis:

1. "Analyzing your question" - Discuss what the user is asking. Mention any instruction set configurations or date macro changes that might apply.

2. "Interpreting your question" - Explain which dataset/approach is suitable for this type of query and any relevant entity resolution.

3. "Customizing your analysis" - Describe how you're preparing the analysis and what parameters you're using.

4. Then provide the actual answer.

Be detailed about your internal reasoning process and system configurations.`;

      setLoadingStep("Generating Prompt-Shaped response...");
      
      // PROMPT-SHAPED - Shaped via prompts
      const instructedPrompt = `You are a financial analyst. Analyze this expense data:

${dataString}

Question: ${question}

Provide two parts:

THINKING (optional, could be shown to users for education):
- Brief note on what you're comparing and why (2-3 sentences)
- Mention any interesting patterns you notice
- Keep it conversational and educational

ANSWER (what users see):
Write a concise analysis with:
- One sentence scope statement
- The overall change with specific numbers
- Top 2-3 drivers with their changes
- One sentence implication or next step

Keep the answer under 100 words. Use clear, business-friendly language.`;

      setLoadingStep("Generating Code-Structured response...");
      
      // CODE-STRUCTURED - Simulating structured approach
      const codedPrompt = `You are a financial analysis engine that outputs structured JSON.

Data:
${dataString}

Question: ${question}

Output ONLY valid JSON in this exact structure (no other text):

{
  "thinking": {
    "scope": "brief description of what's being compared",
    "method": "calculation approach",
    "assumptions": ["list any assumptions"]
  },
  "answer": {
    "scope": "one sentence describing the comparison",
    "overall_change": {
      "from_total": number,
      "to_total": number,
      "percent_change": number,
      "description": "sentence describing the change"
    },
    "top_drivers": [
      {"category": "name", "percent_change": number, "description": "brief desc"}
    ],
    "implication": "one sentence about what this means or next steps"
  }
}

Respond ONLY with valid JSON.`;

      // HYBRID - Extended thinking with self-review
      const hybridPrompt = `You are a financial analyst. You'll think through this in stages:

STAGE 1 - Extended Thinking (your scratchpad):
Think deeply about the expense data and question below. Explore different angles, verify your logic.

Data:
${dataString}

Question: ${question}

STAGE 2 - Self-Review:
Review your thinking. Ask yourself:
- Are my numbers accurate?
- Is my reasoning clear?
- Have I answered the question fully?

STAGE 3 - Refined Answer:
Based on your analysis and review, provide a clear, polished answer.

Format: Show only the final refined answer (not the scratchpad or review).`;

      setLoadingStep("Calling Claude API...");
      
      const [raw, instructed, codedRaw, hybrid] = await Promise.all([
        callClaude("You are a helpful AI assistant.", rawPrompt),
        callClaude("You are a financial analyst.", instructedPrompt),
        callClaude("You are a structured data API.", codedPrompt),
        callClaude("You are a financial analyst.", hybridPrompt),
      ]);

      setLoadingStep("Processing results...");

      // Parse coded response
      let codedData;
      try {
        let jsonText = codedRaw
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();
        codedData = JSON.parse(jsonText);
      } catch (e) {
        codedData = {
          thinking: {
            scope: "Parse error - see raw response",
            method: "N/A",
            assumptions: [],
          },
          answer: {
            scope: "Error parsing structured response",
            overall_change: { description: "See raw output" },
            top_drivers: [],
            implication: "Could not parse JSON response",
          },
          _raw: codedRaw,
        };
      }

      // Calculate metrics
      const metrics = {
        raw: {
          tokens: estimateTokens(raw),
          ttft: 180, // Simulated
          latency: 850,
        },
        instructed: {
          tokens: estimateTokens(instructed),
          ttft: 180,
          latency: 650,
        },
        coded: {
          tokens: estimateTokens(codedRaw),
          ttft: 180,
          latency: 600,
        },
        hybrid: {
          tokens: estimateTokens(hybrid),
          ttft: 220, // Slightly longer due to multi-step
          latency: 950,
        },
      };

      setResults({ raw, instructed, coded: codedData, hybrid, metrics });
    } catch (err) {
      console.warn("API calls failed, using demo responses:", err.message);
      
      // Fall back to mock responses on any error
      setLoadingStep("Generating demo responses...");
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing delay
      
      const dataString = formatDataForPrompt(currentScenario.data);
      const mockResults = generateMockResponses(dataString, question);
      setResults(mockResults);
      
      // Show a subtle notification that we're using demo data
      setError("Note: Using demo responses (API unavailable)");
    } finally {
      setLoading(false);
    }
  };

  const toggleThinking = (type) => {
    setExpandedThinking((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const isThinkingExpanded = (type) => {
    return expandedThinking[type];
  };

  const renderMetrics = (metrics) => (
    <div className="flex gap-4 text-xs">
      <div className="flex items-center gap-1">
        <Zap className="w-3 h-3 text-slate-500" />
        <span className="text-slate-600">Tokens:</span>
        <span className="font-medium">{metrics.tokens}</span>
      </div>
      <div className="flex items-center gap-1">
        <Clock className="w-3 h-3 text-slate-500" />
        <span className="text-slate-600">Latency:</span>
        <span className="font-medium">{metrics.latency}ms</span>
      </div>
      <div className="flex items-center gap-1">
        <DollarSign className="w-3 h-3 text-slate-500" />
        <span className="text-slate-600">Cost:</span>
        <span className="font-medium">
          ${(metrics.tokens * 0.000003).toFixed(4)}
        </span>
      </div>
    </div>
  );

  // Render interactive hotspot
  const Hotspot = ({ hotspotKey, children }) => {
    const hotspot = RAW_COT_HOTSPOTS[hotspotKey];
    if (!hotspot) return <span>{children}</span>;
    
    const isActive = activeHotspot === hotspotKey;
    const colorClasses = {
      red: 'bg-red-100 border-red-400 text-red-900',
      orange: 'bg-orange-100 border-orange-400 text-orange-900',
      yellow: 'bg-yellow-100 border-yellow-400 text-yellow-900',
      amber: 'bg-amber-100 border-amber-400 text-amber-900',
    };
    
    return (
      <span className="relative inline-block">
        <span
          className={`cursor-pointer border-b-2 border-dashed ${
            isActive ? colorClasses[hotspot.color] : 'border-slate-400 hover:bg-slate-100'
          } transition-colors px-1`}
          onClick={() => setActiveHotspot(isActive ? null : hotspotKey)}
          onMouseEnter={() => setActiveHotspot(hotspotKey)}
          onMouseLeave={() => setActiveHotspot(null)}
        >
          {children}
        </span>
        {isActive && (
          <div className="absolute z-50 top-full left-0 mt-1 w-64 bg-white border-2 border-slate-300 rounded-lg shadow-lg p-3">
            <div className={`text-xs font-semibold mb-1 ${hotspot.color === 'red' ? 'text-red-700' : hotspot.color === 'orange' ? 'text-orange-700' : hotspot.color === 'yellow' ? 'text-yellow-700' : 'text-amber-700'}`}>
              ⚠️ {hotspot.issue}
            </div>
            <p className="text-xs text-slate-700">{hotspot.explanation}</p>
          </div>
        )}
      </span>
    );
  };

  // Render data table for current scenario
  const renderDataTable = () => {
    const data = currentScenario.data;
    if (!data || data.length === 0) return null;

    // Get column names (excluding 'category')
    const columns = Object.keys(data[0]).filter(k => k !== 'category');

    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-slate-700 mb-3">📊 Data</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-300">
                <th className="text-left py-2 px-3 font-semibold text-slate-700">Category</th>
                {columns.map(col => (
                  <th key={col} className="text-right py-2 px-3 font-semibold text-slate-700">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx} className="border-b border-slate-200 last:border-0">
                  <td className="py-2 px-3 text-slate-800">{row.category}</td>
                  {columns.map(col => (
                    <td key={col} className="text-right py-2 px-3 text-slate-700">
                      ${row[col].toLocaleString()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Parse markdown tables and render them as HTML tables
  const renderMarkdownTable = (text) => {
    // Check if text contains a markdown table
    const tableRegex = /\|(.+)\|\n\|[-:\s|]+\|\n((?:\|.+\|\n?)+)/g;
    
    if (!tableRegex.test(text)) {
      // No table found, return as-is
      return <div className="whitespace-pre-wrap">{text}</div>;
    }

    // Split content into parts (text before table, table, text after table)
    const parts = [];
    let lastIndex = 0;
    
    text.replace(/\|(.+)\|\n\|[-:\s|]+\|\n((?:\|.+\|\n?)+)/g, (match, headerRow, bodyRows, offset) => {
      // Add text before table
      if (offset > lastIndex) {
        parts.push({
          type: 'text',
          content: text.substring(lastIndex, offset)
        });
      }

      // Parse table
      const headers = headerRow.split('|').map(h => h.trim()).filter(h => h);
      const rows = bodyRows.trim().split('\n').map(row => 
        row.split('|').map(cell => cell.trim()).filter(cell => cell)
      );

      parts.push({
        type: 'table',
        headers,
        rows
      });

      lastIndex = offset + match.length;
      return match;
    });

    // Add remaining text after last table
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex)
      });
    }

    return (
      <div>
        {parts.map((part, idx) => {
          if (part.type === 'text') {
            return <div key={idx} className="whitespace-pre-wrap">{part.content}</div>;
          } else {
            return (
              <div key={idx} className="my-4 overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-300 bg-slate-50">
                      {part.headers.map((header, i) => (
                        <th key={i} className="text-left py-2 px-3 font-semibold text-slate-700">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {part.rows.map((row, i) => (
                      <tr key={i} className="border-b border-slate-200 last:border-0">
                        {row.map((cell, j) => (
                          <td key={j} className="py-2 px-3 text-slate-700">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
        })}
      </div>
    );
  };

  const extractThinking = (rawText) => {
    // Extract sections 1-3 (the thinking part) before section 4 (the answer)
    const patterns = [
      /4\.\s*\*\*[^*]+\*\*:/,  // Matches "4. **Supplies**:" or similar
      /4\.\s+/,                 // Matches "4. " 
    ];
    
    // Find where section 4 starts
    let answerStart = -1;
    for (const pattern of patterns) {
      const match = rawText.search(pattern);
      if (match !== -1) {
        answerStart = match;
        break;
      }
    }
    
    if (answerStart !== -1) {
      // Return everything before section 4
      return rawText.substring(0, answerStart).trim();
    }
    
    // Fallback: remove last 2 sections
    const sections = rawText.split("\n\n");
    return sections.slice(0, -2).join("\n\n");
  };

  const extractAnswer = (rawText) => {
    // The raw prompt asks for sections 1-3 as thinking, then section 4 as the answer
    // Look for patterns like "4." or similar that indicate the answer section
    
    // Try to split on common patterns for the final section
    const patterns = [
      /4\.\s*\*\*[^*]+\*\*:/,  // Matches "4. **Supplies**:" or similar
      /4\.\s+/,                 // Matches "4. " 
    ];
    
    // First, try to find where section 4 starts
    let answerStart = -1;
    for (const pattern of patterns) {
      const match = rawText.search(pattern);
      if (match !== -1) {
        answerStart = match;
        break;
      }
    }
    
    if (answerStart !== -1) {
      // Extract from section 4 onwards
      let answer = rawText.substring(answerStart);
      // Remove the "4. " prefix if present
      answer = answer.replace(/^4\.\s+/, '');
      return answer.trim();
    }
    
    // Fallback: just take the last portion
    const sections = rawText.split("\n\n");
    return sections.slice(-2).join("\n\n");
  };

  const renderCodedAnswer = (coded) => {
    if (coded._raw) {
      return (
        <div>
          <p className="text-red-600 text-sm mb-2">
            ⚠️ JSON parsing failed - showing raw response:
          </p>
          <pre className="text-xs bg-slate-100 p-2 rounded overflow-auto">
            {coded._raw}
          </pre>
        </div>
      );
    }

    const ans = coded.answer;
    return (
      <div className="space-y-3 text-sm">
        <p>
          <strong>Scope:</strong> {ans.scope}
        </p>
        <p>
          <strong>Overall Change:</strong> {ans.overall_change.description}
          {ans.overall_change.from_total &&
            ` ($${ans.overall_change.from_total.toLocaleString()} → $${ans.overall_change.to_total.toLocaleString()}, ${
              ans.overall_change.percent_change
            }%)`}
        </p>
        {ans.top_drivers && ans.top_drivers.length > 0 && (
          <div>
            <strong>Top Drivers:</strong>
            <ul className="ml-4 mt-1">
              {ans.top_drivers.map((d, i) => (
                <li key={i}>
                  {d.category}: {d.percent_change}% - {d.description}
                </li>
              ))}
            </ul>
          </div>
        )}
        <p>
          <strong>Implication:</strong> {ans.implication}
        </p>
      </div>
    );
  };

  // Presentation page definitions
  const PAGES = [
    { id: 'intro', title: 'Introduction', subtitle: 'The Challenge of Chain of Thought' },
    { id: 'what-is-cot', title: 'What is Chain of Thought?', subtitle: 'Illusion of Labor or Useful Artifact?' },
    { id: 'raw', title: 'Raw CoT', subtitle: 'Current State: Multiple Opportunities for Improvement', approach: 'raw' },
    { id: 'voice-tone', title: 'Voice & Tone Shaped', subtitle: 'First Attempt: Better Readability, Same Underlying Issues', approach: 'voice' },
    { id: 'synthesis-playground', title: 'Query Synthesis', subtitle: 'UX Tools Beyond Voice & Tone' },
    { id: 'synthesis-practice', title: 'Query Synthesis in Practice', subtitle: 'What These Instructions Actually Produce' },
    { id: 'hybrid', title: 'Hybrid Approach', subtitle: 'The Eng + UX Handshake: Scratchpad → Self-Review → Refined Output', approach: 'hybrid' },
    { id: 'summary', title: 'Summary', subtitle: 'Key Takeaways & Recommendations' },
  ];

  // Navigation functions
  const nextPage = () => {
    if (currentPage < PAGES.length - 1) {
      setCurrentPage(currentPage + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      window.scrollTo(0, 0);
    }
  };

  const goToPage = (index) => {
    setCurrentPage(index);
    window.scrollTo(0, 0);
  };

  // Render a single CoT approach card
  const renderApproachCard = (approachKey, approachData, title, subtitle, badgeColor, badgeText, problemText) => {
    if (!results || !results[approachKey]) return null;

    return (
      <div className={`bg-white rounded-lg shadow-sm border-2 border-${badgeColor}-300 overflow-hidden`}>
        <div className={`bg-${badgeColor}-50 px-6 py-4 border-b border-${badgeColor}-200`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
              <p className="text-sm text-slate-600 mt-1">{subtitle}</p>
            </div>
            <span className={`px-3 py-1 ${badgeColor === 'orange' || badgeColor === 'purple' ? `bg-${badgeColor}-600 text-white` : `bg-${badgeColor}-100 text-${badgeColor}-800`} text-xs font-medium rounded-full`}>
              {badgeText}
            </span>
          </div>
          {renderMetrics(results.metrics[approachKey])}
        </div>

        {/* Thinking section */}
        {results[approachKey] && (
          <div className="border-b border-slate-200">
            <button
              onClick={() => toggleThinking(approachKey)}
              className={`w-full px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors ${approachKey === 'raw' ? 'bg-orange-100' : ''}`}
            >
              <span className="text-sm font-medium text-slate-700">
                {isThinkingExpanded(approachKey) ? "Hide thinking" : "Show thinking"}{" "}
                {approachKey === 'raw' && (
                  <span className="text-orange-700 text-xs ml-2 font-semibold">
                    ⚠️ Visible to users
                  </span>
                )}
                {approachKey === 'instructed' && (
                  <span className="text-green-600 text-xs ml-2">
                    ✓ Safe for users, potentially educational
                  </span>
                )}
              </span>
              {isThinkingExpanded(approachKey) ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            {isThinkingExpanded(approachKey) && (
              <div className={`px-6 py-4 ${approachKey === 'instructed' ? 'bg-blue-50' : 'bg-slate-50'} text-sm whitespace-pre-wrap border-t border-slate-200`}>
                {approachKey === 'raw' && extractThinking(results.raw)}
                {approachKey === 'instructed' && (
                  results.instructed.includes("THINKING")
                    ? results.instructed.split("ANSWER")[0].replace("THINKING", "").trim()
                    : ""
                )}
              </div>
            )}
          </div>
        )}

        {/* Answer section */}
        <div className="px-6 py-4 border-l-4 border-green-400">
          {approachKey === 'raw' && (
            <>
              <div className="text-xs text-green-700 font-medium mb-2">
                ↓ The actual answer (probably fine!) ↓
              </div>
              <div className="prose prose-sm max-w-none">
                {renderMarkdownTable(extractAnswer(results.raw))}
              </div>
            </>
          )}
          {approachKey === 'instructed' && (
            <div className="prose prose-sm max-w-none">
              {renderMarkdownTable(
                results.instructed.includes("ANSWER")
                  ? results.instructed.split("ANSWER")[1].trim()
                  : results.instructed
              )}
            </div>
          )}
          {approachKey === 'coded' && renderCodedAnswer(results.coded)}
          {approachKey === 'hybrid' && (
            <div className="prose prose-sm max-w-none">
              {renderMarkdownTable(results.hybrid.answer || results.hybrid)}
            </div>
          )}
        </div>

        {/* Problem/benefit text */}
        {problemText && (
          <div className={`px-6 py-3 bg-${badgeColor}-50 border-t border-${badgeColor}-200`}>
            <div dangerouslySetInnerHTML={{ __html: problemText }} className="text-xs" />
          </div>
        )}
      </div>
    );
  };

  // Introduction page
  const renderIntroPage = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-slate-900 mb-4">
          Chain of Thought
        </h1>
        <h2 className="text-2xl text-slate-600 mb-6">
          From Security Risk to Production Ready
        </h2>
        <p className="text-lg text-slate-700 max-w-2xl mx-auto">
          An interactive guide showing how to transform raw AI thinking 
          into secure, user-friendly responses.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-8 h-8 text-orange-600" />
            <h3 className="text-xl font-semibold text-slate-900">Current Observations</h3>
          </div>
          <p className="text-sm text-slate-700 mb-3">
            When raw CoT is exposed, we often see:
          </p>
          <ul className="space-y-2 text-slate-700 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-orange-600 font-bold mt-0.5">•</span>
              <span>Verbose internal reasoning that may overwhelm</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 font-bold mt-0.5">•</span>
              <span>Meta-reasoning about the process itself</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 font-bold mt-0.5">•</span>
              <span>Technical jargon that confuses non-experts</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 font-bold mt-0.5">•</span>
              <span>System details that reveal internal architecture</span>
            </li>
          </ul>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-8 h-8 text-blue-600" />
            <h3 className="text-xl font-semibold text-slate-900">Approaches to Explore</h3>
          </div>
          <p className="text-sm text-slate-700 mb-3">
            This presentation examines different strategies:
          </p>
          <ul className="space-y-2 text-slate-700 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">→</span>
              <span><strong>Voice & Tone:</strong> Adjusting how it sounds</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">→</span>
              <span><strong>Query Synthesis:</strong> Restructuring how it thinks</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">→</span>
              <span><strong>Code-Structured:</strong> Systematic validation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">→</span>
              <span><strong>Hybrid:</strong> Combined approach with self-review</span>
            </li>
          </ul>
        </div>
      </div>

      {/* First Principles Questions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-6 mt-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Info className="w-6 h-6 text-blue-600" />
          First Principles: Questions to Ask
        </h3>
        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold mt-0.5">?</span>
              <span><strong>Is this clear?</strong> Can users easily understand what they're seeing?</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold mt-0.5">?</span>
              <span><strong>Is this helpful?</strong> Does it add value to their understanding?</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold mt-0.5">?</span>
              <span><strong>Is this relevant?</strong> Does it relate to what they asked?</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold mt-0.5">?</span>
              <span><strong>Does this improve the response?</strong> Is the experience better with this visible?</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold mt-0.5">?</span>
              <span><strong>Would the answer alone be sufficient?</strong> Or does showing reasoning add necessary context?</span>
            </li>
          </ul>
        </div>
        <p className="text-sm text-slate-600 mt-3 italic">
          These questions guide how UX can potentially shape, structure, or selectively expose Chain of Thought. 
          Secondary considerations (like security and performance) flow from these core UX principles.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-300 rounded-lg p-5 mt-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-900 mb-1">Demo Disclaimer</h4>
            <p className="text-sm text-amber-800">
              <strong>All data and AI responses in this demonstration are simulated for educational purposes only.</strong> No real user data, proprietary information, or confidential business data was used. All financial figures are fictional examples created to illustrate different Chain of Thought approaches.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Query Synthesis in Practice Page
  const renderSynthesisPractice = () => (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Query Synthesis in Practice</h1>
        <p className="text-lg text-slate-600">Comparing outputs from different instruction approaches</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-900">
          <Info className="w-4 h-4 inline mr-2" />
          Both approaches from page 5 produce structured, focused CoT - but with different organizational styles. 
          Notice how both avoid meta-reasoning and stay data-focused.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Natural Language Result */}
        <div className="bg-white rounded-lg shadow-sm border-2 border-indigo-300 overflow-hidden">
          <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-200">
            <h3 className="font-semibold text-slate-900">Natural Language Output</h3>
            <p className="text-xs text-slate-600 mt-1">Step-by-step narrative format</p>
          </div>
          
          <div className="px-4 py-4 text-sm">
            <div className="bg-indigo-50 rounded p-3 mb-3">
              <div className="text-slate-800 space-y-2 text-xs">
                <p><strong>Step 1 - What changed:</strong></p>
                <p className="ml-3">Marketing: Q2 $12,000 → Q3 $13,400 (+$1,400)</p>
                <p className="ml-3">Freight: Q2 $2,100 → Q3 $2,600 (+$500)</p>
                <p className="ml-3">Travel: Q2 $8,000 → Q3 $8,650 (+$650)</p>
                
                <p className="mt-2"><strong>Step 2 - Impact:</strong></p>
                <p className="ml-3">Total increase: $2,650 (9.4%)</p>
                
                <p className="mt-2"><strong>Step 3 - Ranked drivers:</strong></p>
                <p className="ml-3">1. Marketing (largest absolute)</p>
                <p className="ml-3">2. Freight (highest %)</p>
              </div>
            </div>
            
            <div className="text-xs text-slate-600 space-y-1">
              <p><strong className="text-indigo-900">Characteristics:</strong></p>
              <ul className="ml-4">
                <li>• Follows logical progression</li>
                <li>• Easy to read sequentially</li>
                <li>• Flexible structure</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Field-Labeled Result */}
        <div className="bg-white rounded-lg shadow-sm border-2 border-purple-300 overflow-hidden">
          <div className="bg-purple-50 px-4 py-3 border-b border-purple-200">
            <h3 className="font-semibold text-slate-900">Field-Labeled Output</h3>
            <p className="text-xs text-slate-600 mt-1">Structured with consistent fields</p>
          </div>
          
          <div className="px-4 py-4 text-sm">
            <div className="bg-purple-50 rounded p-3 mb-3">
              <div className="text-slate-800 space-y-2 text-xs">
                <p><strong className="text-purple-700">Process:</strong> Q2 to Q3 expense comparison</p>
                <p><strong className="text-purple-700">Accounting Method:</strong> Period-over-period delta</p>
                <p><strong className="text-purple-700">Key Drivers:</strong></p>
                <p className="ml-3">• Marketing: +$1,400 (11.7%)</p>
                <p className="ml-3">• Freight: +$500 (23.8%)</p>
                <p className="ml-3">• Travel: +$650 (8.1%)</p>
                <p><strong className="text-purple-700">Patterns of Note:</strong></p>
                <p className="ml-3">Freight highest %, Marketing largest absolute</p>
              </div>
            </div>
            
            <div className="text-xs text-slate-600 space-y-1">
              <p><strong className="text-purple-900">Characteristics:</strong></p>
              <ul className="ml-4">
                <li>• Scannable labeled sections</li>
                <li>• Consistent field placement</li>
                <li>• Easy to find specific info</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Answers comparison */}
      <div className="bg-white border-2 border-green-400 rounded-lg p-6 mt-6">
        <h4 className="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          The Answers - Similar Quality, Different Structure
        </h4>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-xs font-semibold text-indigo-700 mb-2">From Natural Language Approach:</div>
            <div className="bg-indigo-50 border border-indigo-200 rounded p-3 text-sm text-slate-800">
              <p>Your Q2 to Q3 expenses increased 9.4% (total: $28,100 → $30,750). The main drivers are Marketing (+$1,400, 11.7%), Freight (+$500, 23.8%), and Travel (+$650, 8.1%). This appears to reflect business growth rather than cost control issues.</p>
            </div>
          </div>
          
          <div>
            <div className="text-xs font-semibold text-purple-700 mb-2">From Field-Labeled Approach:</div>
            <div className="bg-purple-50 border border-purple-200 rounded p-3 text-sm text-slate-800">
              <p>Total expenses increased $2,650 from $28,100 to $30,750 (9.4% growth). Key drivers: Marketing +$1,400 (11.7%), Freight +$500 (23.8%), Travel +$650 (8.1%). The increase is consistent with planned business expansion.</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 border-2 border-slate-300 rounded-lg p-4">
          <h5 className="text-sm font-semibold text-slate-900 mb-3">Overall Assessment</h5>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-3 border border-green-300">
              <h6 className="text-xs font-semibold text-green-700 mb-2">✓ What We've Solved:</h6>
              <ul className="text-xs text-slate-700 space-y-1 ml-4">
                <li>✓ Eliminated meta-reasoning and process narration</li>
                <li>✓ Removed technical jargon and system internals</li>
                <li>✓ Created clear, logical structure</li>
                <li>✓ Made thinking verifiable and scannable</li>
                <li>✓ Answer quality maintained (sometimes improved)</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-3 border border-orange-300">
              <h6 className="text-xs font-semibold text-orange-700 mb-2">⚠️ What Could Still Improve:</h6>
              <ul className="text-xs text-slate-700 space-y-1 ml-4">
                <li>→ Answer accuracy could be higher with review step</li>
                <li>→ Numbers could be double-checked systematically</li>
                <li>→ Insights could be more refined/polished</li>
                <li>→ For production: need validation & quality gates</li>
                <li>→ Extended thinking might catch edge cases better</li>
              </ul>
            </div>
          </div>
          
          <p className="text-xs text-slate-600 mt-3 italic bg-white rounded p-2 border border-slate-300">
            Query synthesis is a major improvement and requires no engineering. But for production systems with higher quality bars, 
            the Hybrid approach adds self-review and refinement...
          </p>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-5 mt-6">
        <h4 className="font-semibold text-green-900 mb-3">Key Observations</h4>
        <div className="grid grid-cols-3 gap-4 text-xs text-slate-700">
          <div>
            <strong className="text-green-800">Both Eliminate:</strong>
            <ul className="mt-1 ml-4 space-y-0.5">
              <li>✓ Meta-reasoning</li>
              <li>✓ Process narration</li>
              <li>✓ Technical jargon</li>
              <li>✓ System internals</li>
            </ul>
          </div>
          <div>
            <strong className="text-green-800">Both Provide:</strong>
            <ul className="mt-1 ml-4 space-y-0.5">
              <li>✓ Data-focused thinking</li>
              <li>✓ Clear analytical structure</li>
              <li>✓ Actionable insights</li>
              <li>✓ Professional presentation</li>
            </ul>
          </div>
          <div>
            <strong className="text-green-800">UX Owns This:</strong>
            <ul className="mt-1 ml-4 space-y-0.5">
              <li>✓ No engineering required</li>
              <li>✓ Content designer-driven</li>
              <li>✓ Rapid iteration possible</li>
              <li>✓ Full control over structure</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <p className="text-sm text-blue-900">
          <ArrowRight className="w-4 h-4 inline mr-2" />
          <strong>What's Next:</strong> Query synthesis is powerful and UX-owned. But for production systems that need even more sophistication, 
          there's a hybrid approach where Engineering and UX collaborate on extended thinking with self-review...
        </p>
      </div>
    </div>
  );

  // Query Synthesis Page
  const renderSynthesisPlayground = () => (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Query Synthesis</h1>
        <p className="text-lg text-slate-600">UX Tools Beyond Voice & Tone</p>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4 mb-6">
        <p className="text-sm text-green-900 mb-2">
          <CheckCircle className="w-5 h-5 inline mr-2" />
          <strong>Can we do better than voice adjustments? Yes!</strong> Instead of just changing how the CoT sounds, we can restructure <em>how</em> the model thinks about the question.
        </p>
        <p className="text-xs text-green-800">
          Here are two examples of query synthesis approaches. There are many other ways to structure thinking - the point is that UX has numerous levers and tools beyond just finessing tone.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Natural Language Approach */}
        <div className="bg-white rounded-lg shadow-sm border-2 border-indigo-300 overflow-hidden">
          <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-200">
            <h3 className="font-semibold text-slate-900">Natural Language Instructions</h3>
            <p className="text-xs text-slate-600 mt-1">Conversational approach - familiar to UX/content teams</p>
          </div>
          
          <div className="px-4 py-4">
            <h4 className="text-xs font-semibold text-slate-700 mb-2">Instruction Template (with typical UX preamble):</h4>
            <div className="bg-white border border-slate-300 rounded p-3 text-xs mb-4">
              <div className="text-slate-700 space-y-2 leading-relaxed">
                <p><strong>Role:</strong> You are a financial analyst helping users understand their expense data.</p>
                
                <p><strong>Task:</strong> Analyze the expense data in a structured way that focuses on insights, not process narration.</p>
                
                <p><strong>Approach:</strong> Think through the analysis in three focused steps:</p>
                <div className="ml-4 space-y-1 mt-1">
                  <p>1. Identify what changed (category and amounts)</p>
                  <p>2. Calculate the impact (percentages and totals)</p>
                  <p>3. Rank the drivers (which matters most)</p>
                </div>
                
                <p className="mt-2"><strong>Constraints:</strong> Keep thinking concise. Focus on data, not process description.</p>
              </div>
            </div>

            <h4 className="text-xs font-semibold text-slate-700 mb-2">Why Choose This Approach:</h4>
            <ul className="text-xs text-slate-700 space-y-1 ml-4 mb-4">
              <li>✓ When you want general analytical structure without rigid fields</li>
              <li>✓ When content designers need flexibility in how thinking flows</li>
              <li>✓ Most familiar to UX teams used to writing conversational prompts</li>
              <li>✓ Good for varied questions where exact fields might change</li>
            </ul>

            <h4 className="text-xs font-semibold text-slate-700 mb-2">Example CoT Output:</h4>
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs">
              <div className="text-slate-800 space-y-2">
                <p><strong>Step 1 - What changed:</strong></p>
                <p className="ml-3 text-slate-700">Marketing: Q2 $12,000 → Q3 $13,400 (+$1,400)</p>
                <p className="ml-3 text-slate-700">Freight: Q2 $2,100 → Q3 $2,600 (+$500)</p>
                <p className="ml-3 text-slate-700">Travel: Q2 $8,000 → Q3 $8,650 (+$650)</p>
                
                <p className="mt-2"><strong>Step 2 - Calculate impact:</strong></p>
                <p className="ml-3 text-slate-700">Total increase: $2,650 (9.4%)</p>
                <p className="ml-3 text-slate-700">Marketing: 11.7% | Freight: 23.8% | Travel: 8.1%</p>
                
                <p className="mt-2"><strong>Step 3 - Rank drivers:</strong></p>
                <p className="ml-3 text-slate-700">1. Marketing (largest absolute: $1,400)</p>
                <p className="ml-3 text-slate-700">2. Freight (highest %: 23.8%)</p>
                <p className="ml-3 text-slate-700">3. Travel (moderate growth: 8.1%)</p>
              </div>
            </div>
          </div>
        </div>

        {/* JSON Schema Approach */}
        <div className="bg-white rounded-lg shadow-sm border-2 border-purple-300 overflow-hidden">
          <div className="bg-purple-50 px-4 py-3 border-b border-purple-200">
            <h3 className="font-semibold text-slate-900">Field-Labeled Schema Instructions</h3>
            <p className="text-xs text-slate-600 mt-1">For content designers who want specific, consistent fields</p>
          </div>
          
          <div className="px-4 py-4">
            <h4 className="text-xs font-semibold text-slate-700 mb-2">Instruction Template (with typical UX preamble):</h4>
            <div className="bg-white border border-slate-300 rounded p-3 text-xs mb-4">
              <div className="text-slate-700 space-y-2 leading-relaxed">
                <p><strong>Role:</strong> You are an expert financial analyst providing structured expense analysis.</p>
                
                <p><strong>Task:</strong> Analyze the expense data and user's question. Provide reasoning and insights organized into specific labeled fields.</p>
                
                <p><strong>Output Format:</strong> You MUST structure your response using the fields defined in the JSON schema below. This ensures consistency and makes key information easy to find.</p>
                
                <p><strong>JSON Schema:</strong> Your response must conform to this structure:</p>
                <div className="ml-2 mt-2 bg-slate-50 border border-slate-300 rounded p-3 font-mono text-xs">
                  <div className="text-slate-700 space-y-0.5">
                    <p>&#123;</p>
                    <p className="ml-3">"expense_analysis": &#123;</p>
                    <p className="ml-6">"thinking": &#123;</p>
                    <p className="ml-9"><strong className="text-purple-700">"process"</strong>: "(string) What comparison you're doing",</p>
                    <p className="ml-9"><strong className="text-purple-700">"accounting_method"</strong>: "(string) How you're analyzing"</p>
                    <p className="ml-6">&#125;,</p>
                    <p className="ml-6">"insights": &#123;</p>
                    <p className="ml-9"><strong className="text-purple-700">"key_drivers"</strong>: [</p>
                    <p className="ml-12">&#123; "category": "string", "delta": "number", "pct": "number" &#125;</p>
                    <p className="ml-9">],</p>
                    <p className="ml-9"><strong className="text-purple-700">"patterns_of_note"</strong>: ["(array) Trends and insights"]</p>
                    <p className="ml-6">&#125;</p>
                    <p className="ml-3">&#125;</p>
                    <p>&#125;</p>
                  </div>
                </div>
                
                <p className="mt-2"><strong>Constraints:</strong> Focus on data and insights. Do not narrate your process or include meta-commentary.</p>
              </div>
            </div>

            <h4 className="text-xs font-semibold text-slate-700 mb-2">Why UX Teams Choose This:</h4>
            <ul className="text-xs text-slate-700 space-y-1 ml-4 mb-4">
              <li>✓ <strong>Easy iteration:</strong> Change "process" to "methodology"? Just edit the field name - no need to refactor entire instructions</li>
              <li>✓ <strong>Modular flexibility:</strong> Add/remove fields without rewriting the whole prompt</li>
              <li>✓ <strong>Guaranteed consistency:</strong> "Key Drivers" always appears - never buried in narrative</li>
              <li>✓ <strong>Scannable for users:</strong> Labeled sections help users find what they need quickly</li>
            </ul>
            
            <div className="bg-purple-50 border border-purple-300 rounded p-2 text-xs mt-3">
              <p className="text-purple-900">
                <strong>UX Advantage:</strong> Instead of rewriting paragraphs of instructions, you just update field definitions. 
                Much faster to iterate and maintain over time.
              </p>
            </div>

            <h4 className="text-xs font-semibold text-slate-700 mb-2">Example CoT Output:</h4>
            <div className="bg-purple-50 border border-purple-200 rounded p-3 text-sm">
              <div className="text-slate-800 space-y-2">
                <p><strong className="text-purple-700">Process:</strong> Comparing Q2 to Q3 expenses</p>
                <p><strong className="text-purple-700">Accounting Method:</strong> Period-over-period delta analysis</p>
                <p className="mt-2"><strong className="text-purple-700">Key Drivers:</strong></p>
                <p className="ml-3 text-xs">• Marketing: +$1,400 (11.7% increase)</p>
                <p className="ml-3 text-xs">• Freight: +$500 (23.8% increase)</p>
                <p className="ml-3 text-xs">• Travel: +$650 (8.1% increase)</p>
                <p className="mt-2"><strong className="text-purple-700">Patterns of Note:</strong></p>
                <p className="ml-3 text-xs">Freight shows highest % growth</p>
                <p className="ml-3 text-xs">Marketing shows largest absolute impact</p>
                <p className="ml-3 text-xs">Overall 9.4% increase across categories</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mt-6">
        <h4 className="text-sm font-semibold text-indigo-900 mb-2 flex items-center gap-2">
          <ArrowRight className="w-5 h-5" />
          Notice the Difference
        </h4>
        <div className="grid grid-cols-2 gap-4 text-xs text-slate-700">
          <div>
            <strong className="text-indigo-900">Natural Language:</strong>
            <p className="mt-1">Step-by-step instructions. Flexible flow, good for varied questions. To iterate: rewrite the step descriptions.</p>
          </div>
          <div>
            <strong className="text-purple-900">Field-Labeled Schema:</strong>
            <p className="mt-1">Specific labeled fields. Guaranteed structure, easy to iterate. To change: just update field names/descriptions - no full rewrite needed.</p>
          </div>
        </div>
        <p className="text-xs text-slate-700 mt-3 bg-white rounded p-2 border border-indigo-300">
          <strong>For Content Designers:</strong> Both eliminate meta-reasoning and structure thinking. The schema approach gives you <strong>modular control</strong> - 
          swap out "Process" for "Methodology", add "Risk Factors" field, remove "Patterns" - all without touching the rest of the instruction. 
          This modularity makes it much easier to iterate and maintain.
        </p>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-lg p-5 mt-6">
        <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          UX Control Beyond Tone
        </h4>
        <p className="text-sm text-slate-700 mb-3">
          Query synthesis demonstrates that UX has levers and dials that go far beyond voice and tone adjustments:
        </p>
        <div className="grid grid-cols-2 gap-4 text-sm text-slate-700">
          <div>
            <strong className="text-slate-900">Structural Control:</strong>
            <ul className="mt-2 ml-4 space-y-1 text-xs">
              <li>• Define analytical steps vs. free-form thinking</li>
              <li>• Specify which fields must appear and in what order</li>
              <li>• Control focus (data vs. process narration)</li>
              <li>• Shape reasoning patterns, not just language style</li>
            </ul>
          </div>
          <div>
            <strong className="text-slate-900">Potential Impact:</strong>
            <ul className="mt-2 ml-4 space-y-1 text-xs">
              <li>• Can improve accuracy by keeping model focused</li>
              <li>• More consistent outputs across queries</li>
              <li>• Systematically surfaces key insights</li>
              <li>• Reduces hallucinations from wandering reasoning</li>
            </ul>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-700 bg-white rounded p-2 border border-green-300">
          <strong>Remember:</strong> These are just two approaches among many possibilities. The key insight is that UX can design how models think, not just how they sound. 
          Other options include XML-like markup, hierarchical outlines, constraint-based instructions, and more.
        </p>
      </div>
    </div>
  );

  // Render Voice & Tone shaped example
  const renderVoiceToneExample = () => (
    <div className="bg-white rounded-lg shadow-sm border-2 border-yellow-300 overflow-hidden">
      <div className="bg-yellow-50 px-6 py-4 border-b border-yellow-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Voice & Tone Shaped CoT</h3>
            <p className="text-sm text-slate-600 mt-1">
              Friendlier language, but structural issues remain
            </p>
          </div>
          <span className="px-3 py-1 bg-yellow-600 text-white text-xs font-medium rounded-full">
            PARTIAL FIX
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Left: Example */}
        <div className="col-span-2 px-6 py-4 bg-slate-50">
          <h4 className="text-xs font-semibold text-slate-600 mb-3">THINKING (CPA explaining to a colleague)</h4>
          <div className="text-sm text-slate-800 space-y-3 leading-relaxed">
            <p>
              <strong>Understanding what you're asking</strong>
            </p>
            <p>
              You want to see gross profit broken down by month for last year. Let me explain how I'm thinking about this. Since you specified "last year," I'll pull data for 2024. Your question is clear, so I don't need to reinterpret it.
            </p>

            <p>
              <strong>Selecting the right report</strong>
            </p>
            <p>
              For gross profit analysis, I'll use the Profit and Loss report - that's where the profitability metrics live. I can slice that by month and filter to your time period. There are some other data points available, but they're not relevant for this high-level financial view, so I'll focus just on what you asked for.
            </p>

            <p>
              <strong>Preparing the analysis</strong>
            </p>
            <p>
              I'm setting up a monthly summary of Profit and Loss for last year. I'll go through the gross profit entries, pull out the amount for each month, make sure the formatting is consistent for display purposes, and verify the numbers are being handled correctly. The process involves identifying the relevant data, filtering it, calculating the totals, and organizing it in a way that's easy to understand.
            </p>

            <p className="text-xs text-slate-600 italic bg-yellow-100 border-l-4 border-yellow-500 pl-3 py-2">
              ⚠️ Notice: Still verbose and meta-narrative heavy - describing the process instead of just doing it
            </p>
          </div>

          <div className="mt-4 px-6 py-4 border-l-4 border-green-400 bg-white">
            <div className="text-xs text-green-700 font-medium mb-2">
              ↓ Answer is still fine, but roughly the same as before ↓
            </div>
            <div className="text-sm text-slate-800">
              <p className="font-semibold mb-2">Gross Profit Analysis by Month for Last Year</p>
              <p className="mb-2">
                Total expenses increased $2,650 from $28,100 to $30,750 (9.4% growth). Key drivers: Marketing +$1,400 (11.7%), Freight +$500 (23.8%), Travel +$650 (8.1%). 
                The increase appears consistent with business growth rather than isolated anomalies.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Analysis callout */}
        <div className="bg-amber-50 px-4 py-4 border-l-2 border-amber-300">
          <div className="sticky top-4">
            <h4 className="text-sm font-semibold text-amber-900 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              What Improved
            </h4>
            <div className="space-y-3 text-xs text-amber-900">
              <div className="bg-white rounded p-2 border border-amber-200">
                <strong className="text-green-700">✓ Better:</strong>
                <ul className="mt-1 ml-4 space-y-1 text-slate-700">
                  <li>Plain language (no jargon)</li>
                  <li>Professional CPA tone</li>
                  <li>More accessible</li>
                </ul>
              </div>
              
              <div className="bg-white rounded p-2 border border-amber-200">
                <strong className="text-orange-700">⚠️ Still Present:</strong>
                <ul className="mt-1 ml-4 space-y-1 text-slate-700">
                  <li>Meta-narrative ("Let me explain...")</li>
                  <li>Process description instead of analysis</li>
                  <li>Mentions report selection logic</li>
                  <li>Verbose narration of steps</li>
                </ul>
              </div>

              <div className="bg-white rounded p-2 border border-slate-300">
                <strong className="text-slate-900">Answer Quality:</strong>
                <p className="mt-1 text-slate-700">
                  Roughly the same as Raw CoT - tonal adjustments alone don't improve accuracy or insights.
                </p>
              </div>

              <div className="bg-white rounded p-2 border border-orange-300">
                <strong className="text-slate-900">The Limitation:</strong>
                <p className="mt-1 text-slate-700">
                  Voice & tone changes make it more readable, but the CoT is still verbose and process-focused rather than data-focused. Tonal adjustments alone have limited impact - we need structural changes to thinking, not just friendlier language.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render annotated Raw CoT example with interactive hotspots
  const renderAnnotatedRawCoT = () => (
    <div className="bg-white rounded-lg shadow-sm border-2 border-orange-300 overflow-hidden">
      <div className="bg-orange-50 px-6 py-4 border-b border-orange-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Raw CoT Example</h3>
            <p className="text-sm text-slate-600 mt-1">
              Hover over underlined text to see specific issues
            </p>
          </div>
          <span className="px-3 py-1 bg-orange-600 text-white text-xs font-medium rounded-full">
            CURRENT STATE
          </span>
        </div>
        
        {/* Color legend */}
        <div className="mt-3 flex items-center gap-3 text-xs">
          <span className="font-semibold text-slate-600">Issue Types:</span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-400 rounded"></span>
            <span className="text-slate-700">Security Risk</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-orange-400 rounded"></span>
            <span className="text-slate-700">Architecture Leak</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-yellow-400 rounded"></span>
            <span className="text-slate-700">Technical Jargon</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-amber-400 rounded"></span>
            <span className="text-slate-700">Fluff/Noise</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Left: Annotated thinking section */}
        <div className="col-span-2 px-6 py-4 bg-slate-50">
          <h4 className="text-xs font-semibold text-slate-600 mb-3">THINKING (Exposed to Users)</h4>
          <div className="text-sm text-slate-800 space-y-3 leading-relaxed">
          <p>
            <strong>Analyzing your question</strong>
          </p>
          <p>
            The question is <Hotspot hotspotKey="clear_selfcontained">clear and self-contained</Hotspot>. The <Hotspot hotspotKey="instruction_set">instruction set</Hotspot> <Hotspot hotspotKey="date_macro">date_macro</Hotspot> is updated from <Hotspot hotspotKey="this_year_to_date">THIS_YEAR_TO_DATE to LAST_YEAR</Hotspot> because the user 
            explicitly requested "last year" in the query. The <Hotspot hotspotKey="question_unchanged">question text remains unchanged</Hotspot> as the time period "last year" is already explicitly stated within the original query, making it <Hotspot hotspotKey="selfcontained_clear">self-contained and clear</Hotspot> for <Hotspot hotspotKey="downstream_processing">downstream processing</Hotspot>.
          </p>

          <p>
            <strong>Interpreting your question</strong>
          </p>
          <p>
            The user's question asks for 'gross profit by month for last year', which directly relates to a company's profitability. The <Hotspot hotspotKey="profit_loss_report">'Profit and Loss' report is the most suitable dataset</Hotspot> for this type of query as it provides 
            detailed profitability data, including gross profit. The report can be customized to show data by month for a specified period, such as 'Last Year'. The <Hotspot hotspotKey="resolved_entities">resolved entities (ITEM_NAME, PROJECT_NAME)</Hotspot> are not relevant to this general 
            financial performance question and <Hotspot hotspotKey="ignored">have been ignored</Hotspot>.
          </p>

          <p>
            <strong>Customizing your Profit and Loss report</strong>
          </p>
          <p>
            <Hotspot hotspotKey="summary_report">This summary report analyzes</Hotspot> Profit and Loss, grouped by Month, for last year. <Hotspot hotspotKey="i_analyzed">I analyzed</Hotspot> the gross profit by month for last year using the available financial data. First, <Hotspot hotspotKey="i_identified">I identified all entries</Hotspot> related to 'Gross Profit'. Then, I extracted 
            the gross profit amount for each month. To ensure the data was clearly presented for visualization, I <Hotspot hotspotKey="formatted_month">formatted the month information</Hotspot> and confirmed that the profit values were <Hotspot hotspotKey="numerical_amounts">correctly interpreted as numerical amounts</Hotspot>. The <Hotspot hotspotKey="analysis_chain">analysis chain focuses on</Hotspot> extracting, filtering, 
            summing, and presenting the total travel-related expenses.
          </p>
          </div>

          {/* The actual answer */}
          <div className="mt-4 px-6 py-4 border-l-4 border-green-400 bg-white">
            <div className="text-xs text-green-700 font-medium mb-2">
              ↓ The actual answer (this part is fine!) ↓
            </div>
            <div className="text-sm text-slate-800">
              <p className="font-semibold mb-2">Gross Profit Analysis by Month for Last Year</p>
              <p className="mb-2">
                Total expenses increased $2,650 from $28,100 to $30,750 (9.4% growth). Key drivers: Marketing +$1,400 (11.7%), Freight +$500 (23.8%), Travel +$650 (8.1%). 
                The increase appears consistent with business growth rather than isolated anomalies.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Analysis sidebar */}
        <div className="bg-orange-50 px-4 py-4 border-l-2 border-orange-300">
          <div className="sticky top-4">
            <h4 className="text-sm font-semibold text-orange-900 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Issues Found
            </h4>
            <div className="space-y-3 text-xs">
              <div className="bg-white rounded p-2 border border-red-300">
                <strong className="text-red-700">🚨 Security (4 items)</strong>
                <p className="mt-1 text-slate-700">
                  Exposes instruction sets, macros, entity resolution, and config details
                </p>
              </div>

              <div className="bg-white rounded p-2 border border-orange-300">
                <strong className="text-orange-700">⚠️ Architecture (5 items)</strong>
                <p className="mt-1 text-slate-700">
                  Reveals processing pipelines, decision logic, and system internals
                </p>
              </div>

              <div className="bg-white rounded p-2 border border-yellow-300">
                <strong className="text-yellow-700">⚙️ Jargon (3 items)</strong>
                <p className="mt-1 text-slate-700">
                  Dataset selection, implementation details, technical validation
                </p>
              </div>

              <div className="bg-white rounded p-2 border border-amber-300">
                <strong className="text-amber-700">💨 Noise (6 items)</strong>
                <p className="mt-1 text-slate-700">
                  Meta-commentary, process narration, redundant preambles
                </p>
              </div>

              <div className="bg-white rounded p-2 border border-slate-300 mt-4">
                <strong className="text-slate-900">The Opportunity:</strong>
                <p className="mt-1 text-slate-700">
                  The answer quality is solid. The challenge is making the thinking layer work <em>for</em> users rather than overwhelming them.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );

  // What is CoT page
  const renderWhatIsCoTPage = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          What is Chain of Thought?
        </h1>
        <p className="text-lg text-slate-600">
          Understanding the model's internal reasoning process
        </p>
      </div>

      {/* Core concept */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-4">The Basics</h3>
        <p className="text-slate-700 mb-4">
          When AI models process complex questions, they engage in <strong>internal reasoning</strong> before producing 
          a final answer. This internal reasoning is called <strong>Chain of Thought (CoT)</strong>.
        </p>

        {/* Key provocation */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-300 rounded-lg p-4 mb-4">
          <p className="text-sm text-slate-800 leading-relaxed">
            CoT can build <strong>trust and confidence</strong> in a response—but it's often misperceived as simply 
            <em>"an illusion of labor."</em> This perception isn't entirely unfounded, yet it overlooks genuine utility. 
            <strong className="text-indigo-900">The key for UX:</strong> employ methods that crystallize CoT's value 
            while filtering out elements that don't serve users.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <div className="text-sm text-slate-700">
            <strong>Example Flow:</strong>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex-1 bg-white p-3 rounded border border-slate-200">
                User Question: "Why did expenses increase?"
              </div>
              <ArrowRight className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="flex-1 bg-yellow-50 p-3 rounded border border-yellow-300">
                <div className="text-xs font-semibold text-yellow-900 mb-1">CoT (Thinking)</div>
                <div className="text-xs text-slate-600">Analyzing data... comparing periods... identifying patterns...</div>
              </div>
              <ArrowRight className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="flex-1 bg-green-50 p-3 rounded border border-green-300">
                <div className="text-xs font-semibold text-green-900 mb-1">Final Answer</div>
                <div className="text-xs text-slate-600">Expenses increased 9.4% due to marketing...</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What CoT Does - Functional Benefits */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-4">Why Chain of Thought Matters</h3>
        <p className="text-sm text-slate-700 mb-4">
          CoT provides visibility into the model's reasoning process. Here's what it enables:
        </p>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 bg-slate-50">
                <th className="text-left py-2 px-3 font-semibold">Function</th>
                <th className="text-left py-2 px-3 font-semibold">What It Provides</th>
                <th className="text-left py-2 px-3 font-semibold">Without CoT</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              <tr className="border-b border-slate-200">
                <td className="py-2 px-3 font-medium text-slate-800">Disambiguation</td>
                <td className="py-2 px-3 text-slate-700">Shows how the model resolved ambiguity (e.g., "last year" → specific date range)</td>
                <td className="py-2 px-3 text-slate-600">Ambiguous questions may misfire silently</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 px-3 font-medium text-slate-800">Transparency</td>
                <td className="py-2 px-3 text-slate-700">Reveals why the model made specific choices (dataset selection, entity filtering)</td>
                <td className="py-2 px-3 text-slate-600">Black-box behavior; trust becomes harder to establish</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 px-3 font-medium text-slate-800">Debuggability</td>
                <td className="py-2 px-3 text-slate-700">Enables tracing reasoning when errors occur</td>
                <td className="py-2 px-3 text-slate-600">Can only debug system mechanics, not semantic logic</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 px-3 font-medium text-slate-800">Auditability</td>
                <td className="py-2 px-3 text-slate-700">Allows validation of the reasoning process and decisions</td>
                <td className="py-2 px-3 text-slate-600">Can't verify if the model understood the question correctly</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* The key question */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-amber-600" />
          Understanding "Illusion of Labor"
        </h3>
        <p className="text-sm text-slate-700 mb-4">
          Some CoT provides genuine value, while some feels like theatrical performance. Here's how to tell the difference:
        </p>
        
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm border-collapse bg-white">
            <thead>
              <tr className="border-b-2 border-amber-300 bg-amber-50">
                <th className="text-left py-2 px-3 font-semibold">Type of CoT</th>
                <th className="text-left py-2 px-3 font-semibold">Real Function</th>
                <th className="text-left py-2 px-3 font-semibold">Illusion Risk</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              <tr className="border-b border-amber-200">
                <td className="py-2 px-3 font-medium">State-setting<br/><span className="text-slate-600">"I updated the macro..."</span></td>
                <td className="py-2 px-3 text-slate-700">Explains variable translation</td>
                <td className="py-2 px-3"><span className="text-green-700 font-semibold">✓ Useful</span></td>
              </tr>
              <tr className="border-b border-amber-200">
                <td className="py-2 px-3 font-medium">Data Mapping<br/><span className="text-slate-600">"I'll use P&L report..."</span></td>
                <td className="py-2 px-3 text-slate-700">Shows dataset reasoning</td>
                <td className="py-2 px-3"><span className="text-green-700 font-semibold">✓ Useful</span></td>
              </tr>
              <tr className="border-b border-amber-200">
                <td className="py-2 px-3 font-medium">Meta-narration<br/><span className="text-slate-600">"I am analyzing..."</span></td>
                <td className="py-2 px-3 text-slate-700">Adds transparency but not reasoning</td>
                <td className="py-2 px-3"><span className="text-yellow-700 font-semibold">⚠️ Mild illusion</span></td>
              </tr>
              <tr className="border-b border-amber-200">
                <td className="py-2 px-3 font-medium">Verbose self-talk<br/><span className="text-slate-600">"Let's think step by step..."</span></td>
                <td className="py-2 px-3 text-slate-700">Fills tokens; no new logic</td>
                <td className="py-2 px-3"><span className="text-red-700 font-semibold">✗ Pure illusion</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-white border border-amber-300 rounded-lg p-3">
          <p className="text-sm text-amber-900">
            <strong>The Sweet Spot:</strong> CoT that exposes <em>decisions</em>, not thought theatrics. 
            The challenge is designing which parts to show and how to structure them for different audiences.
          </p>
        </div>
      </div>

      {/* Trace vs CoT comparison */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-4">System Trace vs. Reasoning Trace</h3>
        <p className="text-sm text-slate-700 mb-4">
          Understanding what you can and can't debug without CoT:
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-slate-300">
            <h4 className="font-semibold text-slate-900 mb-2 text-sm">Without CoT (System Trace Only)</h4>
            <div className="text-xs font-mono bg-slate-50 p-3 rounded border border-slate-200 mb-3">
              <div className="space-y-1 text-slate-700">
                <div>→ Input received: "show gross profit..."</div>
                <div>→ Model call: claude-sonnet</div>
                <div>→ Latency: 1.2s | Tokens: 820</div>
                <div>→ Retrieval: dataset=ProfitLoss</div>
                <div>→ Output rendered</div>
              </div>
            </div>
            <div className="text-xs text-slate-700 space-y-1">
              <p className="font-medium text-slate-800 mb-1">What you can see:</p>
              <ul className="ml-4 space-y-0.5">
                <li>✓ System executed successfully</li>
                <li>✓ Which dataset was queried</li>
              </ul>
              <p className="font-medium text-slate-800 mt-2 mb-1">What you can't see:</p>
              <ul className="ml-4 space-y-0.5">
                <li>✗ Why that dataset was chosen</li>
                <li>✗ How "last year" was interpreted</li>
                <li>✗ What alternatives were considered</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-blue-300">
            <h4 className="font-semibold text-slate-900 mb-2 text-sm">With CoT (Reasoning Visible)</h4>
            <div className="text-xs bg-blue-50 p-3 rounded border border-blue-200 mb-3">
              <div className="space-y-2 text-slate-700">
                <div><strong>Analyzing:</strong> date_macro updated THIS_YEAR → LAST_YEAR</div>
                <div><strong>Interpreting:</strong> "gross profit" → P&L dataset</div>
                <div><strong>Customizing:</strong> Group by month, year=2024</div>
                <div><strong>Data:</strong> Jan-Mar=$0, Apr=$5.91...</div>
              </div>
            </div>
            <div className="text-xs text-slate-700 space-y-1">
              <p className="font-medium text-green-800 mb-1">Additional visibility:</p>
              <ul className="ml-4 space-y-0.5">
                <li>✓ Decisional logic is traceable</li>
                <li>✓ Can verify correct interpretation</li>
                <li>✓ Can catch reasoning errors</li>
                <li>✓ Can evaluate Model UX quality</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-4 bg-blue-100 border border-blue-300 rounded-lg p-3">
          <p className="text-xs text-blue-900">
            <strong>Key Insight:</strong> System traces show <em>what</em> happened. CoT shows <em>why</em> it happened. 
            You can debug execution without CoT, but you can't audit semantic reasoning or catch interpretation errors.
          </p>
        </div>

        <div className="mt-4 bg-red-50 border-2 border-red-300 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-900 mb-2">The Hidden Pitfall</p>
              <p className="text-xs text-red-800 mb-2">
                <strong>Scenario:</strong> Pipeline's green ✓, logs are clean ✓, API call succeeded ✓... but the model used "fiscal year" instead of "calendar year."
              </p>
              <p className="text-xs text-slate-700 mb-2">
                <strong>Engineering sees:</strong> Successful execution - nothing to flag<br/>
                <strong>UX sees:</strong> Clean output - looks fine<br/>
                <strong>User sees:</strong> Wrong answer (discovered after launch!) 😞
              </p>
              <p className="text-xs text-green-800 bg-green-50 border border-green-300 rounded p-2 mt-2">
                <strong>With CoT visible:</strong> Teams can catch semantic errors during development - 
                "Wait, why did it choose fiscal year?" - before users ever see them. This is why CoT visibility 
                (at least for the team) is valuable for quality assurance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* The design challenge */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-4">The Design Challenge</h3>
        <p className="text-sm text-slate-700 mb-4">
          CoT is valuable - the question is <strong>how to present it</strong>:
        </p>
        <div className="bg-white border border-green-300 rounded-lg p-4">
          <p className="text-sm font-semibold text-green-900 mb-3">
            Model UX decides: Which parts of reasoning deserve exposure, how to structure them, and who they're for.
          </p>
          <ul className="text-xs text-slate-700 space-y-2">
            <li>• <strong>For Engineers:</strong> Expose detailed reasoning for debugging and evaluation</li>
            <li>• <strong>For Users:</strong> Show curated insights that build trust without overwhelming</li>
            <li>• <strong>For Both:</strong> Structure thinking to be auditable, educational, and secure</li>
          </ul>
        </div>
        <p className="text-sm text-slate-700 mt-4">
          The following pages explore different strategies for shaping CoT - from raw exposure (current state) 
          through voice adjustments, to query synthesis and hybrid approaches.
        </p>
      </div>
    </div>
  );

  // Summary page
  const renderSummaryPage = () => (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Key Takeaways
        </h1>
        <p className="text-lg text-slate-600">
          Approaches to shaping Chain of Thought
        </p>
      </div>

      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-5 mb-6">
        <p className="text-sm text-blue-900">
          <Info className="w-5 h-5 inline mr-2" />
          <strong>Important:</strong> This presentation shows one hypothesis for approaching Chain of Thought design. 
          Other valid approaches and frameworks exist. The goal is to demonstrate UX's role in shaping model reasoning, not to prescribe the only solution.
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-4">💡 Key Takeaways</h3>
        <div className="space-y-4 text-sm text-slate-700">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">Start with First Principles:</strong> Ask "Is this clear? Helpful? Relevant?" 
              before worrying about security or performance. User-centered questions guide all decisions.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">Voice & Tone Has Limits:</strong> Friendlier language helps readability, 
              but doesn't address structural issues. Need query synthesis for deeper improvements.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">UX Has Many Tools:</strong> Natural language instructions, field-labeled schemas, 
              and other paradigms give content designers control over how models think - not just how they sound.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">Hybrid Requires Collaboration:</strong> Query synthesis is UX-owned. 
              Hybrid approaches need Eng to build infrastructure and UX to design the content. The handshake creates production-grade solutions.
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-4">Immediate Next Steps</h3>
        <div className="space-y-3 text-sm text-slate-700">
          <p><strong>1. Audit Current CoT:</strong> Review where raw thinking is currently exposed. Use the first principles questions (Is it clear? Helpful? Relevant?) to assess each instance.</p>
          <p><strong>2. Start with Quick Wins:</strong> Implement query synthesis for high-visibility features. No engineering required - content designers can do this today.</p>
          <p><strong>3. Document Your Schema:</strong> If using field-labeled approaches, document which fields matter to users and why. This becomes a reusable pattern.</p>
          <p><strong>4. Consider Hybrid for Critical Paths:</strong> For features where answer quality is paramount, explore Eng+UX collaboration on scratchpad approaches.</p>
          <p><strong>5. Measure Impact:</strong> Track user feedback, error rates, and trust signals to validate that CoT improvements are working.</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-lg p-5 mt-6">
        <h3 className="text-lg font-semibold text-amber-900 mb-3">Remember</h3>
        <p className="text-sm text-slate-700">
          This is one framework among many. The specific approaches (voice/tone, query synthesis, hybrid) are simply ways in which UX plays an important role in how models think, not just how they "sound" or communicate. Further brainstorming and discussion will help surface how context, users, and constraints will shape which specific techniques work best for us.
        </p>
      </div>
    </div>
  );

  // Render page based on current page
  const renderCurrentPage = () => {
    const page = PAGES[currentPage];

    if (page.id === 'intro') {
      return renderIntroPage();
    }

    if (page.id === 'what-is-cot') {
      return renderWhatIsCoTPage();
    }

    if (page.id === 'synthesis-playground') {
      return renderSynthesisPlayground();
    }

    if (page.id === 'synthesis-practice') {
      return renderSynthesisPractice();
    }

    if (page.id === 'summary') {
      return renderSummaryPage();
    }

    // For approach pages (raw, prompt, code, hybrid)
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">{page.title}</h1>
          <p className="text-lg text-slate-600">{page.subtitle}</p>
        </div>

        {/* Configuration Section */}
        {/* Some pages use static examples - no configuration needed */}
        {(page.approach === 'raw' || page.approach === 'voice' || page.id === 'synthesis-practice') ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <Info className="w-4 h-4 inline mr-2" />
              {page.approach === 'raw' 
                ? 'This page shows a static annotated example of Raw CoT. Hover over underlined text below to see specific issues.'
                : page.approach === 'voice'
                ? 'This page shows a static example demonstrating how voice & tone changes improve readability but miss deeper structural opportunities.'
                : 'This page shows static examples comparing the two instruction approaches from the previous page.'}
            </p>
          </div>
        ) : !results ? (
          // Full configuration for other approaches if no results yet
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select a Question
              </label>
              <select
                value={scenario}
                onChange={(e) => {
                  setScenario(e.target.value);
                  setQuestion(SCENARIOS[e.target.value].question);
                  setResults(null);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {Object.entries(SCENARIOS).map(([key, scenarioData]) => (
                  <option key={key} value={key}>
                    {scenarioData.question}
                  </option>
                ))}
              </select>
            </div>

            {/* Data Table */}
            {renderDataTable()}

            <button
              onClick={runAnalysis}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {loadingStep || "Generating responses..."}
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Run Analysis
                </>
              )}
            </button>

            {loading && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  <span className="text-blue-800 font-medium">Generating AI Responses</span>
                </div>
                <div className="text-sm text-blue-700">{loadingStep}</div>
                <div className="text-xs text-blue-600 mt-2">
                  This may take 10-15 seconds...
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <span className="text-red-800">{error}</span>
              </div>
            )}
          </div>
        ) : (
          // Compact view if results exist
          <div className="bg-white rounded-lg shadow-sm p-4 border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-xs text-slate-600 mb-1">Analyzing Question:</div>
                <div className="text-sm font-medium text-slate-900">{question}</div>
                <div className="text-xs text-slate-500 mt-1">
                  Using: {currentScenario.name}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setResults(null)}
                  className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  Change Question
                </button>
              </div>
            </div>
            
            {/* Collapsible data table */}
            <details className="mt-3">
              <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800">
                View data table
              </summary>
              <div className="mt-2">
                {renderDataTable()}
              </div>
            </details>
          </div>
        )}

        {/* Educational callout for Query Synthesis - before running */}
        {page.approach === 'instructed' && !results && (
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Zap className="w-6 h-6 text-blue-600" />
              What "Query Synthesis" Means
            </h3>
            <p className="text-sm text-slate-700 mb-4">
              <strong>The Breakthrough:</strong> Instead of just changing how the model <em>sounds</em>, we restructure how it <em>thinks</em>.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="font-semibold text-sm text-blue-900 mb-2 flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Query Synthesis
                </div>
                <p className="text-xs text-slate-700">
                  Transforms ambiguous user questions into structured internal tasks. Instead of letting the model wander, we give it a clear roadmap: 
                  <strong>"Step 1: Identify category. Step 2: Compare periods. Step 3: Rank drivers."</strong>
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="font-semibold text-sm text-blue-900 mb-2 flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Reasoning Scaffolding
                </div>
                <p className="text-xs text-slate-700">
                  Provides cognitive structure - not "be friendly" but "analyze systematically." 
                  Prevents meta-reasoning, reduces jargon, and focuses thinking on what matters.
                </p>
              </div>
            </div>

            <div className="bg-blue-100 border border-blue-300 rounded-lg p-3">
              <p className="text-xs text-blue-900">
                <strong>Why This Works:</strong> By shaping the reasoning process (not just the output style), we get CoT that's safer, 
                more structured, and genuinely useful - while maintaining the same answer quality.
              </p>
            </div>
          </div>
        )}

        {/* Model UX Playground - Hidden for now, can enable later */}
        {false && page.approach === 'instructed' && results && (
          <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  Model UX Playground
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Experiment with different prompt styles - see how changing instructions affects the response
                </p>
              </div>
              <button
                onClick={() => setPlaygroundOpen(!playgroundOpen)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
              >
                {playgroundOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {playgroundOpen ? 'Close' : 'Open'} Playground
              </button>
            </div>

            {playgroundOpen && (
              <div className="mt-4">
                {/* Prompt style selector */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {Object.entries(PROMPT_STYLES).map(([key, style]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedPromptStyle(key)}
                      className={`p-3 text-left rounded-lg border-2 transition-all ${
                        selectedPromptStyle === key
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-slate-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="font-semibold text-sm text-slate-900">{style.name}</div>
                      <div className="text-xs text-slate-600 mt-1">{style.description}</div>
                    </button>
                  ))}
                </div>

                {/* 3-column layout: Instructions → Thinking → Answer */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Column 1: Editable Instructions */}
                  <div className="bg-white rounded-lg p-4 border border-purple-200">
                    <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      📝 Instructions
                    </h4>
                    <textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      className="w-full h-80 px-2 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-xs"
                      placeholder="Edit the prompt template..."
                    />
                    <p className="text-xs text-slate-500 mt-2 mb-3">
                      Edit to change how the AI presents reasoning
                    </p>

                    <button
                      onClick={async () => {
                        setLoading(true);
                        setLoadingStep("Running custom prompt...");
                        setError(null);
                        
                        try {
                          const dataString = formatDataForPrompt(currentScenario.data);
                          const customInstructedPrompt = `${customPrompt}

Here's the expense data:

${dataString}

Question: ${question}`;

                          const apiKey = process.env.REACT_APP_ANTHROPIC_KEY;
                          const hasApiKey = apiKey && apiKey !== "your_api_key_here" && apiKey.startsWith("sk-ant-");
                          
                          if (!hasApiKey) {
                            setError("API key required for custom prompt execution.");
                            setLoading(false);
                            return;
                          }

                          const response = await fetch("http://localhost:3001/api/anthropic", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              apiKey,
                              model: "claude-sonnet-4-5-20250929",
                              max_tokens: 2000,
                              messages: [{ role: "user", content: customInstructedPrompt }],
                            }),
                          });

                          if (!response.ok) {
                            throw new Error(`API error: ${response.status}`);
                          }

                          const data = await response.json();
                          
                          if (data.error) {
                            throw new Error(data.error.message || "API returned an error");
                          }
                          
                          setPlaygroundResults(data.content[0].text);
                          setLoading(false);
                          setLoadingStep("");
                        } catch (error) {
                          console.error("Playground error:", error);
                          setError(`Failed to run custom prompt: ${error.message}`);
                          setLoading(false);
                          setLoadingStep("");
                        }
                      }}
                      disabled={loading}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5" />
                          Apply & Re-run
                        </>
                      )}
                    </button>

                    {/* Show errors in left column */}
                    {error && !loading && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <span className="text-red-800 text-xs">{error}</span>
                      </div>
                    )}
                  </div>

                  {/* Column 2: Thinking (Changes based on prompt) */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-300">
                    <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      💭 Thinking (Changes)
                    </h4>
                    <p className="text-xs text-slate-600 mb-3">
                      How the AI presents its reasoning - controlled by your instructions
                    </p>
                    
                    {!playgroundResults && !loading && (
                      <div className="h-80 flex items-center justify-center text-slate-400 text-sm border-2 border-dashed border-blue-200 rounded-lg bg-white">
                        Thinking will appear here
                      </div>
                    )}

                    {loading && (
                      <div className="h-80 flex items-center justify-center bg-white rounded-lg">
                        <div className="text-center">
                          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
                          <p className="text-sm text-slate-600">Generating...</p>
                        </div>
                      </div>
                    )}

                    {playgroundResults && !loading && (
                      <div className="bg-white rounded-lg p-3 overflow-auto text-xs" style={{maxHeight: '400px'}}>
                        {playgroundResults.includes("THINKING") ? (
                          <div className="whitespace-pre-wrap">
                            {playgroundResults.split("ANSWER")[0].replace("THINKING", "").trim()}
                          </div>
                        ) : (
                          <div className="text-slate-500 italic">No thinking section found</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Column 3: Answer (Stays consistent) */}
                  <div className="bg-green-50 rounded-lg p-4 border border-green-300">
                    <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      ✓ Answer (Consistent)
                    </h4>
                    <p className="text-xs text-slate-600 mb-3">
                      The actual answer - stays high quality regardless of prompt style
                    </p>
                    
                    {!playgroundResults && !loading && (
                      <div className="h-80 flex items-center justify-center text-slate-400 text-sm border-2 border-dashed border-green-200 rounded-lg bg-white">
                        Answer will appear here
                      </div>
                    )}

                    {loading && (
                      <div className="h-80 flex items-center justify-center bg-white rounded-lg">
                        <div className="text-center">
                          <Loader2 className="w-8 h-8 text-green-600 animate-spin mx-auto mb-3" />
                          <p className="text-sm text-slate-600">Generating...</p>
                        </div>
                      </div>
                    )}

                    {playgroundResults && !loading && (
                      <div className="bg-white rounded-lg p-3 overflow-auto text-sm" style={{maxHeight: '400px'}}>
                        {playgroundResults.includes("ANSWER") ? (
                          <div className="prose prose-sm max-w-none">
                            {renderMarkdownTable(playgroundResults.split("ANSWER")[1].trim())}
                          </div>
                        ) : (
                          <div className="prose prose-sm max-w-none">
                            {renderMarkdownTable(playgroundResults)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Insight callout */}
                <div className="mt-4 bg-purple-100 border border-purple-300 rounded-lg p-4">
                  <p className="text-sm text-purple-900">
                    <strong>💡 Key Insight:</strong> Notice how the <strong>thinking presentation changes</strong> dramatically 
                    based on your instructions, but the <strong>answer quality stays consistent</strong>. This proves that 
                    prompt engineering is a UX design tool - you're controlling presentation, not intelligence.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Result for current approach */}
        {(page.approach || page.id === 'synthesis-practice') && (
          <div className="mt-6">
            {/* Raw CoT uses static annotated example with hotspots */}
            {page.approach === 'raw' && renderAnnotatedRawCoT()}
            
            {/* Voice & Tone example - static */}
            {page.approach === 'voice' && renderVoiceToneExample()}
            
            {/* Query Synthesis in Practice - handled by renderCurrentPage */}
            {/* (page is rendered directly, not via approach) */}
            
            {/* Other approaches use API results */}
            {results && page.approach === 'instructed' && (
              <div className="bg-white rounded-lg shadow-sm border-2 border-blue-300 overflow-hidden">
                <div className="bg-blue-50 px-6 py-4 border-b border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Query Synthesis CoT</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        Structured reasoning process, not just friendlier tone
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                      RECOMMENDED
                    </span>
                  </div>
                  {renderMetrics(results.metrics.instructed)}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <button
                      onClick={() => toggleThinking("instructed")}
                      className="w-full px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-200"
                    >
                      <span className="text-sm font-medium text-slate-700">
                        {isThinkingExpanded("instructed") ? "Hide thinking" : "Show thinking"}{" "}
                        <span className="text-green-600 text-xs ml-2">
                          ✓ Structured and focused
                        </span>
                      </span>
                      {isThinkingExpanded("instructed") ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    {isThinkingExpanded("instructed") && (
                      <div className="px-6 py-4 bg-blue-50 text-sm whitespace-pre-wrap border-b border-slate-200">
                        {results.instructed.includes("THINKING")
                          ? results.instructed.split("ANSWER")[0].replace("THINKING", "").trim()
                          : ""}
                      </div>
                    )}

                    <div className="px-6 py-4 border-l-4 border-green-400">
                      <div className="prose prose-sm max-w-none">
                        {renderMarkdownTable(
                          results.instructed.includes("ANSWER")
                            ? results.instructed.split("ANSWER")[1].trim()
                            : results.instructed
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right sidebar */}
                  <div className="bg-blue-50 px-4 py-4 border-l-2 border-blue-300">
                    <div className="sticky top-4">
                      <h4 className="text-sm font-semibold text-blue-900 mb-3">What Changed</h4>
                      <div className="space-y-3 text-xs">
                        <div className="bg-white rounded p-2 border border-blue-200">
                          <strong className="text-blue-700">Query Synthesis:</strong>
                          <p className="mt-1 text-slate-700">
                            Transformed the question into structured analytical tasks
                          </p>
                        </div>

                        <div className="bg-white rounded p-2 border border-blue-200">
                          <strong className="text-blue-700">Reasoning Scaffolding:</strong>
                          <p className="mt-1 text-slate-700">
                            Provided clear structure for how to think through the problem
                          </p>
                        </div>

                        <div className="bg-white rounded p-2 border border-green-300">
                          <strong className="text-green-700">Result:</strong>
                          <p className="mt-1 text-slate-700">
                            CoT is clearer, safer (no system internals), and focused on analysis rather than process narration
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {results && page.approach === 'coded' && renderApproachCard(
              'coded',
              results.coded,
              'Code-Structured CoT',
              'Systematic validation and structured output',
              'green',
              'RELIABLE',
              `<p class="text-green-700"><strong>✓ Benefits:</strong> Structured, validatable, predictable. Perfect for systems that need to process the output programmatically.</p>`
            )}
            {page.approach === 'hybrid' && (
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-300 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-purple-600" />
                  The Eng + UX Handshake
                </h3>
                <p className="text-sm text-slate-700 mb-4">
                  The Hybrid approach requires collaboration: <strong>Engineering implements the mechanism</strong> (extended thinking, self-review step), 
                  while <strong>UX shapes the content</strong> (what questions guide the scratchpad, what gets exposed).
                </p>
                
                <div className="bg-amber-50 border border-amber-300 rounded p-3 mb-4 text-xs">
                  <p className="text-amber-900">
                    <strong>Key Difference:</strong> Query synthesis (previous pages) is UX-only. Hybrid requires engineering to build the scratchpad infrastructure, 
                    then UX designs what happens inside it.
                  </p>
                </div>
                
                {/* Visual flow diagram */}
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center gap-3">
                    {/* Step 1: Scratchpad */}
                    <div className="flex-1">
                      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
                        <div className="text-xs font-semibold text-yellow-900 mb-2">Step 1: Extended Thinking</div>
                        <div className="text-xs text-slate-700">
                          Model performs deep analysis in a private "scratchpad"
                        </div>
                        <div className="mt-2 text-xs text-slate-500 italic">
                          ✓ Can be verbose<br/>
                          ✓ Can explore multiple angles<br/>
                          ✓ Hidden from users
                        </div>
                      </div>
                    </div>

                    <ArrowRight className="w-6 h-6 text-purple-600 flex-shrink-0" />

                    {/* Step 2: Self-Review */}
                    <div className="flex-1">
                      <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-4">
                        <div className="text-xs font-semibold text-blue-900 mb-2">Step 2: Self-Review</div>
                        <div className="text-xs text-slate-700">
                          Model reviews its own thinking:
                        </div>
                        <div className="mt-2 text-xs text-slate-600">
                          • Did I answer the question?<br/>
                          • Are numbers accurate?<br/>
                          • Is this clear & actionable?
                        </div>
                      </div>
                    </div>

                    <ArrowRight className="w-6 h-6 text-purple-600 flex-shrink-0" />

                    {/* Step 3: Refined Output */}
                    <div className="flex-1">
                      <div className="bg-green-50 border-2 border-green-400 rounded-lg p-4">
                        <div className="text-xs font-semibold text-green-900 mb-2">Step 3: Refined Output</div>
                        <div className="text-xs text-slate-700">
                          Synthesized, polished answer
                        </div>
                        <div className="mt-2 text-xs text-slate-500 italic">
                          ✓ Clearer<br/>
                          ✓ More accurate<br/>
                          ✓ User-friendly
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 bg-purple-100 border border-purple-300 rounded-lg p-3">
                  <p className="text-xs text-purple-900 mb-2">
                    <strong>💡 How It Works:</strong> The self-review step acts like an editor reviewing a first draft. 
                    The model can think freely in the scratchpad, then refine its output for clarity and accuracy.
                  </p>
                </div>

                {/* Behind the scenes code */}
                <div className="mt-4 bg-slate-50 border border-slate-300 rounded-lg p-4">
                  <h5 className="text-sm font-semibold text-slate-800 mb-2">📋 What's Happening Behind the Scenes:</h5>
                  <p className="text-xs text-slate-600 italic mb-3">
                    Note: This is simplified pseudocode to illustrate the concept. Actual implementation would require additional error handling, state management, and infrastructure.
                  </p>
                  <div className="bg-slate-900 rounded p-3 font-mono text-xs overflow-x-auto">
                    <div className="text-slate-300 space-y-1">
                      <p className="text-green-400">// Step 1: Extended thinking (hidden from user)</p>
                      <p>scratchpad = model.generate(</p>
                      <p className="ml-3">prompt: <span className="text-yellow-300">"Think deeply about this analysis..."</span>,</p>
                      <p className="ml-3">extended_thinking: <span className="text-blue-400">true</span></p>
                      <p>)</p>
                      <p></p>
                      <p className="text-green-400">// Step 2: Self-review</p>
                      <p>review = model.generate(</p>
                      <p className="ml-3">prompt: <span className="text-yellow-300">"Review your thinking. Are the numbers accurate?</span></p>
                      <p className="ml-3"><span className="text-yellow-300">         Is the answer clear and actionable?"</span>,</p>
                      <p className="ml-3">context: scratchpad</p>
                      <p>)</p>
                      <p></p>
                      <p className="text-green-400">// Step 3: Synthesize refined answer</p>
                      <p>final_answer = model.generate(</p>
                      <p className="ml-3">prompt: <span className="text-yellow-300">"Based on your analysis and review,</span></p>
                      <p className="ml-3"><span className="text-yellow-300">         provide a clear, concise answer"</span>,</p>
                      <p className="ml-3">context: [scratchpad, review]</p>
                      <p>)</p>
                    </div>
                  </div>
                </div>

                {/* Eng vs UX roles */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-blue-50 border border-blue-300 rounded-lg p-3">
                    <h5 className="text-xs font-semibold text-blue-900 mb-2">What Engineering Does:</h5>
                    <ul className="text-xs text-slate-700 space-y-1">
                      <li>• Implements multi-step inference pipeline</li>
                      <li>• Creates scratchpad layer (hidden)</li>
                      <li>• Builds self-review mechanism</li>
                      <li>• Handles context passing between steps</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 border border-green-300 rounded-lg p-3">
                    <h5 className="text-xs font-semibold text-green-900 mb-2">What UX Does:</h5>
                    <ul className="text-xs text-slate-700 space-y-1">
                      <li>• Writes prompts for each step</li>
                      <li>• Defines self-review criteria</li>
                      <li>• Shapes final output structure</li>
                      <li>• Decides what (if anything) to expose</li>
                    </ul>
                  </div>
                </div>

                {/* Answer improvement comparison */}
                <div className="mt-4 bg-white border-2 border-green-400 rounded-lg p-4">
                  <h5 className="text-sm font-semibold text-green-900 mb-3">How the Answer Gets Improved:</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-semibold text-slate-600 mb-2">Before Self-Review:</div>
                      <div className="bg-slate-50 rounded p-2 text-xs text-slate-700">
                        "Expenses increased 9.4%. Marketing and Freight were the main drivers."
                      </div>
                      <p className="text-xs text-orange-700 mt-1">→ Vague, missing context</p>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-600 mb-2">After Self-Review:</div>
                      <div className="bg-green-50 rounded p-2 text-xs text-slate-700">
                        "Total expenses increased $2,650 from $28,100 to $30,750 (9.4% growth). Key drivers: Marketing +$1,400 (11.7%), Freight +$500 (23.8%). The increase appears consistent with business growth."
                      </div>
                      <p className="text-xs text-green-700 mt-1">→ Specific numbers, clear context, actionable insight</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {results && page.approach === 'hybrid' && results.hybrid && (
              <div className="bg-white rounded-lg shadow-sm border-2 border-purple-300 overflow-hidden mt-6">
                <div className="bg-purple-50 px-6 py-4 border-b border-purple-200">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Hybrid Approach - Live Result</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        What the model produced using scratchpad → self-review → refinement
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-purple-600 text-white text-xs font-medium rounded-full">
                      PRODUCTION
                    </span>
                  </div>
                  {results.metrics && results.metrics.hybrid && renderMetrics(results.metrics.hybrid)}
                </div>

                {/* Optional: Show scratchpad thinking */}
                <div className="border-b border-slate-200">
                  <button
                    onClick={() => toggleThinking("hybrid")}
                    className="w-full px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-slate-700">
                      {isThinkingExpanded("hybrid") ? "Hide scratchpad/thinking" : "Show scratchpad/thinking"}{" "}
                      <span className="text-purple-600 text-xs ml-2">
                        (optional - UX decides whether to expose this)
                      </span>
                    </span>
                    {isThinkingExpanded("hybrid") ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  {isThinkingExpanded("hybrid") && (
                    <div className="px-6 py-4 bg-yellow-50 border-t border-yellow-200">
                      <p className="text-xs text-yellow-800 mb-2 italic">
                        This is what happened in the "scratchpad" - hidden from users by default, but UX can choose to expose it for transparency.
                      </p>
                      <div className="bg-white rounded p-3 text-xs text-slate-700">
                        <p className="font-semibold mb-2">Extended Thinking:</p>
                        <p className="mb-2">Looking at Q2 to Q3 data: Marketing $12K→$13.4K, Travel $8K→$8.65K, Supplies $6K→$6.1K, Freight $2.1K→$2.6K. Let me verify these calculations and think about what's driving each change...</p>
                        <p className="font-semibold mb-2 mt-3">Self-Review:</p>
                        <p>Numbers check out. Marketing has the largest absolute impact. Freight has highest % growth. Need to make sure I provide context about whether this is concerning or expected...</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="px-6 py-4">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Refined Answer (Higher Quality):
                    </p>
                    <div className="bg-green-50 border border-green-300 rounded p-3 text-sm">
                      {typeof results.hybrid === 'object' && results.hybrid.answer 
                        ? renderMarkdownTable(results.hybrid.answer)
                        : renderMarkdownTable(results.hybrid)}
                    </div>
                    
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-blue-50 border border-blue-200 rounded p-2">
                        <strong className="text-blue-700">✓ More Detail:</strong>
                        <p className="text-slate-700 mt-1">Specific dollar amounts and context</p>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded p-2">
                        <strong className="text-blue-700">✓ More Accurate:</strong>
                        <p className="text-slate-700 mt-1">Numbers verified through self-review</p>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded p-2">
                        <strong className="text-blue-700">✓ More Actionable:</strong>
                        <p className="text-slate-700 mt-1">Often includes recommendations</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-purple-50 border-t border-purple-200">
                  <p className="text-xs text-purple-800">
                    <strong>✓ Production-Ready:</strong> The scratchpad allowed thorough analysis, the self-review caught potential errors, 
                    and the final synthesis produced a clear, detailed answer. Quality improvements come from the review step, not just more verbosity.
                  </p>
                </div>
              </div>
            )}
            
            {results && page.approach === 'hybrid' && !results.hybrid && (
              <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                <p className="text-sm text-amber-900">
                  <AlertCircle className="w-5 h-5 inline mr-2" />
                  Hybrid results not available. This approach requires running the full analysis from an earlier page.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // If in presentation mode, show presentation UI
  if (presentationMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Header with progress */}
        <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Chain of Thought Improvements
                </h2>
                <p className="text-sm text-slate-600 mt-0.5">
                  {PAGES[currentPage].title} ({currentPage + 1} of {PAGES.length})
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full ${
                  apiKeyStatus === "ready" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-blue-100 text-blue-800"
                }`}>
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    apiKeyStatus === "ready" ? "bg-green-500" : "bg-blue-500"
                  }`}></div>
                  {apiKeyStatus === "ready" ? "LIVE API" : "DEMO MODE"}
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mb-2">
              <p className="text-xs text-slate-500 italic">
                Demo using simulated data only • No real user or business data
              </p>
            </div>

            {/* Progress bar */}
            <div className="flex gap-1">
              {PAGES.map((page, idx) => (
                <button
                  key={page.id}
                  onClick={() => goToPage(idx)}
                  className={`flex-1 h-2 rounded-full transition-all ${
                    idx === currentPage
                      ? 'bg-blue-600'
                      : idx < currentPage
                      ? 'bg-blue-300 hover:bg-blue-400'
                      : 'bg-slate-200 hover:bg-slate-300'
                  }`}
                  title={page.title}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="py-8 px-6">
          {renderCurrentPage()}
        </div>

        {/* Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <button
              onClick={prevPage}
              disabled={currentPage === 0}
              className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed font-medium"
            >
              <ChevronDown className="w-5 h-5 rotate-90" />
              Previous
            </button>

            <div className="text-sm text-slate-600">
              Page {currentPage + 1} of {PAGES.length}
            </div>

            <button
              onClick={nextPage}
              disabled={currentPage === PAGES.length - 1}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed font-medium"
            >
              Next
              <ChevronDown className="w-5 h-5 -rotate-90" />
            </button>
          </div>
        </div>

        {/* Bottom padding to prevent content from being hidden behind fixed nav */}
        <div className="h-20"></div>
      </div>
    );
  }

  // Original comparison view
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-slate-900">
              Chain of Thought: From Security Risk to Production Ready
            </h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPresentationMode(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                Presentation Mode
              </button>
              <div className={`flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full ${
                apiKeyStatus === "ready" 
                  ? "bg-green-100 text-green-800" 
                  : "bg-blue-100 text-blue-800"
              }`}>
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  apiKeyStatus === "ready" ? "bg-green-500" : "bg-blue-500"
                }`}></div>
                {apiKeyStatus === "ready" ? "LIVE API" : "DEMO MODE"}
              </div>
            </div>
          </div>
          <p className="text-lg text-slate-600 mb-2">
            Interactive demonstration of AI response design improvements
          </p>
          <p className="text-xs text-slate-500 italic mb-4">
            Demo using simulated data only • No real user or business data
          </p>
          
          {/* Presentation Introduction */}
          {showIntro && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Info className="w-6 h-6 text-blue-600" />
                    What You'll See in This Demo
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-slate-800">The Problem:</h3>
                      <ul className="space-y-1 text-slate-700">
                        <li className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                          Raw CoT exposes internal reasoning (security risk)
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                          Poor user experience with verbose outputs
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                          No systematic quality control
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-slate-800">The Solutions:</h3>
                      <ul className="space-y-1 text-slate-700">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          Prompt engineering for better UX
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          Code structure for reliability
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          Hybrid approach for production
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>💡 Pro tip:</strong> Try different scenarios and prompt presets to see how 
                      the same question produces different responses based on user context and requirements.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIntro(false)}
                  className="ml-4 p-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
          
          {!showIntro && (
            <button
              onClick={() => setShowIntro(true)}
              className="mb-4 text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
            >
              <Info className="w-4 h-4" />
              Show introduction
            </button>
          )}

          {/* API Key Status Warning */}
          {apiKeyStatus === "missing" && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-800 mb-2">API Key Required</h3>
                  <p className="text-sm text-amber-700 mb-3">
                    To see live AI responses, you need to add your Anthropic API key.
                  </p>
                  <div className="bg-amber-100 p-3 rounded text-xs text-amber-800">
                    <strong>Setup steps:</strong>
                    <ol className="mt-1 ml-4 list-decimal space-y-1">
                      <li>Get your API key from <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="underline">console.anthropic.com</a></li>
                      <li>Copy <code>.env.example</code> to <code>.env</code></li>
                      <li>Replace <code>your_api_key_here</code> with your actual key</li>
                      <li>Restart the development server</li>
                    </ol>
                  </div>
                  <p className="text-xs text-amber-600 mt-2">
                    <strong>Note:</strong> The demo will show mock responses without a valid API key.
                  </p>
                </div>
              </div>
            </div>
          )}

          {apiKeyStatus === "ready" && (
            <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-800 font-medium">
                  API Key configured - Ready for live demo!
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Setup */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Demo Configuration</h2>
          
          {/* Scenario Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Choose a Demo Scenario
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(SCENARIOS).map(([key, scenario]) => (
                <button
                  key={key}
                  onClick={() => {
                    setScenario(key);
                    setQuestion(scenario.question);
                  }}
                  className={`p-4 text-left rounded-lg border-2 transition-all ${
                    scenario === SCENARIOS[scenario]
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="font-medium text-sm text-slate-900">{scenario.name}</div>
                  <div className="text-xs text-slate-600 mt-1">{scenario.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Question Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Question to Ask
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your question about the data..."
            />
            <p className="text-xs text-slate-500 mt-1">
              This question will be sent to all four CoT approaches for comparison
            </p>
          </div>

          {/* Prompt Configuration */}
          <div className="mb-4 border border-blue-200 rounded-lg p-4 bg-blue-50">
            <button
              onClick={() => setShowPromptConfig(!showPromptConfig)}
              className="w-full flex items-center justify-between text-left"
            >
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Prompt Configuration (Model UX Zone)
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Content designers: This is where you control tone and
                  response format
                </p>
              </div>
              {showPromptConfig ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>

            {showPromptConfig && (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Select Tone Preset:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(PROMPT_PRESETS).map((presetName) => (
                      <button
                        key={presetName}
                        onClick={() => setSelectedPreset(presetName)}
                        className={`p-3 text-left rounded-lg border-2 transition-colors ${
                          selectedPreset === presetName
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 hover:border-blue-300"
                        }`}
                      >
                        <div className="font-medium text-sm">{presetName}</div>
                        <div className="text-xs text-slate-600 mt-1">
                          {PROMPT_PRESETS[presetName].description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded p-3 border border-slate-200">
                  <div className="text-xs font-medium text-slate-700 mb-2">
                    Current Configuration:
                  </div>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-medium">System Prompt:</span>
                      <div className="text-slate-600 italic mt-1">
                        "{PROMPT_PRESETS[selectedPreset].systemPrompt}"
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Answer Guidance:</span>
                      <div className="text-slate-600 italic mt-1">
                        "{PROMPT_PRESETS[selectedPreset].answerGuidance}"
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-600 italic">
                  💡 Try different presets to see how easily you can change tone
                  and structure with just prompt modifications - no code changes
                  needed!
                </div>
              </div>
            )}
          </div>


          <button
            onClick={runAnalysis}
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {loadingStep || "Generating responses..."}
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Run Comparison
              </>
            )}
          </button>

          {loading && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <span className="text-blue-800 font-medium">Generating AI Responses</span>
              </div>
              <div className="text-sm text-blue-700">
                {loadingStep}
              </div>
              <div className="mt-2 text-xs text-blue-600">
                This may take 10-15 seconds as we call Claude API for each approach...
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span className="text-red-800">{error}</span>
            </div>
          )}
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* Raw CoT - Current State */}
            <div className="bg-white rounded-lg shadow-sm border-2 border-orange-300 overflow-hidden">
              <div className="bg-orange-50 px-6 py-4 border-b border-orange-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Raw CoT (Current State)
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      What users see today - internal thinking exposed to users
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-orange-600 text-white text-xs font-medium rounded-full">
                    CURRENT
                  </span>
                </div>
                {renderMetrics(results.metrics.raw)}
              </div>

              {/* Thinking - Exposed to users */}
              <div className="border-b border-slate-200">
              <button
                onClick={() => toggleThinking("raw")}
                className="w-full px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors bg-orange-100"
              >
                <span className="text-sm font-medium text-slate-700">
                  {isThinkingExpanded("raw") ? "Hide thinking" : "Show thinking"}{" "}
                  <span className="text-orange-700 text-xs ml-2 font-semibold">
                    ⚠️ Visible to users
                  </span>
                </span>
                {isThinkingExpanded("raw") ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              {isThinkingExpanded("raw") && (
                  <div className="px-6 py-4 bg-slate-50 text-sm whitespace-pre-wrap border-t border-slate-200">
                    {extractThinking(results.raw)}
                  </div>
                )}
              </div>

              {/* The actual answer (buried after all the thinking) */}
              <div className="px-6 py-4 border-l-4 border-green-400">
                <div className="text-xs text-green-700 font-medium mb-2">
                  ↓ The actual answer (probably fine!) ↓
                </div>
                <div className="prose prose-sm max-w-none">
                  {renderMarkdownTable(extractAnswer(results.raw))}
                </div>
              </div>

              <div className="px-6 py-3 bg-orange-50 border-t border-orange-200">
                <p className="text-xs text-orange-700 mb-2">
                  <strong>UX Issue:</strong> The answer itself is fine, but exposing 
                  all the internal reasoning is overwhelming and unprofessional for users.
                </p>
                <p className="text-xs text-orange-700">
                  <strong>Security Note:</strong> Showing internal reasoning can reveal 
                  system logic and decision patterns that may be exploited. Best practice 
                  is to hide this from users.
                </p>
              </div>
            </div>

            {/* Instructed CoE */}
            <div className="bg-white rounded-lg shadow-sm border-2 border-blue-300 overflow-hidden">
              <div className="bg-blue-50 px-6 py-4 border-b border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Instructed CoE
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Shaped via prompts - thinking is cleaned up and COULD be
                      shown to users
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    FAST
                  </span>
                </div>
                {renderMetrics(results.metrics.instructed)}
              </div>

              <button
                onClick={() => toggleThinking("instructed")}
                className="w-full px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-200"
              >
                <span className="text-sm font-medium text-slate-700">
                  {isThinkingExpanded("instructed") ? "Hide thinking" : "Show thinking"}{" "}
                  <span className="text-green-600 text-xs ml-2">
                    ✓ Safe for users, potentially educational
                  </span>
                </span>
                {isThinkingExpanded("instructed") ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              {isThinkingExpanded("instructed") && (
                <div className="px-6 py-4 bg-blue-50 text-sm whitespace-pre-wrap border-b border-slate-200">
                  {results.instructed.includes("THINKING")
                    ? results.instructed
                        .split("ANSWER")[0]
                        .replace("THINKING", "")
                        .trim()
                    : ""}
                </div>
              )}

              <div className="px-6 py-4">
                <div className="prose prose-sm max-w-none">
                  {renderMarkdownTable(
                    results.instructed.includes("ANSWER")
                      ? results.instructed.split("ANSWER")[1].trim()
                      : results.instructed
                  )}
                </div>
              </div>

              <div className="px-6 py-3 bg-blue-50 border-t border-blue-200">
                <p className="text-xs text-blue-700">
                  <strong>Impact:</strong> Much better UX. Thinking is clean,
                  non-leaky, could help users learn about their data/product.
                  Quick to iterate. Answer quality ~same.
                </p>
              </div>
            </div>

            {/* Coded CoE */}
            <div className="bg-white rounded-lg shadow-sm border-2 border-green-300 overflow-hidden">
              <div className="bg-green-50 px-6 py-4 border-b border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Coded CoE
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Structured in code - systematic validation can improve
                      answer quality
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    RELIABLE
                  </span>
                </div>
                {renderMetrics(results.metrics.coded)}
              </div>

              <button
                onClick={() => toggleThinking("coded")}
                className="w-full px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-200"
              >
                <span className="text-sm font-medium text-slate-700">
                  {isThinkingExpanded("coded") ? "Hide thinking" : "Show thinking"}{" "}
                  <span className="text-slate-600 text-xs ml-2">
                    Structured, could be selectively shown
                  </span>
                </span>
                {isThinkingExpanded("coded") ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              {isThinkingExpanded("coded") && results.coded.thinking && (
                <div className="px-6 py-4 bg-green-50 text-sm border-b border-slate-200">
                  <div>
                    <strong>Scope:</strong> {results.coded.thinking.scope}
                  </div>
                  <div>
                    <strong>Method:</strong> {results.coded.thinking.method}
                  </div>
                  {results.coded.thinking.assumptions &&
                    results.coded.thinking.assumptions.length > 0 && (
                      <div>
                        <strong>Assumptions:</strong>{" "}
                        {results.coded.thinking.assumptions.join(", ")}
                      </div>
                    )}
                </div>
              )}

              <div className="px-6 py-4">
                {renderCodedAnswer(results.coded)}
              </div>

              <div className="px-6 py-3 bg-green-50 border-t border-green-200">
                <p className="text-xs text-green-700">
                  <strong>Impact:</strong> Excellent UX + code can enforce
                  requirements/validation. CAN improve answer quality via
                  orchestration. Most systematic.
                </p>
              </div>
            </div>

            {/* Hybrid */}
            <div className="bg-white rounded-lg shadow-md border-2 border-purple-400 overflow-hidden">
              <div className="bg-purple-50 px-6 py-4 border-b border-purple-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Production Hybrid
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Best of both - prompts + code working together
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                    RECOMMENDED
                  </span>
                </div>
                {renderMetrics(results.metrics.coded)}
              </div>

              <button
                onClick={() => toggleThinking("hybrid")}
                className="w-full px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-200"
              >
                <span className="text-sm font-medium text-slate-700">
                  {isThinkingExpanded("hybrid") ? "Hide thinking" : "Show thinking"}{" "}
                  <span className="text-slate-600 text-xs ml-2">
                    Hidden by default, available on demand
                  </span>
                </span>
                {isThinkingExpanded("hybrid") ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              {isThinkingExpanded("hybrid") && (
                <div className="px-6 py-4 bg-purple-50 text-sm space-y-2 border-b border-slate-200">
                  <p>
                    <strong>How it works in production:</strong>
                  </p>
                  <ul className="ml-4 space-y-1 text-slate-700">
                    <li>
                      • Model UX designs prompts (content, tone, structure)
                    </li>
                    <li>
                      • Engineering builds validation, retry logic, error
                      handling
                    </li>
                    <li>
                      • Code catches failures, prompts guide successful cases
                    </li>
                    <li>• Both teams iterate independently on their domains</li>
                  </ul>
                </div>
              )}

              <div className="px-6 py-4">
                {renderCodedAnswer(results.coded)}
              </div>

              <div className="px-6 py-3 bg-purple-50 border-t border-purple-200">
                <p className="text-xs text-purple-800">
                  <strong>Impact:</strong> Combines systematic reliability +
                  content flexibility. Best UX + best quality potential.
                </p>
              </div>
            </div>

            {/* Engineering Considerations */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-6 text-white">
              <h3 className="text-xl font-bold mb-2">
                Engineering Considerations
              </h3>
              <p className="text-xs text-slate-400 mb-4 italic">
                Note: Metrics shown are relative and for single-call scenarios.
                Production implementations (especially Code-Structured with
                orchestration) may have different trade-offs.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-slate-800/50 rounded p-4">
                  <h4 className="font-semibold mb-2 text-amber-300 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Cost Impact
                  </h4>
                  <div className="space-y-2 text-slate-300 text-xs">
                    <div>Raw CoT: {results.metrics.raw.tokens} tokens</div>
                    <div>
                      Prompt-Shaped: {results.metrics.instructed.tokens} tokens
                      (
                      {Math.round(
                        (1 -
                          results.metrics.instructed.tokens /
                            results.metrics.raw.tokens) *
                          100
                      )}
                      % reduction)
                    </div>
                    <div>
                      Code-Structured: {results.metrics.coded.tokens} tokens (
                      {Math.round(
                        (1 -
                          results.metrics.coded.tokens /
                            results.metrics.raw.tokens) *
                          100
                      )}
                      % reduction)
                    </div>
                    <p className="mt-2 italic">
                      Shorter responses = lower per-call cost
                    </p>
                    <p className="mt-2 text-yellow-300">
                      Caveat: Code-Structured with
                      validation/retry/orchestration may use multiple calls,
                      changing cost profile.
                    </p>
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded p-4">
                  <h4 className="font-semibold mb-2 text-blue-300 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Latency
                  </h4>
                  <div className="space-y-2 text-slate-300 text-xs">
                    <div>Raw CoT: {results.metrics.raw.latency}ms</div>
                    <div>
                      Prompt-Shaped: {results.metrics.instructed.latency}ms
                    </div>
                    <div>
                      Code-Structured: {results.metrics.coded.latency}ms
                    </div>
                    <p className="mt-2 italic">
                      Shorter outputs → faster single-call generation
                    </p>
                    <p className="mt-2 text-yellow-300">
                      Caveat: Orchestration/validation logic adds overhead. May
                      trade some speed for reliability.
                    </p>
                    <p className="mt-2 text-slate-400">
                      Note: Showing thinking masks perceived latency (progress
                      indicator). Pragmatic band-aid, not a strategy.
                    </p>
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded p-4">
                  <h4 className="font-semibold mb-2 text-green-300 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Quality Levers
                  </h4>
                  <div className="space-y-2 text-slate-300 text-xs">
                    <div>Prompt-Shaped: Prompts shape response format</div>
                    <div>
                      Code-Structured: Can add validation/retry/orchestration
                    </div>
                    <div>Hybrid: Both working together</div>
                    <p className="mt-2 italic">
                      Code can improve answer quality, not just consistency
                    </p>
                    <p className="mt-2 text-yellow-300">
                      Trade-off: Quality improvements from orchestration may
                      increase cost/latency.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Warning */}
            <div className="bg-gradient-to-br from-red-900 to-red-800 rounded-lg p-6 text-white">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <AlertCircle className="w-6 h-6" />
                Why Raw CoT is Actually Dangerous (Not Just Messy)
              </h3>

              <div className="space-y-3 text-sm">
                <div className="bg-red-800/50 rounded p-4">
                  <h4 className="font-semibold mb-2 text-red-200">
                    🔓 Attack Surface Exposure
                  </h4>
                  <p className="text-red-100">
                    When models reveal their internal reasoning, they expose
                    system prompts, instruction hierarchies, access control
                    logic, and decision boundaries. Attackers use this to:
                  </p>
                  <ul className="mt-2 ml-4 space-y-1 text-red-100 text-xs">
                    <li>
                      • Craft targeted prompt injections that exploit known
                      instruction patterns
                    </li>
                    <li>
                      • Identify which system constraints can be overridden or
                      bypassed
                    </li>
                    <li>• Map permission boundaries and data access rules</li>
                    <li>
                      • Refine jailbreak attempts based on visible decision
                      logic
                    </li>
                  </ul>
                </div>

                <div className="bg-red-800/50 rounded p-4">
                  <h4 className="font-semibold mb-2 text-red-200">
                    🎯 Real-World Risk Examples
                  </h4>
                  <ul className="space-y-2 text-red-100 text-xs">
                    <li>
                      • <strong>Prompt injection:</strong> Seeing
                      "instruction_set=X overridden by Y" teaches attackers how
                      to inject overrides
                    </li>
                    <li>
                      • <strong>Data access probing:</strong> Exposing
                      permission checks reveals what data exists and how it's
                      protected
                    </li>
                    <li>
                      • <strong>Business logic reverse engineering:</strong>{" "}
                      Internal reasoning shows decision trees competitors can
                      exploit
                    </li>
                    <li>
                      • <strong>Compliance risk:</strong> May inadvertently
                      expose PII, financial logic, or regulated processes
                    </li>
                  </ul>
                </div>

                <div className="bg-red-800/50 rounded p-4">
                  <h4 className="font-semibold mb-2 text-red-200">
                    🛡️ Why This Matters at Intuit's Stage
                  </h4>
                  <p className="text-red-100 text-xs">
                    As LLM features scale and more users interact with them, the
                    probability of adversarial probing increases. What seems
                    like a "nuisance" in internal testing becomes a systematic
                    vulnerability in production. Financial services are
                    high-value targets - attackers WILL probe for weaknesses.
                  </p>
                </div>
              </div>
            </div>

            {/* What Actually Improves */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3 text-slate-900">
                Critical: What Actually Gets Better?
              </h3>

              <div className="space-y-3 text-sm">
                <div className="bg-white rounded p-4 border border-amber-200">
                  <h4 className="font-semibold text-slate-900 mb-2">
                    Raw CoT → Prompt-Shaped Response (Model UX)
                  </h4>
                  <p className="text-slate-700 mb-1">
                    <strong>Improves:</strong> Readability, UX, thinking clarity
                  </p>
                  <p className="text-slate-700 mb-1">
                    <strong>Answer quality:</strong>{" "}
                    <span className="text-amber-700 font-medium">~Same</span> -
                    same reasoning, better communication
                  </p>
                  <p className="text-slate-600 text-xs italic">
                    Think of it as typography - clearer to read, same content
                  </p>
                </div>

                <div className="bg-white rounded p-4 border border-amber-200">
                  <h4 className="font-semibold text-slate-900 mb-2">
                    Prompt-Shaped → Code-Structured Response (Engineering)
                  </h4>
                  <p className="text-slate-700 mb-1">
                    <strong>Improves:</strong> Consistency, reliability,
                    structure
                  </p>
                  <p className="text-slate-700 mb-1">
                    <strong>Answer quality:</strong>{" "}
                    <span className="text-green-700 font-medium">
                      Can improve
                    </span>{" "}
                    via validation/orchestration
                  </p>
                  <p className="text-slate-600 text-xs">
                    Code can enforce requirements, catch errors, retry
                    incomplete answers
                  </p>
                </div>
              </div>
            </div>

            {/* Technical Deep Dive - Show Actual Prompts */}
            {results && results.promptsUsed && (
              <div className="bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-slate-400 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-3 text-slate-900">
                  🔧 Technical Deep Dive: Prompts Used
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  For engineers and content designers: Here are the actual
                  prompts sent to Claude. This shows exactly where each
                  discipline makes changes.
                </p>

                <div className="space-y-4">
                  {/* Prompt-Shaped */}
                  <details className="bg-white rounded-lg border border-slate-300">
                    <summary className="px-4 py-3 cursor-pointer hover:bg-slate-50 font-medium">
                      Prompt-Shaped Response (Model UX controls this)
                    </summary>
                    <div className="px-4 py-3 border-t border-slate-200 space-y-3">
                      <div>
                        <div className="text-xs font-semibold text-blue-700 mb-1">
                          SYSTEM PROMPT:
                        </div>
                        <pre className="text-xs bg-blue-50 p-3 rounded overflow-auto border border-blue-200">
                          {results.promptsUsed.instructedSystem}
                        </pre>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-blue-700 mb-1">
                          USER PROMPT:
                        </div>
                        <pre className="text-xs bg-blue-50 p-3 rounded overflow-auto border border-blue-200">
                          {results.promptsUsed.instructedUser}
                        </pre>
                      </div>
                      <div className="text-xs text-slate-600 italic bg-blue-50 p-2 rounded">
                        💡 Content designers: Change the system prompt and
                        guidance sections above to control tone and structure.
                        No code changes needed - just modify the prompt text.
                      </div>
                    </div>
                  </details>

                  {/* Code-Structured */}
                  <details className="bg-white rounded-lg border border-slate-300">
                    <summary className="px-4 py-3 cursor-pointer hover:bg-slate-50 font-medium">
                      Code-Structured Response (Engineering + Model UX
                      collaborate)
                    </summary>
                    <div className="px-4 py-3 border-t border-slate-200 space-y-3">
                      <div>
                        <div className="text-xs font-semibold text-green-700 mb-1">
                          PROMPT (defines content):
                        </div>
                        <pre className="text-xs bg-green-50 p-3 rounded overflow-auto border border-green-200">
                          {results.promptsUsed.codedUser}
                        </pre>
                      </div>
                      <div className="text-xs text-slate-600 bg-green-50 p-3 rounded space-y-2">
                        <div>
                          <strong>👨‍💻 Engineering Zone:</strong>
                        </div>
                        <ul className="ml-4 space-y-1">
                          <li>• Define JSON schema structure</li>
                          <li>
                            • Add validation logic (check required fields, data
                            types)
                          </li>
                          <li>
                            • Implement retry logic for malformed responses
                          </li>
                          <li>• Add error handling and fallbacks</li>
                          <li>• Monitor and log failures</li>
                        </ul>
                        <div className="mt-2">
                          <strong>✍️ Model UX Zone:</strong>
                        </div>
                        <ul className="ml-4 space-y-1">
                          <li>
                            • Write prompts that guide content for each field
                          </li>
                          <li>
                            • Define what makes a "good" response for each
                            section
                          </li>
                          <li>• Test and refine prompt effectiveness</li>
                        </ul>
                      </div>
                    </div>
                  </details>
                </div>

                <div className="mt-4 bg-purple-50 border border-purple-300 rounded p-3 text-sm">
                  <strong className="text-purple-900">
                    For repository implementation:
                  </strong>
                  <ul className="mt-2 ml-4 space-y-1 text-purple-800 text-xs">
                    <li>
                      • Store prompt templates in a dedicated folder:{" "}
                      <code>/prompts/</code>
                    </li>
                    <li>
                      • Keep Model UX configs separate from engineering
                      validation logic
                    </li>
                    <li>
                      • Use environment variables or config files for prompt
                      versioning
                    </li>
                    <li>
                      • Add clear code comments marking "MODEL UX ZONE" vs
                      "ENGINEERING ZONE"
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Presentation Summary */}
        {results && (
          <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg p-6">
            <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Key Takeaways
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-500" />
                    Security First
                  </h4>
                  <p className="text-sm text-slate-700">
                    Raw CoT isn't just messy UX - it's a security vulnerability. 
                    Internal reasoning exposes system logic, access controls, and 
                    decision boundaries that attackers can exploit.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-500" />
                    Quick Wins Available
                  </h4>
                  <p className="text-sm text-slate-700">
                    Prompt engineering (Model UX) can immediately improve user 
                    experience without code changes. Content designers can iterate 
                    independently on tone and structure.
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <ArrowRight className="w-5 h-5 text-purple-500" />
                    Production Path
                  </h4>
                  <p className="text-sm text-slate-700">
                    The hybrid approach combines prompt engineering with code 
                    structure for the best of both worlds: content flexibility 
                    and systematic reliability.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    Business Impact
                  </h4>
                  <p className="text-sm text-slate-700">
                    Better responses = lower costs (fewer tokens), faster delivery, 
                    and higher user satisfaction. The improvements pay for themselves.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-100 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 Key Takeaway:</strong> This demo shows that AI response 
                design is a cross-functional challenge requiring both content expertise 
                (Model UX) and engineering rigor. The solutions are practical and 
                implementable today.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
