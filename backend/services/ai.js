const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getFixes(code, staticIssues, simulationIssues) {
  if (staticIssues.length === 0 && simulationIssues.length === 0) {
    return ["No issues detected. Your code passed the VibeCheck!"];
  }

  const prompt = `
    You are an expert full-stack security auditor. 
    Review the code and vulnerabilities found via static AST analysis and dynamic simulation.

    --- ORIGINAL CODE ---
    ${code}

    --- STATIC ANALYSIS ISSUES ---
    ${staticIssues.length > 0 ? staticIssues.join("\n") : "None detected."}

    --- DYNAMIC SIMULATION ISSUES (Actual Runtime Failures) ---
    ${simulationIssues.length > 0 ? simulationIssues.join("\n") : "None detected."}

    Provide specific, actionable code fixes. Explain exactly what lines to change and why.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" }, 
      messages: [
        { 
          role: "system", 
          content: "You must strictly output JSON in this exact format: { \"fixes\": [\"Detailed fix instruction 1\", \"Detailed fix instruction 2\"] }" 
        },
        { 
          role: "user", 
          content: prompt 
        }
      ]
    });

    const parsedData = JSON.parse(response.choices[0].message.content);
    return parsedData.fixes;

  } catch (error) {
    console.error("LLM Error:", error.message);
    return ["Failed to generate AI fixes. Ensure the API key is valid."];
  }
}

module.exports = getFixes;