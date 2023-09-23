import { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../lib/mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = await clientPromise
  const db = client.db("user_recipes")
  const { userEmail } = req.query

  switch (req.method) {
    case "POST":
      const recipeObject: { title: string; content: string } = req.body
  
      const myPost = await db.collection("recipes").updateOne(
          { email: userEmail as string },
          {
              $setOnInsert: { email: userEmail as string },  // Set the email on insert if the document is new
              $push: {
                  recipes: {
                      title: recipeObject.title,
                      content: recipeObject.content
                  }
              }
          },
          { upsert: true }  // This option will insert a new document if the email doesn't exist
      )
  
      res.json({ status: 200, modifiedCount: myPost.modifiedCount })
      break
  

    case "GET":
      const allPosts = await db.collection("recipes").find({ email: userEmail as string }).limit(10).toArray()
      res.json({ status: 200, data: allPosts })
      break

      case "DELETE":
        const { index } = req.body
    
        // First, set the recipe at the specified index to null
        const unsetResult = await db.collection("recipes").updateOne(
            { email: userEmail as string },
            {
                $unset: {
                    [`recipes.${index}`]: 1
                }
            }
        )
    
        // Then, remove the null value
        const pullResult = await db.collection("recipes").updateOne(
            { email: userEmail as string },
            {
                $pull: {
                    recipes: null
                }
            }
        )
    
        if (pullResult.modifiedCount === 0) {
            res.json({ status: 404, message: "Recipe not found or not deleted." });
        } else {
            res.json({ status: 200, message: "Recipe deleted successfully." });
        }
        break
    }    
}
