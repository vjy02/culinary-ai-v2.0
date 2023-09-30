import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]";
import Layout from "../components/layout";
import hollowStar from "../public/images/hollowStar.svg";

import type { GetServerSidePropsContext } from "next";
import { getSession, useSession } from "next-auth/react";
import { faStar, faTrashCan } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect, useState } from "react";
import Image from 'next/image';


type Recipe = {
  _id: string;
  content: string;
  title: string;
  isFavorite: boolean;
};

export default function ServerSidePage({ data }: { data: any }) {
  const initialRecipes = data ? data.data[0].recipes : [];
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>(initialRecipes);
  const [curRecipe, setRecipe] = useState<Recipe>(initialRecipes[0])
  const { data: session } = useSession();

  useEffect(() => {
    if (session && session.user && session.user.email) {
      const fetchRecipes = async () => {
        try {
          const response = await fetch(`/api/recipes?userEmail=${session.user?.email}`);
          if (!response.ok) {
            throw new Error('Failed to fetch recipes');
          }
          const data = await response.json();
          setRecipe(data.data[0].recipes[0])
          setSavedRecipes(data.data[0]?.recipes || []);
        } catch (error) {
          console.error('Error fetching recipes:', error);
        }
      };

      fetchRecipes();
    }
  }, [session]);

  async function deleteRecipeFromDb(index: number) {
    const testData = { index: index };
    const tempUpdatedRecipes = [...savedRecipes]
    const updatedRecipes = [...savedRecipes];
    updatedRecipes.splice(index, 1);
    setSavedRecipes(updatedRecipes);

    try {
      const session = await getSession();
      if (session && session.user) {
        const userEmail = session.user.email;
        let res = await fetch(
          `/api/recipes?userEmail=${userEmail}`,
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
          const updatedRecipes = tempUpdatedRecipes
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
      const updatedRecipes = [...savedRecipes];
      updatedRecipes[index].isFavorite = updatedRecipes[index].isFavorite ? false : true;
      setSavedRecipes(updatedRecipes);
      if (session && session.user) {
        const userEmail = session.user.email;

        let res = await fetch(
          `/api/recipes?userEmail=${userEmail}`,
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
          // Now update to DB state, this will revert if failed
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
      <div className="flex flex-col md:flex-row items-between justify-between h-[160vh] md:h-[75vh]">
        <div className="flex gap-3 flex-col items-center w-[100%] h-[25%] md:h-[100%] md:w-[50%] pt-4 md:pt-6 rounded-lg border border-gray-300">
          {savedRecipes.length > 0 ? (
            <div className="flex justify-between items-between gap-10 w-[90%] h-[95%]">
              <div className="flex flex-col gap-5 w-[90%]">
                <h1 className="text-xl xl:text-2xl font-bold">Favorites</h1>
                <div className="border border-gray-300 flex flex-col items-center max-h-[63vh] min-h-[63vh] overflow-auto">
                  {savedRecipes.map((item: Recipe, i: number) => {
                    if (item.isFavorite){
                      return (
                        <div className="flex justify-between border p-2 border-grey-300 w-[100%]">
                          <div className="flex-1 truncate"> 
                            <button 
                              className="" 
                              onClick={() => { setRecipe(item); } }
                              style={{ maxWidth: 'calc(100% - 40px)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} // Added styles for ellipsis
                            >
                              {item.title}
                            </button>
                          </div>
                          <div className="flex justify-between min-w-[15%] w-[15%] md:w-[12%] md:min-w-[12%]">
                            <button onClick={() => toggleFavoriteRecipeFromDb(i)}>
                              {item.isFavorite ? (<FontAwesomeIcon icon={faStar} />) : (<Image src={hollowStar} alt="not favorited" />)}
                            </button>
                            <button onClick={() => deleteRecipeFromDb(i)}>
                              <FontAwesomeIcon icon={faTrashCan} />
                            </button>
                          </div>
                        </div>
                      )
                    }})
                  }
                </div>
              </div>
              <div className="flex flex-col gap-5 w-[90%]">
                <h1 className="text-xl xl:text-2xl font-bold">All Recipes</h1>
                <div className="border border-gray-300 flex flex-col items-center max-h-[63vh] min-h-[63vh] overflow-auto">
                  {savedRecipes.map((item: Recipe, i: number) => {
                  return (
                    <div className="flex justify-between border p-2 border-grey-300 w-[100%]">
                      <div className="flex-1 truncate"> 
                        <button 
                          className="" 
                          onClick={() => { setRecipe(item); } }
                          style={{ maxWidth: 'calc(100% - 40px)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} // Added styles for ellipsis
                        >
                          {item.title}
                        </button>
                      </div>
                      <div className="flex justify-between min-w-[15%] w-[15%] md:w-[12%] md:min-w-[12%]">
                        <button onClick={() => toggleFavoriteRecipeFromDb(i)}>
                          {item.isFavorite ? (<FontAwesomeIcon icon={faStar} />) : (<Image src={hollowStar} alt="not favorited" />)}
                        </button>
                        <button onClick={() => deleteRecipeFromDb(i)}>
                          <FontAwesomeIcon icon={faTrashCan} />
                        </button>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            </div>
            ) : (
              <h2>
                No recipes saved! Generate a recipe and click save for it to appear
              </h2>
            )}
        </div>
        <div className="max-h-[70%] md:w-[40%] ">
            {savedRecipes.length > 0 ? (
            <div className="rounded-lg border border-gray-300 md:w-[100%] md:overflow-auto md:max-h-[75vh]">
              <div className="whitespace-pre-wrap p-10">
                <h2 className="text-xl xl:text-2xl font-bold">{curRecipe.title}</h2>
                <p>{curRecipe.content.split('\n').splice(1, curRecipe.content.length - 1).join('\n')}</p>
              </div>
            </div>
            ):
            (
            <div className="rounded-lg border border-gray-300 md:w-[100%] md:overflow-auto h-[75vh] flex items-center justify-center">
                <h1 className="text-xl xl:text-3xl font-bold">No Saved Recipes!</h1>
            </div>
            )}
          </div>
      </div>
    </Layout>
  );
}

