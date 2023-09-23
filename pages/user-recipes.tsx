import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]";
import Layout from "../components/layout";
import { useState } from "react";

import type { GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

type Recipe = {
  _id: string;
  content: string;
  title: string;
};

export default function ServerSidePage({ data }: { data: any }) {
  const initialRecipes = data && data.data.length !== 0 ? data.data[0].recipes : [];
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>(initialRecipes);
  const [curRecipe, setRecipe] = useState<Recipe>(initialRecipes[0])

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
      <div className="flex items-start justify-between h-[80vh]">
        <div className="flex flex-col md:w-[40%] rounded-lg border border-gray-300">
          {savedRecipes.length > 0 ? (
            savedRecipes.map((item: Recipe, i: number) => {
              return (
                <div className="flex">
                  <button onClick={()=>{setRecipe(item)}}>{item.title}</button>
                  <button onClick={()=>deleteRecipeFromDb(i)}><FontAwesomeIcon icon={faTrashCan} /></button>
                </div>
              );
            })
          ) : (
            <h2>
              No recipes saved! Generate a recipe and click save for it to appear
            </h2>
          )}
        </div>
        <div className="h-[100%] md:w-[40%] ">
          <div className="rounded-lg border border-gray-300 md:w-[100%] md:overflow-auto md:max-h-[80vh]">
                <div className="whitespace-pre-wrap p-10">
                    <h2 className="text-xl xl:text-2xl font-bold">{curRecipe.title}</h2>
                    <p>{curRecipe.content.split('\n').splice(1, curRecipe.content.length - 1).join('\n')}</p>
                </div>
            </div>
        </div>
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
