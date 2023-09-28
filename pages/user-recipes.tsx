import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]";
import Layout from "../components/layout";
import hollowStar from "../public/images/hollowStar.svg";

import type { GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";
import { faStar, faTrashCan } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useState } from "react";
import Image from 'next/image';
import { useEffect } from 'react';

type Recipe = {
  _id: string;
  content: string;
  title: string;
  isFavorite: boolean;
};

export default function ServerSidePage({ data }: { data: any }) {
  const initialRecipes = data && data.data.length !== 0 ? data.data[0].recipes : [];
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>(initialRecipes);
  const [curRecipe, setRecipe] = useState<Recipe>(initialRecipes[0])

  useEffect(() => {
      console.log('Component re-rendered:', savedRecipes); // Log the entire savedRecipes state upon each re-render
  }, [savedRecipes]);


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
        
        if (res.ok){
          // Now update current recipes saved on user interface
          const updatedRecipes = [...savedRecipes];
          updatedRecipes.splice(index, 1);
          setSavedRecipes(updatedRecipes);
        }
        else {
          console.error('Failed to delete recipe');
        }
      }
    } 
    catch (err) {
      console.error("Error deleting recipe from MongoDB", err);
    }
  }

  async function toggleFavoriteRecipeFromDb(index: number) {
    const testData = { index: index };

    try {
      const session = await getSession();
      if (session && session.user) {
        const userEmail = session.user.email;
        let res = await fetch(
          `${process.env.NEXT_PUBLIC_URL}/api/recipes?userEmail=${userEmail}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(testData),
          },
        );
        const data = await res.json();
        if (res.ok) {
          // Now update current recipes saved on user interface
          const updatedRecipes = [...savedRecipes];
          updatedRecipes[index].isFavorite = data.isFavorite;
          setSavedRecipes(updatedRecipes);
        }
        else {
          console.error('Failed to toggle recipe favorite state');
        }
      }
    } 
    catch (err) {
      console.error("Error patching recipe from MongoDB", err);
    }
  }

  return (
    <Layout>
      <div className="flex flex-col md:flex-row items-between justify-between h-[160vh] md:h-[80vh]">
        <div className="flex overflow-auto gap-3 flex-col items-center w-[100%] h-[25%] md:h-[100%] md:w-[40%] pt-4 md:pt-6 rounded-lg border border-gray-300">
          {savedRecipes.length > 0 ? (
            savedRecipes.map((item: Recipe, i: number) => {
              return (
                  <div className="flex justify-between w-[90%] max-w-[90%] border p-2 border-grey-300 md:w-[90%] md:max-w-[90%]">
                    <button onClick={() => { setRecipe(item); } }>{item.title}</button>
                    <div className="flex justify-between min-w-[15%] w-[15%] md:w-[10%] md:min-w-[10%]">
                      <button onClick={() => toggleFavoriteRecipeFromDb(i)}>{item.isFavorite ? (<FontAwesomeIcon icon={faStar} />):(<Image src={hollowStar} alt="not favorited" />)}</button>
                      <button onClick={() => deleteRecipeFromDb(i)}><FontAwesomeIcon icon={faTrashCan} /></button>
                    </div>
                  </div>
                );
              })
            ) : (
              <h2>
                No recipes saved! Generate a recipe and click save for it to appear
              </h2>
            )}
        </div>
        <div className="max-h-[70%] md:w-[40%] ">
            {savedRecipes.length > 0 ? (
            <div className="rounded-lg border border-gray-300 md:w-[100%] md:overflow-auto md:max-h-[80vh]">
              <div className="whitespace-pre-wrap p-10">
                <h2 className="text-xl xl:text-2xl font-bold">{curRecipe.title}</h2>
                <p>{curRecipe.content.split('\n').splice(1, curRecipe.content.length - 1).join('\n')}</p>
              </div>
            </div>
            ):
            (
            <div className="rounded-lg border border-gray-300 md:w-[100%] md:overflow-auto h-[80vh] flex items-center justify-center">
                <h1 className="text-xl xl:text-3xl font-bold">No Saved Recipes!</h1>
            </div>
            )}
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
