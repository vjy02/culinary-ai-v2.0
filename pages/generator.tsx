/*
    TODO (Last Updated: 22/09/2023)

    ✅ Handle API calls in api folder files to prevent API_KEY data from being accessible to users **IMPORTANT**
    ✅ Add removing ingredients on generator page
    ✅ Create some preset buttons for vegan, meat only, vegetarian, etc.
    ⏰ Set styling for saved recipes
    ⏰ Create functionality for print and diet options
    ❌ Print all saved recipes or certain recipe functionality
    ❌ Style and flesh out landing page
*/


import { useState, useEffect, ChangeEvent } from "react"
import Layout from "../components/layout"
import { getSession } from "next-auth/react"
import { TailSpin } from "react-loader-spinner"

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
            console.log(`${process.env.NEXT_PUBLIC_URL}/api/spoonacular?input=${input}`)
            const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/spoonacular?input=${input}`)
            
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
        const title = recipe.split('\n')[0].split(':')[1]
        const updatedRecipe = recipe.split('\n')[0].split(':')[1] + "\n" + recipe.split('\n').slice(1,recipe.split('\n').length).join('\n')
        const testData = {"title": title,"content": updatedRecipe}

        try{
            const session = await getSession()
            if (session && session.user){
                const userEmail = session.user.email
                let res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/recipes?userEmail=${userEmail}`, {
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/openai`, {
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
            <div className="lg:flex-row flex flex-col">
                <div 
                    id="generator-wrapper" 
                    className="flex flex-col justify-center items-center bg-white pb-10 lg:pb-0 lg:w-[50%] lg:h-[80vh] border-2 border-black-500 rounded-lg"
                >
                    <div 
                        id="input-wrapper" 
                        className="relative items-around justify-around flex flex-col md:flex-row h-[110vh] p-7 w-[90%] lg:h-[70%]"

                    >
                        <div id="search-wrapper" className="self-start flex items-start justify-between flex-col h-[15vh] lg:h-[40vh] lg:w-[40%]">
                            <input
                                type="text"
                                placeholder="Enter a food item"
                                value={input}
                                onChange={(e) => handleInput(e)}
                                className="py-2 px-3 rounded-lg border border-gray-300 mb-4 focus:outline-none focus:ring focus:ring-blue-500 lg:w-[70%]"
                            />
                            <div className="grid overflow-auto min-h-[100%] w-[70vw] lg:w-[90%] bg-white rounded-lg border border-gray-300 mt-1 p-2 space-y-2">
                                {suggestions.length > 0 && (
                                    <div className="flex flex-wrap gap-2 p-2">
                                        {suggestions.map((suggestion, i) => (
                                            <div
                                                className="bg-slate-100 w-fit px-3 py-2 hover:bg-green-100 cursor-pointer border border-gray-200 rounded shadow-sm"
                                                key={i}
                                                onClick={() => {
                                                    if (!(ingredients.includes(suggestion))){
                                                        setIngredients([...ingredients, suggestion])
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
                        </div>
                        <div id="ingredients" className="self-start flex items-start justify-between flex-col h-[15vh] lg:h-[40vh] lg:w-[50%]">
                            <h3 className="text-xl font-bold mb-4 lg:mb-8 lg:mt-0 lg:h-[70%]">Selected Items:</h3>
                            <div className="overflow-auto border border-gray-300 min-h-[100%] w-[70vw] lg:min-h-[100%] lg:w-[90%] bg-white rounded-lg">
                                <div className="grid overflow-auto  mt-1 p-2 space-y-2">
                                    {ingredients.length > 0 && (
                                        <div className="flex flex-wrap gap-2 p-2">
                                            {ingredients.map((item, i) => (
                                                <div 
                                                    key={i} 
                                                    className="bg-slate-100 w-fit h-fit px-3 py-2 hover:bg-red-100 cursor-pointer border border-gray-200 rounded shadow-sm"
                                                    onClick={() => {
                                                        const curList = [...ingredients];
                                                        curList.splice(curList.indexOf(item), 1);
                                                        console.log(curList);
                                                        setIngredients(curList);
                                                    }}
                                                >
                                                    {item}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="self-center flex flex-col justify-between lg:h-[80%] lg:mt-[4%]">
                                <button 
                                    className="py-2 px-4 lg:w-30 h-fit rounded-lg border border-gray-300"
                                >
                                    🌱 <br></br>Vegan
                                </button>
                                <button 
                                    className="py-2 px-4 lg:w-30 h-fit rounded-lg border border-gray-300"
                                >
                                    🥦 <br></br> Vegetarian
                                </button>
                                <button 
                                    className="py-2 px-4 lg:w-30 h-fit rounded-lg border border-gray-300"
                                >
                                    🐟 <br></br> Pescetarian
                                </button>
                                <button 
                                    className="py-2 px-4 lg:w-30 h-fit rounded-lg border border-gray-300"
                                >
                                    🥓 <br></br> Keto
                                </button>
                            </div>
                    </div>
                    <div className="flex flex-col lg:flex-row gap-7 w-[90%] lg:h-[20%] rounded-lg">
                        <button 
                            className="w-[80%] h-[80%] py-2 px-4 rounded-lg border border-gray-300 text-lg"
                            onClick={()=>{
                                setIngredients([])
                                fetchOpenApi()
                            }} 
                        >
                            🎲 <br></br> Random
                        </button>
                        <button 
                            className="w-[80%] h-[80%] py-2 px-4 rounded-lg border border-gray-300 text-lg"
                        >
                            🖨️ <br></br> Print
                        </button>
                        <button 
                            onClick={submitRecipeToDb} 
                            className="w-[80%] h-[80%] py-2 px-4 rounded-lg border border-gray-300 text-lg"
                        >
                            💾 <br></br>Save Recipe
                        </button>
                        <button 
                            onClick={fetchOpenApi} 
                            className="w-[80%] h-[80%] py-2 px-4 rounded-lg border border-gray-300 text-lg"
                        >
                            ⚙️ <br></br>Generate
                        </button>
                    </div>
                </div>
                <div className="flex justify-center items-center mt-10 lg:w-[50%] lg:mt-0">
                    <div 
                        id="recipe-wrapper" 
                        className="flex flex-col items-center gap-10 lg:self-start lg:w-[100%]"
                    >
                        {
                            !loading && !recipe &&(
                                <h4 className="whitespace-pre-wrap lg:w-[80%] lg:min-h-[80vh] rounded-lg border border-gray-300 p-10">
                                    <h2 className="text-xl font-bold">Example Recipe</h2>
                                    {"\nIngredients:\n- 2 units of main ingredient\n- 1 cup of secondary ingredient\n- 1/2 cup of flavor ingredient A\n- 1/2 teaspoon of spice A\n- 1/2 teaspoon of spice B\n- 1/4 teaspoon of seasoning A\n- 1/4 teaspoon of seasoning B\n- 2 units of binding ingredient\n- 1 cup of sauce ingredient\n- 1/2 cup of additional ingredient\n- Garnish ingredient, for garnish\n\nInstructions:\n1. Preheat the appliance to a specific temperature.\n2. In a container, mix secondary ingredient, flavor ingredient A, spice A, and spice B.\n3. Add seasoning A and seasoning B to the mixture and stir well.\n4. Dip each main ingredient into the binding ingredient, ensuring it's well-coated.\n5. Coat the main ingredient with the mixture from step 2.\n6. Cook for a set time.\n7. Pour sauce ingredient over the main ingredient.\n8. Sprinkle additional ingredient on top.\n9. Cook for an additional set time until golden brown.\n10. Garnish with garnish ingredient.\n11. Serve and enjoy!"}
                                </h4>
                            )
                        }
                        {loading && (
                            <div className="flex justify-center items-center lg:w-[80%] lg:min-h-[80vh] rounded-lg border border-gray-300 p-10">
                                <TailSpin
                                    color="#c2c2c2"
                                    height={100}
                                    width={100}
                                />
                            </div>
                        )}
                        {recipe && (
                                <div className="whitespace-pre-wrap rounded-lg border border-gray-300 p-10 lg:w-[80%] lg:overflow-auto lg:h-[80vh]">
                                    <h2 className="text-xl font-bold">{recipe.split('\n')[0].split(':')[1]}</h2>
                                    <p>{recipe.split('\n').splice(1,recipe.length-1).join('\n')}</p>
                                </div>
                        )}
                    </div>
                </div>

            </div>
        </Layout>
    )
}
