import { useState, useEffect, ChangeEvent } from "react";
import Layout from "../components/layout"
import { getSession } from "next-auth/react"
import type { Session } from "next-auth"

export default function GeneratorPage() {

    const [input, setInput] = useState<String | ''>('')
    const [suggestions, setSuggestions] = useState<Array<String>>([])
    const [ingridients, addIngridient] = useState<Array<String>>([])

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


    async function submitPrompt(){
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
                                addIngridient([...ingridients, suggestion])
                                setSuggestions([])
                            }}
                        >
                            {suggestion}
                        </div>
                        ))}
                    </div>
                )}
                <div id="ingridients">
                    {ingridients.length > 0 && (
                        <div>
                            {ingridients.map((item, i) => (
                            <div
                                key = {i}
                            >
                                {item}
                            </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div id="recipe-wrapper">
                <h3>Example Recipe</h3>
                <p>
                    Ingredients: <br/>
                    - 2 eggs  <br/>
                    - 2 cups cooked white rice  <br/>
                    - 2 tablespoons vegetable oil  <br/>
                    - 1/2 teaspoon salt <br/>
                    - 1/4 teaspoon ground black pepper <br/>
                    - 2 tablespoons soy sauce <br/>
                    <br/>
                    Instructions: <br/>
                    1. Crack the eggs into a bowl and whisk until combined. <br/>
                    2. Heat the oil in a large skillet over medium-high heat. <br/>
                    3. Add the eggs and cook, stirring occasionally, until scrambled and cooked through, about 3 minutes. <br/>
                    4. Add the cooked rice, salt, pepper, and soy sauce. Stir to combine. <br/>
                    5. Cook, stirring occasionally, until the rice is heated through, about 5 minutes. <br/>
                    6. Serve hot.
                </p>
                <button onClick={submitPrompt}>Test Submit</button>
            </div>
        </div>
        </Layout>
    )
}
