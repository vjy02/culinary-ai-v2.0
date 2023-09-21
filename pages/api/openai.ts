import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).end()
    }

    const { ingredients } = req.body

    const APIBody = {
        model: 'gpt-3.5-turbo-0613',
        messages: [{
            "role": "user",
            "content": 'Suggest 1 detailed recipe with specific quantities of each ingredients, using these ingredients:' 
            + ingredients.join(' ') +
             `If you cant think of any recipe then return a recipe that uses at least one of the listed ingredients.
              Return with the following format: Only the recipe name (no prefix please), then an empty line then ingredients header 
              followed by ingredient list then another empty line then numbered instructions. Do not include 
              other ingredients at the beginning of your answer.`

        }],
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 0.9,
        frequency_penalty: -0.2,
        presence_penalty: 0.2,
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + process.env.OPENAI_KEY,
            },
            body: JSON.stringify(APIBody),
        })

        const data = await response.json()
        res.status(200).json(data.choices[0].message.content)
    } catch (err) {
        console.error("Failed to call OpenAi API", err)
        res.status(500).json({ error: 'Failed to fetch recipe from OpenAI' })
    }
}
