"use server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeItem(base64Image: string) {
  // 1. Safety check to prevent Vercel build crash
  if (!process.env.OPENAI_API_KEY) {
    return { title: "Configuration Error", valueRange: "N/A", description: "API Key missing in Vercel." };
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", 
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: `Identify the item for a reseller. 
                     Use your internal search capabilities to find CURRENT SOLD prices on eBay and other marketplaces.
                     Return ONLY a JSON object:
                     - title: Specific brand/model
                     - confidence: 0-100%
                     - valueRange: Real sold price range (e.g. '$20-$35')
                     - platforms: Best 3 platforms
                     - description: Mention that you verified this against current market listings.` 
            },
            {
              type: "image_url",
              image_url: { url: base64Image },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content || "{}");
  } catch (error) {
    console.error("AI Error:", error);
    return { title: "Error", valueRange: "N/A", description: "Analysis failed." };
  }
}