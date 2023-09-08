import { getServerSession } from "next-auth/next"
import { authOptions } from "./api/auth/[...nextauth]"
import Layout from "../components/layout"

import type { GetServerSidePropsContext } from "next"
import type { Session } from "next-auth"

export default function ServerSidePage({ session, data }: { session: Session, data: any }) {
  // As this page uses Server Side Rendering, the `session` will be already
  // populated on render without needing to go through a loading stage.
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
      <pre>{JSON.stringify(session, null, 2)}</pre>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </Layout>
  )
}
export async function getServerSideProps(context: GetServerSidePropsContext) {
  try {
    const session = await getServerSession(context.req, context.res, authOptions);
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
  } catch (error) {
    return {
      props: {
        session: null, // Handle the error gracefully
        data: null,
      },
    }
  }
}