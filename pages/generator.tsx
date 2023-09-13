import { useState, useEffect, ChangeEvent } from "react";
import Layout from "../components/layout"

export default function GeneratorPage() {

  const [input, setInput] = useState<String | ''>('');
  const [suggestions, setSuggestions] = useState<Array<String>>([]);
  

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

  

  return (
    <Layout>
      <h1>Recipe Generator</h1>
      <input
        type="text"
        placeholder="Enter a food item"
        onChange={(e)=>handleInput(e)}
        />
      {suggestions.length > 0 && (
        <div>
            {suggestions.map((suggestion, i) => (
            <div
                key = {i}
                onClick={() => {
                    setInput(suggestion)
                    setSuggestions([])
                }}
            >
                {suggestion}
            </div>
            ))}
        </div>
      )}
      <button>Add</button>
    </Layout>
  )
}
