import { useState, useEffect, ChangeEvent } from "react"
import Layout from "../components/layout"
import { getSession } from "next-auth/react"

export default function GeneratorPage() {

    const [input, setInput] = useState<string>('')
    const [suggestions, setSuggestions] = useState<Array<string>>([])
    const [ingredients, addingredient] = useState<Array<string>>([])
    const [recipe, setRecipe] = useState<string>('')

    useEffect(() => {
        if (input !== ""){
            callSpoonacularAPI();
        }
        else{
            setSuggestions([])
        }
    }, [input])


    const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value
        setInput(inputValue)
        if (!(/^[A-Za-z ]*$/.test(inputValue))) {
            setInput(inputValue.substring(0, inputValue.length - 1))
            alert('Please enter only letters or space');
        } 
    }

    async function callSpoonacularAPI() {
        if (input) {
        try{
            const response = await fetch(`https://api.spoonacular.com/food/ingredients/autocomplete?apiKey=923b291dff704e07b3f2f0db15f83634&query=${input}&number=5`,
                {
                    method: 'GET',
                })
                    const data = await response.json()
                    const results = data.map((suggestion: { name: String }) => (
                    suggestion.name
            ))
            setSuggestions(results);
        }
        catch(err) {
            console.error("Failed to fetch Spoonacular API", err)
        }
        } else {
        setSuggestions([]);
        }
    }   


    async function submitRecipeToDb(){
        const titleRegex = /^Recipe Name: (.+?)$/m
        const match = recipe.match(titleRegex)

        const title = match ? match[1] : ''  // if match found, title will have the recipe name, otherwise it'll be an empty string

        const testData = {"title": title,"content": recipe}
        console.log(testData)
        try{
        const session = await getSession()
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

    async function fetchOpenApi(){
        const APIBody = {
          model: 'gpt-3.5-turbo-0613',
          messages:[{"role":"user","content":
            'Suggest 1 detailed recipe with specific quantities of each ingredients, using these ingredients:' +
            ingredients.join(' ') +
            //'. Also not suggest any of these banned recipes, \
            //each of these banned recipes are seperated by a "//" \
            //: ' + recipes + 'END OF LIST.\
            'If you cant think of any recipe then return a recipe that uses at least one of the listed ingredients. \
            Return with the following format:\
            The recipe name, then an empty line then ingredients header followed by ingredient \
            list then another empty line then numbered instructions. Do not\
            include other ingredients at the beginning of ur answer.'}],
          temperature: 0,
          max_tokens: 1000,
          top_p: 1.0,
          frequency_penalty: 0.0,
          presence_penalty: 0.0,
        }
    
        try{
            const key = process.env.NEXT_PUBLIC_OPENAI_KEY
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + key,
                },
                body: JSON.stringify(APIBody),
            })
            const data = await response.json()

            setRecipe(data.choices[0].message.content)

        }
        catch(err){
          console.error("Failed to call OpenAi API", err)
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
                    <div id="ingredients" className="absolute right-20 max-w-[40%]">
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
