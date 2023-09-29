import { Configuration, OpenAIApi } from 'openai-edge';
import type { NextApiRequest, NextApiResponse } from 'next';

// Create an OpenAI API client
const config = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(config);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { ingredients, diet } = req.body;

  try {
    // Ask OpenAI for a streaming completion given the ingredients and diet
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      stream: true,
      messages: [
        {
          role: 'user',
          content:  'Suggest 1 detailed recipe with specific quantities of each ingredients, using these ingredients:' +
          ingredients.join(', ') +
          `. Make sure the recipe is ${diet}, but don't name the recipe like ${diet} followed by recipe name.` +
          `. If I gave you no ingredients, think of some random ingredients to include.
                Return with the following format: recipe: recipe name, then an empty line then Ingredients header 
                followed by ingredient list then another empty line then numbered Instructions, separate each instruction step with an empty line. Use Australian measurements.`,
        },
      ],
    });

    // Convert the response into a friendly text-stream
    const stream = response.body; // Adjust this line based on how the 'openai-edge' package provides the stream
    if (stream == null){
      res.status(500).json({ error: 'Failed to fetch recipe from OpenAI' });
      return
    }
    
    // Read the stream and send chunks to the client
    const reader = stream.getReader();
    let result = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      result += new TextDecoder().decode(value);
    }
    console.log(result)
    res.status(200).send(result);
  } catch (err) {
    console.error('Failed to call OpenAI API', err);
    res.status(500).json({ error: 'Failed to fetch recipe from OpenAI' });
  }
}
