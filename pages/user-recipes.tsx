import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]";
import Layout from "../components/layout";
import { useState } from "react";

import type { GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";

type Recipe = {
  _id: string;
  content: string;
  title: string;
};

export default function ServerSidePage({ data }: { data: any }) {
  const initialRecipes = data && data.data.length !== 0 ? data.data[0].recipes : [];
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>(initialRecipes);

  async function deleteRecipeFromDb(index: number) {
    const testData = { index: index };

    try {
      const session = await getSession();
      if (session && session.user) {
        const userEmail = session.user.email;
        let res = await fetch(
          `${process.env.NEXT_PUBLIC_URL}/api/recipes?userEmail=${userEmail}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(testData),
          },
        );
        await res.json();

        // Now update current recipes saved on user interface
        const updatedRecipes = [...savedRecipes];
        updatedRecipes.splice(index, 1);
        setSavedRecipes(updatedRecipes);
      }
    } catch (err) {
      console.error("Error deleting recipe from MongoDB", err);
    }
  }

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center border border-gray-300 overflow-auto">
        {savedRecipes.length > 0 ? (
          savedRecipes.map((item: Recipe, i: number) => {
            return (
              <details key={i}>
                <summary className="cursor-pointer">{item.title}</summary>
                <h3 className="whitespace-pre-wrap">{item.content}</h3>
                <button onClick={() => deleteRecipeFromDb(i)}>
                  Test Delete
                </button>
              </details>
            );
          })
        ) : (
          <h2>
            No recipes saved! Generate a recipe and click save for it to appear
          </h2>
        )}
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (session && session.user) {
    const userEmail = session.user.email;
    let res = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/recipes?userEmail=${userEmail}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    let data = await res.json();
    return {
      props: {
        data,
        userEmail,
      },
    };
  }
  return {
    props: {
      data: null,
    },
  };
}
