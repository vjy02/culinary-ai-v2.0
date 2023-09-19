import clientPromise from "../../lib/mongodb"

export default async function handler(req, res) {
  const client = await clientPromise
  const db = client.db("user_recipes")
  const { userEmail } = req.query
  switch (req.method) {
    case "POST":
      let recipeObject = req.body
      console.log(recipeObject)
      let myPost = await db.collection("recipes").updateOne(
        { email: userEmail }, // Find the document by the user's email
        {
          $push: {
            recipes: {
              title: recipeObject.title,
              content: recipeObject.content
            }
          }
        }
      )
      res.json({ status: 200, modifiedCount: myPost.modifiedCount })
      break
    case "GET":
      const allPosts = await db.collection("recipes").find({email: userEmail}).limit(10).toArray();
      res.json({ status: 200, data: allPosts })
      break
    case "DELETE":
      let recipeId = req.body.recipeId
    
      let deleteResult = await db.collection("recipes").updateOne(
        { email: userEmail }, // Find the document by the user's email
        {
          $pull: {
            recipes: {
              _id: new client.ObjectId(recipeId)  
            }
          }
        }
      )
      res.json({ status: 200, modifiedCount: deleteResult.modifiedCount })
      break
  }
}

