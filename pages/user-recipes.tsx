import { getServerSession } from "next-auth/next"
import { authOptions } from "./api/auth/[...nextauth]"
import Layout from "../components/layout"

import type { GetServerSidePropsContext } from "next"
import type { Session } from "next-auth"


export default function ServerSidePage({ data }: { data: any }) {

  return (
    <Layout>
      <h1>User Recipes</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <div>
        {data.data[0].recipes.map((item: { content: any }) => {
          return (<h3 className="whitespace-pre-wrap">{item.content}</h3>)
        })}
      </div>
    </Layout>
  )
}
export async function getServerSideProps(context: GetServerSidePropsContext) {

  const session = await getServerSession(context.req, context.res, authOptions)
  // Fetch data from your API endpoint defined in db.ts
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