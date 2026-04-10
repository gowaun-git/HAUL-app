"use server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeItem(base64Image: string) {
  try {
    // Note: We use a search-capable model here
    const response = await openai.chat.completions.create({
      model: "gpt-4o-search-preview", 
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: `1. Identify the specific item in this photo.
                     2. Use the search tool to find CURRENT SOLD prices on eBay, Mercari, and Poshmark for this exact model.
                     3. Distinguish between 'Listed' prices and 'Sold' prices.
                     4. Return ONLY a JSON object:
                        - title: Specific brand/model
                        - confidence: 0-100%
                        - valueRange: Real sold price range (e.g. '$45-$60')
                        - platforms: Best 3 platforms for this item
                        - description: A tip on how you verified the price via search.` 
            },
            {
              type: "image_url",
              image_url: { url: base64Image },
            },
          ],
        },
      ],
      // This is the magic "switch" that lets the AI use the internet
      tools: [{ type: "web_search" }], 
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content || "{}");
  } catch (error) {
    console.error("AI Error:", error);
    return { title: "Error", valueRange: "N/A", description: "Search failed. Check API credits." };
  }
}