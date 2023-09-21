/*
    TODO (Last Updated: 20/09/2023)

    ✅ Handle API calls in api folder files to prevent API_KEY data from being accessible to users **IMPORTANT**
    ❌ Add removing ingredients on generator page
    ❌ Set styling for saved recipes
    ❌ Print all saved recipes or certain recipe functionality
    ❌ Style and flesh out landing page
*/


import { useState, useEffect, ChangeEvent } from "react"
import Layout from "../components/layout"
import { getSession } from "next-auth/react"
import { Puff } from "react-loader-spinner"

export default function GeneratorPage() {

    const [input, setInput] = useState<string>('')
    const [suggestions, setSuggestions] = useState<Array<string>>([])
    const [ingredients, setIngredients] = useState<Array<string>>([])
    const [recipe, setRecipe] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)

    useEffect(() => {
        getSuggestedIngredients()
    }, [input])


    function handleInput (event: ChangeEvent<HTMLInputElement>) {
        const inputValue = event.target.value
        setInput(inputValue)
        if (!(/^[A-Za-z ]*$/.test(inputValue))) {
            setInput(inputValue.substring(0, inputValue.length - 1))
            alert('Please enter only letters or space')
        } 
    }

    async function getSuggestedIngredients() {

        if (input){
            const res = await fetch(`http://localhost:3000/api/spoonacular?input=${input}`)
            
            if (!res.ok) {
                throw new Error('Failed to fetch ingredient suggestions')
            }
            const suggestions = await res.json()
            setSuggestions(suggestions)
        } else {
            setSuggestions([])
        }
    }

    async function submitRecipeToDb(){
        const title = recipe.split('\n')[0]
        const testData = {"title": title,"content": recipe}

        try{
            const session = await getSession()
            if (session && session.user){
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
        catch (err) {
            console.error("Error posting recipe to MongoDB", err)
        }
    }

    async function fetchOpenApi() {
        try {
            setRecipe('')
            setLoading(true)
            const res = await fetch("http://localhost:3000/api/openai", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ingredients: ingredients }),
            })
    
            if (!res.ok) {
                throw new Error('Failed to fetch from server-side API')
            }
    
            const recipe = await res.json()
            setRecipe(recipe)
        } catch (err) {
            console.error("Error fetching recipe from server-side API", err)
        }
        setLoading(false)
    }
    
    return (
        <Layout>
            <div>
                <div 
                    id="generator-wrapper" 
                    className="flex flex-col min-h-[40vh] justify-between ml-auto border-2 border-black-500 rounded-lg p-7 pb-2 bg-white"
                >
                    <div 
                        id="input-wrapper" 
                        className="relative justify-between flex flex-col h-[20vh]"
                    >
                        <div id="search-wrapper" className="relative flex items-center">
                            <input
                                type="text"
                                placeholder="Enter a food item"
                                value={input}
                                onChange={(e) => handleInput(e)}
                                className="py-2 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring focus:ring-blue-500"
                            />
                            {suggestions.length > 0 && (
                                <div className="suggestions absolute top-9 left-0 bg-white rounded-lg border border-gray-300 mt-1 ">
                                    {suggestions.map((suggestion, i) => (
                                        <div
                                            className="bg-slate-100 px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                            key={i}
                                            onClick={() => {
                                                if (!(ingredients.includes(suggestion))){
                                                    setIngredients([...ingredients, suggestion])
                                                    setInput("")
                                                    setSuggestions([])
                                                }
                                                else{
                                                    alert("Duplicate ingredient!")
                                                }
                                            }}
                                        >
                                            {suggestion}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div id="ingredients" className="absolute left-80 max-w-[40%]">
                            <h3 className="text-xl font-bold mb-2">Selected Items:</h3>
                            {ingredients.length > 0 && (
                                <div className="grid">
                                    <ul className="list-disc list-inside mb-4">
                                        {ingredients.map((item, i) => (
                                            <li key={i} className="flex items-center mt-2 justify-between">
                                                {item}
                                                <div 
                                                    className="cursor-pointer"
                                                    onClick={()=>{
                                                        const curList = [...ingredients]
                                                        curList.splice(curList.indexOf(item), 1)
                                                        console.log(curList)
                                                        setIngredients(curList)
                                                    }}
                                                >
                                                    ❌
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                    <button 
                        onClick={fetchOpenApi} 
                        className="place-self-center py-2 px-4 rounded-lg mb-4 rounded-lg border border-gray-300"
                    >
                        Generate
                    </button>
                </div>
                <div className="flex justify-center items-center w-full h-full mt-10">
                    {loading && (
                            <div className="flex justify-center items-end mt-20">
                                <Puff
                                color="#85f876"
                                height={100}
                                width={100}
                                />
                            </div>)
                    }
                    {recipe && (
                        <div 
                            id="recipe-wrapper" 
                            className="flex flex-col items-center self-center w-3/4 p-10 rounded-lg border border-gray-300 gap-10"
                        >
                            <h3 className="whitespace-pre-wrap">{recipe}</h3>
                            <button onClick={submitRecipeToDb} className="py-2 px-4 rounded-lg border border-gray-300">Test Submit</button>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    )
}
