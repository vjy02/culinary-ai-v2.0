import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse,) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { ingredients, diet } = req.body;

  const APIBody = {
    model: "gpt-3.5-turbo-0613",
    messages: [
    {
        role: "user",
        content:
            "Suggest 1 detailed recipe with specific quantities of each ingredients, using these ingredients:" +
            ingredients.join(", ") +
            `. Make sure the recipe is ${diet}, but don't name the recipe like ${diet} followed by recipe name.` +
            `. If I gave you no ingredients, think of some random ingredients to include.
                Return with the following format: recipe: recipe name, then an empty line then Ingredients header 
                followed by ingredient list then another empty line then numbered Instructions, seperate each instruction step with an empty line. Use Australian measurements.`,
    },],
    temperature: 0.7,
    max_tokens: 1000,
    top_p: 0.9,
    frequency_penalty: -0.2,
    presence_penalty: 0.2,
  };

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.OPENAI_KEY,
      },
      body: JSON.stringify(APIBody),
    });

    const data = await response.json();
    res.status(200).json(data.choices[0].message.content);
  } catch (err) {
    console.error("Failed to call OpenAi API", err);
    res.status(500).json({ error: "Failed to fetch recipe from OpenAI" });
  }
}