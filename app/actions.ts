"use server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeItem(base64Image: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: `Identify this item for a professional reseller.
              
              CRITICAL TASK: Determine the EXACT edition. For books like Taschen, check if it is the XXL/Collector's edition (high value) vs. the standard/40th anniversary edition (low value). 
              Use physical cues in the image (thickness, scale relative to hands/objects) to distinguish.

              Return ONLY a JSON object:
              - title: Full specific name (e.g. 'Taschen Surfing 1778-Today XXL Edition')
              - confidence: 0-100%
              - valueRange: Realistic range based on SOLD listings (e.g. '$800-$1,200')
              - platforms: Where to find high-end collectors
              - description: Note why this specific edition is valuable and how to verify it.` 
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
    return { title: "Error", valueRange: "N/A", description: "Error analyzing." };
  }
}