import clientPromise from "../../lib/mongodb"

export default async function handler(req, res) {
  const client = await clientPromise
  const db = client.db("user_recipes")
  const { userEmail } = req.query
  switch (req.method) {
    case "POST":
      let bodyObject = JSON.parse(req.body);
      let myPost = await db.collection("recipes").insertOne(bodyObject);
      res.json(myPost.ops[0])
      break;
    case "GET":
      const allPosts = await db.collection("recipes").find({email: userEmail}).limit(10).toArray();
      res.json({ status: 200, data: allPosts })
      break
  }
}