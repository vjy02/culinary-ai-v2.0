import { getServerSession } from "next-auth/next"
import { authOptions } from "./api/auth/[...nextauth]"
import Layout from "../components/layout"

import type { GetServerSidePropsContext } from "next"

type Recipe = {
  content: string
  title: string
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
      <div className="flex flex-col items-center justify-center border border-gray-300 overflow-auto">
        {savedRecipes !== null ? (savedRecipes.map((item: { content: string, title: string}) => {
          return (
            <details>
              <summary className="cursor-pointer">{item.title}</summary>
              <h3 className="whitespace-pre-wrap">{item.content}</h3>
            </details>
          )
        }))
        :
        <h2>{noRecipes}</h2>
        }
      </div>
    </Layout>
  )
}
export async function getServerSideProps(context: GetServerSidePropsContext) {

  const session = await getServerSession(context.req, context.res, authOptions)

  if (session && session.user){
    const userEmail = session.user.email
    let res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/recipes?userEmail=${userEmail}`, {
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