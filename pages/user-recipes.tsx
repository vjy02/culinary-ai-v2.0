import { getServerSession } from "next-auth/next"
import { authOptions } from "./api/auth/[...nextauth]"
import Layout from "../components/layout"

import type { GetServerSidePropsContext } from "next"

type Recipe = {
  content: string
}

export default function ServerSidePage({ data }: { data: any }) {
  let savedRecipes: Recipe[] | null = null
  let noRecipes: string | null = null

  if (data !== null && data.data.length !== 0){
    savedRecipes = data.data[0].recipes
  }
  else{
    noRecipes = "No recipes saved! Generate a recipe and click save for it to appear"
  }

  return (
    <Layout>
      <h1>User Recipes</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <div>
        {savedRecipes !== null ? (savedRecipes.map((item: { content: string}) => {
          return (<h3 className="whitespace-pre-wrap">{item.content}</h3>)
        }))
        :
        noRecipes
        }
      </div>
    </Layout>
  )
}
export async function getServerSideProps(context: GetServerSidePropsContext) {

  const session = await getServerSession(context.req, context.res, authOptions)

  if (session && session.user){
    const userEmail = session.user.email
    let res = await fetch(`http://localhost:3000/api/recipes?userEmail=${userEmail}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
    let data = await res.json()
    return {
      props: {
        data,
        userEmail
      }
    }
  }
  return {
    props: {
      data: null
    }
  }
}