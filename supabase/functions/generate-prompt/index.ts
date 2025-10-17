import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface GenerateRequest {
  projectType: string;
  targetAudience: string;
  painPoints: string;
  projectDescription: string;
  adaptiveAnswers: Record<string, any>;
  designPreferences: Record<string, any>;
  refinementInstructions?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const userId = user.id;

    const {
      projectType,
      targetAudience,
      painPoints,
      projectDescription,
      adaptiveAnswers,
      designPreferences,
      refinementInstructions,
    }: GenerateRequest = await req.json();

    // Add specific technical requirements based on project type
    let technicalRequirements = "";
    if (projectType === "mobile-app") {
      technicalRequirements = "\n- CRITICAL: Use Expo framework for mobile development. Mention Expo explicitly in the prompt.";
    } else if (projectType === "chrome-extension") {
      technicalRequirements = "\n- CRITICAL: Use Chrome Extension Manifest V3. Include content script patterns and permissions as needed.";
    }

    const metaPrompt = `You are an expert prompt engineer specializing in AI coding tools like Bolt.new. Generate a structured, production-ready first prompt based on the following user requirements.

**User Requirements:**
- Project Type: ${projectType}
- Target Audience: ${targetAudience}
- Pain Points: ${painPoints}
- Solution Description: ${projectDescription}
- Additional Context: ${JSON.stringify(adaptiveAnswers)}
- Design Preferences: ${JSON.stringify(designPreferences)}${technicalRequirements}
${refinementInstructions ? `\n- Refinement Instructions: ${refinementInstructions}` : ""}

**Instructions for generating the prompt:**

1. Follow the thelaunch.space format with these sections:
   - Objective (2-3 sentences describing what to build)
   - Target Audience (detailed description based on the provided audience info)
   - Design Principles (visual aesthetic, responsiveness, premium feel)
   - Functional Requirements (user stories in format: "<user_type> should be able to <action> so that <purpose>")
   - Business Logic (if applicable)

2. CRITICAL RULES:
   - Prioritize BREADTH over DEPTH - list many features briefly rather than few features in detail
   - The pain points provided should directly inform the functional requirements
   - Use clear user story format for all requirements
   - Do NOT over-specify technical implementation details
   - Focus on WHAT to build, not HOW to build it
   - Keep descriptions concise and actionable
   - Include responsive design requirements
   - Mention use of Tailwind CSS and React (or Expo for mobile apps)
   - For mobile apps: Explicitly require Expo framework
   - For Chrome extensions: Explicitly require Manifest V3 format

3. Structure the output as a clean, well-formatted prompt ready to paste into Bolt.new

4. Design section should specify:
   - Overall aesthetic (${designPreferences.style || "modern and clean"})
   - Color scheme (${designPreferences.colors || "appropriate for the project type"})
   - Typography approach
   - Spacing and layout principles
   - Mobile-first responsive design

5. Ensure the functional requirements directly address the pain points: ${painPoints}

Generate the prompt now:`;

    const openRouterResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("OPENROUTER_API_KEY")}`,
          "HTTP-Referer": "https://bolt.new",
          "X-Title": "Bolt.new Prompt Generator",
        },
        body: JSON.stringify({
          model: "anthropic/claude-3.5-sonnet",
          messages: [
            {
              role: "user",
              content: metaPrompt,
            },
          ],
        }),
      }
    );

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();
      throw new Error(`OpenRouter API error: ${errorText}`);
    }

    const openRouterData = await openRouterResponse.json();
    const generatedPrompt = openRouterData.choices[0].message.content;

    const { data: generation, error } = await supabaseAdmin
      .from("prompt_generations")
      .insert({
        user_id: userId,
        project_type: projectType,
        target_audience: targetAudience,
        pain_points: painPoints,
        project_description: projectDescription,
        adaptive_answers: adaptiveAnswers,
        design_preferences: designPreferences,
        generated_prompt: generatedPrompt,
      })
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({
        prompt: generatedPrompt,
        generationId: generation.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});