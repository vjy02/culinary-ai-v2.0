import { getServerSession } from "next-auth/next"
import { authOptions } from "./api/auth/[...nextauth]"
import Layout from "../components/layout"
import { getSession } from "next-auth/react"

import type { GetServerSidePropsContext } from "next"
import type { Session } from "next-auth"


export default function ServerSidePage({ session: initialSession, data }: { session: Session, data: any }) {

  async function submitPrompt(){
    const testData = {"title": "Scrambled Eggs11","instructions": "Put eggs11"}
    const session = await getSession()
    try{
      console.log(session)
      if (session && session.user){
        console.log("OK")
        const userEmail = session.user.email
        let res = await fetch(`http://localhost:3000/api/recipes?userEmail=${userEmail}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(testData) 
        })
        await res.json()
      }
    }
    catch{
      console.log("ERROR")
    }
  }

  return (
    <Layout>
      <h1>User Recipes</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
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
        data
      }
    }
  }
  return {
    props: {
      data: null
    }
  }
}