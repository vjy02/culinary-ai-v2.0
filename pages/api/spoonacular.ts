import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  const input = req.query.input;

  if (!input) {
    res.status(400).json({ error: "input is required as a query parameter." });
    return;
  }

  try {
    const response = await fetch(
      `https://api.spoonacular.com/food/ingredients/autocomplete?apiKey=${process.env.SPOONACULAR_KEY}&query=${input}&number=15`,
    );

    if (!response.ok) {
      throw new Error("Failed to fetch Spoonacular API");
    }

    const data = await response.json();
    const results = data.map((suggestion: { name: string }) => suggestion.name);

    res.status(200).json(results);
  } catch (err) {
    console.error("Failed to fetch Spoonacular API", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
