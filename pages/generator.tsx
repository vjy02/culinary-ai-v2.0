/*
    TODO (Last Updated: 20/09/2023)

    ✅ Handle API calls in api folder files to prevent API_KEY data from being accessible to users **IMPORTANT**
    ❌ Set styling for saved recipes
    ❌ Print all saved recipes or certain recipe functionality
    ❌ Style and flesh out landing page
*/


import { useState, useEffect, ChangeEvent } from "react"
import Layout from "../components/layout"
import { getSession } from "next-auth/react"

export default function GeneratorPage() {

    const [input, setInput] = useState<string>('')
    const [suggestions, setSuggestions] = useState<Array<string>>([])
    const [ingredients, addingredient] = useState<Array<string>>([])
    const [recipe, setRecipe] = useState<string>('')

    useEffect(() => {
        getSuggestedIngredients()
    }, [input])


    function handleInput (event: ChangeEvent<HTMLInputElement>) {
        const inputValue = event.target.value
        setInput(inputValue)
        if (!(/^[A-Za-z ]*$/.test(inputValue))) {
            setInput(inputValue.substring(0, inputValue.length - 1))
            alert('Please enter only letters or space');
        } 
    }

    async function getSuggestedIngredients() {

        if (input){
            const res = await fetch(`http://localhost:3000/api/spoonacular?input=${input}`)
            
            if (!res.ok) {
                console.log("failed")
                throw new Error('Failed to fetch ingredient suggestions')
            }
            const suggestions = await res.json()
            setSuggestions(suggestions)
        } else {
            return []
        }
    }
    


    async function submitRecipeToDb(){
        const titleRegex = /^Recipe Name: (.+?)$/m
        const match = recipe.match(titleRegex)
        const title = match ? match[1] : ''  // if match found, title will have the recipe name, otherwise it'll be an empty string
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
        catch{
         console.log("ERROR")
        }
    }

    async function fetchOpenApi() {
        try {
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
    }
    
    return (
        <Layout>
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
                                            addingredient([...ingredients, suggestion])
                                            setSuggestions([])
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
                                        <li key={i} className="flex items-center mt-2">
                                            {item}
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
            {recipe && (
                <div 
                    id="recipe-wrapper" 
                    className="flex flex-col items-center self-center"
                >
                    <h3 className="whitespace-pre-wrap">{recipe}</h3>
                    <button onClick={submitRecipeToDb} className="py-2 px-4 rounded-lg border border-gray-300">Test Submit</button>
                </div>
            )}
        </Layout>
    )
}
