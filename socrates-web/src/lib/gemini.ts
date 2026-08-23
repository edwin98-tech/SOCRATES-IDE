export interface GeminiMessage {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

export interface SocraticResponse {
  message: string;
  misconceptionTag?: string;
}

export interface ComplexityAnalysis {
  timeComplexity: string;
  spaceComplexity: string;
  cleanlinessScore: number;
  summary: string;
  suggestions: string[];
}

export async function testGeminiApiKey(apiKey: string): Promise<{ success: boolean; model?: string; message: string }> {
  try {
    // 1. Preferred modern Gemini models in order of speed and stability
    const candidateModels = [
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-2.0-flash',
      'gemini-2.0-flash-exp',
      'gemini-1.5-flash-8b',
      'gemini-1.5-pro',
      'gemini-1.5-pro-latest',
      'gemini-pro'
    ];

    // 2. Fetch supported models from Google's ModelService
    let availableModels: string[] = [];
    try {
      const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
      const listRes = await fetch(listUrl);
      if (listRes.ok) {
        const data = await listRes.json();
        availableModels = (data.models || [])
          .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
          .map((m: any) => m.name.replace(/^models\//, ''));
      }
    } catch (e) {
      console.warn("Could not list models from Google API:", e);
    }

    // Combine candidate models with discovered models, prioritizing supported models
    const modelsToTest = Array.from(new Set([
      ...candidateModels.filter(m => availableModels.length === 0 || availableModels.includes(m)),
      ...availableModels,
      ...candidateModels
    ]));

    let workingModel: string | null = null;

    // 3. Test ping generation with candidate models in order until one succeeds
    for (const model of modelsToTest) {
      // Skip models known to be deprecated or non-standard
      if (model.includes('2.5-flash') || model.includes('3.6-flash')) continue;

      try {
        const pingUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const pingRes = await fetch(pingUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: "ping" }] }]
          })
        });

        if (pingRes.ok) {
          workingModel = model;
          break;
        }
      } catch (err) {
        // Continue testing next candidate
      }
    }

    if (!workingModel) {
      return {
        success: false,
        message: "Unable to find an active Gemini generateContent model for this API key. Please check your key at https://aistudio.google.com/."
      };
    }

    // Cache the verified working model
    localStorage.setItem('socrates_active_gemini_model', workingModel);

    return {
      success: true,
      model: workingModel,
      message: `Connected successfully (${workingModel})!`
    };
  } catch (e: any) {
    return {
      success: false,
      message: e.message || "Network error connecting to Google Gemini API"
    };
  }
}

async function fetchGeminiWithFallback(apiKey: string, body: any) {
  const cachedModel = localStorage.getItem('socrates_active_gemini_model');
  const candidateModels = [
    cachedModel,
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-2.0-flash',
    'gemini-1.5-pro',
    'gemini-pro'
  ].filter(Boolean) as string[];

  // Deduplicate and filter out deprecated models
  const cleanCandidates = Array.from(new Set(candidateModels)).filter(m => !m.includes('2.5-flash'));

  for (const modelToUse of cleanCandidates) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        localStorage.setItem('socrates_active_gemini_model', modelToUse);
        return await response.json();
      }
    } catch (e) {
      // Continue to next model
    }
  }

  // If initial list fails, try active discovery
  const discovery = await testGeminiApiKey(apiKey);
  if (discovery.success && discovery.model) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${discovery.model}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      return await res.json();
    }
  }

  throw new Error("Gemini API models returned error. Please verify your API key in Settings.");
}

function sanitizeSocraticResponse(rawText: string): SocraticResponse {
  let text = rawText;

  // Extract misconception tag [TAG: ...]
  const tagMatch = text.match(/\[TAG:\s*([^\]]+)\]/i);
  const misconceptionTag = tagMatch ? tagMatch[1].trim() : undefined;
  text = text.replace(/\[TAG:\s*[^\]]+\]/i, '').trim();

  // If reasoning models output draft steps like "* Draft 1:*", "* Draft 2:*", "* Final:*", extract the clean answer
  if (/\*?\s*(?:Draft\s*\d+|Final|Response|Output)\s*:\*?/i.test(text)) {
    const draftSections = text.split(/\*?\s*(?:Draft\s*\d+|Final|Response|Output)\s*:\*?/i);
    if (draftSections.length > 1) {
      text = draftSections[draftSections.length - 1].trim();
    }
  }

  // Remove any leaked scratchpad meta-headers (* User Question:, * Context:, * Goal:, etc.)
  text = text.replace(/^\s*\*\s*(?:User Question|Context|Student's Code|Goal|Pedagogical Rules|Explanation of Objective|Socratic Angle)\s*:[^\n]*\n?/gim, '');
  text = text.replace(/\*\s*(?:User Question|Context|Student's Code|Goal|Pedagogical Rules|Explanation of Objective|Socratic Angle)\s*:[^*]+/gim, '');

  // Remove trailing meta self-checks (e.g. * *Refining for pedagogical quality..., Total sentences: 2. Perfect., etc.)
  text = text.replace(/\*?\s*\*?(?:Refining for pedagogical quality|Total sentences|Pedagogical check|Self-reflection|Check against rules)[^\n]*/gim, '');

  // Remove wrapping double or single quotes if the entire message was quoted by the model
  text = text.replace(/^["'`\s]+|["'`\s]+$/g, '').trim();

  if (!text) {
    text = "Let's check your code: what is the expected output for this problem, and how is your code currently handling it?";
  }

  return {
    message: text,
    misconceptionTag
  };
}

export async function callGeminiSocratic({
  apiKey,
  userMessage,
  studentCode,
  errorContext,
  problemDescription,
  chatHistory = []
}: {
  apiKey?: string;
  userMessage: string;
  studentCode: string;
  errorContext?: string;
  problemDescription: string;
  chatHistory?: { role: 'student' | 'ai'; text: string }[];
}): Promise<SocraticResponse> {
  const activeKey = apiKey || localStorage.getItem('socrates_gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY;

  if (!activeKey || activeKey === 'YOUR_GEMINI_API_KEY') {
    return {
      message: "⚠️ Please configure your Gemini API Key in AI Settings (click the ⚙️ icon at the top) to enable live Socratic guidance.",
      misconceptionTag: "Missing API Key"
    };
  }

  const systemInstruction = `You are Socrates AI, an expert computer science tutor and pedagogical mentor inside Socrates-IDE.
Your mission is to guide students through debugging and programming challenges using the SOCRATIC METHOD.

PEDAGOGICAL RULES:
1. 70% diagnostic questions, 30% conceptual hints.
2. ABSOLUTE RULE: NEVER give direct copy-pasteable code solutions or fix the code for them.
3. Help the student spot logic flaws, syntax anomalies, and off-by-one errors themselves by asking probing questions about what their code is doing.
4. Keep responses concise, encouraging, and easy to digest (2-4 sentences max).
5. At the very end of your response, include a hidden tag in the format [TAG: MisconceptionName] (e.g. [TAG: Syntax Colon Missing], [TAG: Indentation Error], [TAG: Loop Boundary Error], [TAG: Unused Variable], [TAG: Correct Logic]).
6. IMPORTANT: Output ONLY your final conversational message to the student. DO NOT output scratchpad notes, drafts, or reasoning steps.

CONTEXT:
Problem Description: ${problemDescription}
Student's Current Code:
\`\`\`python
${studentCode}
\`\`\`
Latest Execution / Error Output:
\`\`\`
${errorContext || 'No runtime errors. Student is working on implementation.'}
\`\`\`
`;

  const contents: any[] = [];

  // Add chat history
  chatHistory.slice(-6).forEach(msg => {
    contents.push({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    });
  });

  // Current user prompt
  contents.push({
    role: "user",
    parts: [{ text: userMessage }]
  });

  try {
    const payload = {
      system_instruction: {
        parts: [{ text: systemInstruction }]
      },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 350
      }
    };

    const data = await fetchGeminiWithFallback(activeKey, payload);
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Let's review your code line by line. What is your goal in the first function?";
    
    return sanitizeSocraticResponse(rawText);
  } catch (err: any) {
    console.error("Gemini API call failed:", err);
    
    // Provide an intelligent contextual Socratic hint even if API quota / model is unavailable
    let fallbackHint = "Let's inspect what your code is currently doing. Which line or step do you think might be behaving differently than expected?";
    let fallbackTag = "Logic / Step Inspection";

    if (errorContext && errorContext.toLowerCase().includes('syntaxerror')) {
      fallbackHint = "Look closely at the line where Python detected the syntax error. Did you miss a colon `:` or a bracket?";
      fallbackTag = "Syntax Colon / Bracket";
    } else if (errorContext && errorContext.toLowerCase().includes('indentationerror')) {
      fallbackHint = "Python relies on clean, consistent indentation. Are all lines inside your function or loop indented by 4 spaces?";
      fallbackTag = "Indentation Error";
    } else if (errorContext && errorContext.toLowerCase().includes('nameerror')) {
      fallbackHint = "Python couldn't find a variable or function name you referenced. Double-check your spelling and definitions!";
      fallbackTag = "Variable Scope / Name Error";
    } else if (errorContext && errorContext.toLowerCase().includes('indexerror')) {
      fallbackHint = "Your list index is out of range! Check where your loop stops—remember that Python arrays are 0-indexed.";
      fallbackTag = "Index Boundary Error";
    }

    return {
      message: fallbackHint,
      misconceptionTag: fallbackTag
    };
  }
}

export async function analyzeCodeComplexity({
  studentCode,
  problemDescription
}: {
  studentCode: string;
  problemDescription: string;
}): Promise<ComplexityAnalysis> {
  const activeKey = localStorage.getItem('socrates_gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY;

  // Smart static analysis fallback if no API key configured
  if (!activeKey || activeKey === 'YOUR_GEMINI_API_KEY') {
    const hasNestedLoop = (studentCode.match(/for\s+/g) || []).length >= 2 || (studentCode.match(/while\s+/g) || []).length >= 2;
    const hasSingleLoop = /for\s+|while\s+/.test(studentCode);
    const hasExtraArray = /\[\s*\]|\.append\(|list\(/.test(studentCode);

    return {
      timeComplexity: hasNestedLoop ? "O(N²)" : hasSingleLoop ? "O(N)" : "O(1)",
      spaceComplexity: hasExtraArray ? "O(N)" : "O(1) Auxiliary Space",
      cleanlinessScore: studentCode.length > 50 ? 92 : 80,
      summary: hasNestedLoop 
        ? "Your algorithm uses nested iterations resulting in quadratic time."
        : hasSingleLoop 
          ? "Linear time scan through the array elements."
          : "Constant time execution.",
      suggestions: [
        "Variables are appropriately scoped.",
        hasExtraArray ? "Consider in-place modifications to optimize auxiliary memory." : "Optimal memory footprint with in-place operations."
      ]
    };
  }

  const prompt = `Analyze this student's Python code for time complexity, space complexity, and cleanliness.
Return ONLY valid JSON strictly adhering to this format:
{
  "timeComplexity": "O(N)",
  "spaceComplexity": "O(1)",
  "cleanlinessScore": 92,
  "summary": "Brief 1-2 sentence explanation of time/space analysis.",
  "suggestions": ["Suggestion 1", "Suggestion 2"]
}

Problem: ${problemDescription}
Code:
\`\`\`python
${studentCode}
\`\`\`
`;

  try {
    const data = await fetchGeminiWithFallback(activeKey, {
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("AI complexity analysis error:", e);
  }

  return {
    timeComplexity: "O(N)",
    spaceComplexity: "O(1)",
    cleanlinessScore: 90,
    summary: "Linear time traversal with constant extra space.",
    suggestions: ["Code structure follows standard Python conventions."]
  };
}
