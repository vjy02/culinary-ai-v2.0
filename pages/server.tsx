import { getServerSession } from "next-auth/next"
import { authOptions } from "./api/auth/[...nextauth]"
import Layout from "../components/layout"
import { getSession } from "next-auth/react"
import { useEffect, useState } from "react"

import type { GetServerSidePropsContext } from "next"
import type { Session } from "next-auth"


export default function ServerSidePage({ session: initialSession, data }: { session: Session, data: any }) {
  const [session, setSession] = useState<Session | null>(initialSession)

  useEffect(() => {
    // Fetch the session client-side and update the state
    getSession().then(session => {
      setSession(session);
    });
  }, []);

  async function submitPrompt(){
    const testData = {"title": "Scrambled Eggs11","instructions": "Put eggs11"}
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
      <h1>Test</h1>
      <p>
        This page uses the <strong>getServerSession()</strong> method in{" "}
        <strong>getServerSideProps()</strong>.
      </p>
      <p>
        Using <strong>getServerSession()</strong> in{" "}
        <strong>getServerSideProps()</strong> is the recommended approach if you
        need to support Server Side Rendering with authentication.
      </p>
      <p>
        The advantage of Server Side Rendering is this page does not require
        client side JavaScript.
      </p>
      <p>
        The disadvantage of Server Side Rendering is that this page is slower to
        render.
      </p>
      <button onClick={submitPrompt}>Test Submit</button>
      <pre>{JSON.stringify(session, null, 2)}</pre>
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
        session,
        data,
      },
    }
  }
  return {
    props: {
      session: null, // Handle the error gracefully
      data: null,
    },
  }
}