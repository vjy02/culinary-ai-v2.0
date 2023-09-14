import { useState, useEffect, ChangeEvent } from "react";
import Layout from "../components/layout"
import { getSession } from "next-auth/react"
import type { Session } from "next-auth"

export default function GeneratorPage() {

    const [input, setInput] = useState<String | ''>('')
    const [suggestions, setSuggestions] = useState<Array<String>>([])
    const [ingredients, addingredient] = useState<Array<String>>([])
    const [recipe, setRecipe] = useState<String>('')

    useEffect(() => {
        if (input !== ""){
        callSpoonacularAPI();
        }
        else{
        setSuggestions([])
        }
    }, [input])


    const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value;
        if (/^[A-Za-z ]*$/.test(inputValue)) {
        setInput(inputValue);
        } else {
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
        const testData = {"title": "Scrambled Eggs11","instructions": "Put eggs12"}
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
            "Recipe Name: (insert recipe name)", then an empty line then ingredients header followed by ingredient \
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
            <h1>Recipe Generator</h1>
            <div id="generator-wrapper">
                <div id="input-wrapper">
                    <div id="search-wrapper">
                        <input
                            type="text"
                            placeholder="Enter a food item"
                            onChange={(e)=>handleInput(e)}
                            />
                        <button>Add</button>
                    </div>
                    {suggestions.length > 0 && (
                        <div>
                            {suggestions.map((suggestion, i) => (
                            <div
                                key = {i}
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
                    <div id="ingredients">
                        {ingredients.length > 0 && (
                            <div>
                                {ingredients.map((item, i) => (
                                <div
                                    key = {i}
                                >
                                    {item}
                                </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <button onClick={fetchOpenApi}>Generate</button>
                </div>
                <div id="recipe-wrapper">
                    <h3 className="whitespace-pre-wrap">{recipe}</h3>
                    <button onClick={submitRecipeToDb}>Test Submit</button>
                </div>
            </div>
        </Layout>
    )
}
