import { useState, useEffect, type ChangeEvent, useRef } from 'react'
import Layout from '../components/layout'
import { getSession } from 'next-auth/react'
import { TailSpin } from 'react-loader-spinner'
import ReactToPrint from 'react-to-print'

export default function GeneratorPage () {
  const [input, setInput] = useState<string>('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [ingredients, setIngredients] = useState<string[]>([])
  const [recipe, setRecipe] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [selectedDiet, setDiet] = useState<string>('')
  const printRef = useRef(null)

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

  async function getSuggestedIngredients () {
    if (input) {
      console.log(`/api/spoonacular?input=${input}`)
      const res = await fetch(`/api/spoonacular?input=${input}`)

      if (!res.ok) {
        throw new Error('Failed to fetch ingredient suggestions')
      }
      const suggestions = await res.json()
      setSuggestions(suggestions)
    } else {
      setSuggestions([])
    }
  }

  async function submitRecipeToDb () {
    const title = recipe.split('\n')[0].split(': ')[1]
    const updatedRecipe = recipe.split('\n')[0].split(': ')[1] + '\n' + recipe.split('\n').slice(1, recipe.split('\n').length).join('\n')
    const testData = { title, content: updatedRecipe }

    try {
      const session = await getSession()
      if (session?.user) {
        const userEmail = session.user.email
        const res = await fetch(`/api/recipes?userEmail=${userEmail}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(testData)
        })
        await res.json()
      }
    } catch (err) {
      console.error('Error posting recipe to MongoDB', err)
    }
  }

  async function fetchOpenApi() {
    try {
        setRecipe('');
        setLoading(true);
        const res = await fetch(`/api/openai`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ingredients, diet: selectedDiet })
        });

        if (!res.ok || !res.body) {
            throw new Error('Failed to fetch from server-side API');
        }

        let result = '';
        const reader = res.body.getReader();
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            const chunk = new TextDecoder().decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const dataStr = line.slice(6); // Remove the "data: " prefix
                    if (dataStr === '[DONE]') {
                        // Stop reading when "[DONE]" is encountered
                        setRecipe(result.trim());
                        setLoading(false);
                        return;
                    }

                    try {
                        const data = JSON.parse(dataStr);
                        if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
                            result += data.choices[0].delta.content;
                        }
                    } catch (err) {
                        console.error('Error parsing JSON chunk', err);
                    }
                }
            }
        }
    } catch (err) {
        console.error('Error fetching recipe from server-side API', err);
        setLoading(false);
    }
}




  

  return (
    <Layout>
        <div className="md:flex-row flex flex-col justify-between text-m sm:text-md  md:text-lg">
            <div
                id="generator-wrapper"
                className="flex flex-col justify-between items-center md:justify-around bg-white pb-5 h-[110vh] md:pb-0 md:w-[50%] md:h-[75vh] border-2 border-black-500 rounded-lg"
            >
                <div
                    id="input-wrapper"
                    className="relative items-around justify-between flex flex-col md:flex-row h-[75%] p-7 w-[100%] md:h-[70%]"

                >
                    <div id="search-wrapper" className="self-start flex items-start justify-between flex-col h-[20%] w-[100%] md:h-[90%] md:w-[40%]">
                        <input
                            type="text"
                            placeholder="Enter a food item"
                            value={input}
                            onChange={(e) => { handleInput(e) }}
                            className="py-2 px-3 rounded-lg border border-gray-300 mb-4 focus:outline-none focus:ring focus:ring-blue-500 md:w-[80%]"
                        />
                        <div className="overflow-auto min-h-[100%] w-[100%] md:w-[90%] bg-white rounded-lg border border-gray-300 p-2 space-y-2">
                            {suggestions.length > 0 && (
                                <div className="flex flex-wrap gap-2 p-2">
                                    {suggestions.map((suggestion, i) => (
                                        <div
                                            className="bg-slate-100 w-fit h-fit px-3 py-2 hover:bg-green-100 cursor-pointer border border-gray-200 rounded shadow-sm"
                                            key={i}
                                            onClick={() => {
                                              if (!(ingredients.includes(suggestion))) {
                                                setIngredients([...ingredients, suggestion])
                                              } else {
                                                alert('Duplicate ingredient!')
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
                    <div id="ingredients" className="flex items-start justify-between flex-col h-[20%] w-[100%] md:h-[90%] md:w-[50%]">
                        <h3 className=" text-xl xl:text-2xl font-bold mb-4 md:mb-8 md:mt-0">Selected Items:</h3>
                        <div className="overflow-auto border border-gray-300 min-h-[100%] w-[100%] md:w-[90%] bg-white rounded-lg">
                            <div className="grid overflow-auto p-2 space-y-2">
                                {ingredients.length > 0 && (
                                    <div className="flex flex-wrap gap-2 p-2">
                                        {ingredients.map((item, i) => (
                                            <div
                                                key={i}
                                                className="bg-slate-100 w-fit h-fit px-3 py-2 hover:bg-red-100 cursor-pointer border border-gray-200 rounded shadow-sm"
                                                onClick={() => {
                                                  const curList = [...ingredients]
                                                  curList.splice(curList.indexOf(item), 1)
                                                  console.log(curList)
                                                  setIngredients(curList)
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
                    <div className="self-end grid grid-rows-2 grid-cols-2 gap-4 md:h-[80%] md:flex md:flex-col justify-center md:w-fit w-[100%]">
                            <button
                                className={`md:h-[22.5%] py-2 px-4 h-fit rounded-lg border border-gray-300 ${selectedDiet === 'vegan' ? 'bg-blue-500 text-white' : ''}`}
                                onClick={() => {
                                  selectedDiet === 'vegan' ? setDiet('') : setDiet('vegan')
                                }}
                            >
                                🌱 <br></br>Vegan
                            </button>
                            <button
                                className={`md:h-[22.5%]  py-2 px-4 h-fit rounded-lg border border-gray-300 ${selectedDiet === 'vegetarian' ? 'bg-blue-500 text-white' : ''}`}
                                onClick={() => {
                                  selectedDiet === 'vegetarian' ? setDiet('') : setDiet('vegetarian')
                                }}
                            >
                                🥦 <br></br> Vegetarian
                            </button>
                            <button
                                className={`md:h-[22.5%]  py-2 px-4 h-fit rounded-lg border border-gray-300 ${selectedDiet === 'pescetarian' ? 'bg-blue-500 text-white' : ''}`}
                                onClick={() => {
                                  selectedDiet === 'pescetarian' ? setDiet('') : setDiet('pescetarian')
                                }}
                            >
                                🐟 <br></br> Pescetarian
                            </button>
                            <button
                                className={`md:h-[22.5%]  py-2 px-4 h-fit rounded-lg border border-gray-300 ${selectedDiet === 'keto' ? 'bg-blue-500 text-white' : ''}`}
                                onClick={() => {
                                  selectedDiet === 'keto' ? setDiet('') : setDiet('keto')
                                }}
                            >
                                🥓 <br></br> Keto
                            </button>
                    </div>
                </div>
                <div className="grid grid-rows-2 grid-cols-2 gap-5 md:grid-cols-4 md:grid-rows-1 md:gap-5 md:w-[90%] md:h-[15%] rounded-lg">
                    <button
                        className="py-2 px-4 rounded-lg border border-gray-300 text-l"
                        onClick={() => {
                          setIngredients([])
                          fetchOpenApi()
                        }}
                    >
                        🎲 <br></br> Random
                    </button>
                    <ReactToPrint
                        trigger={() => <button className="py-2 px-4 rounded-lg border border-gray-300 text-l">🖨️ <br></br> Print</button>}
                        content={() => printRef.current}
                    />
                    <button
                        onClick={submitRecipeToDb}
                        className="py-2 px-4 rounded-lg border border-gray-300 text-l"
                    >
                        💾 <br></br>Save 
                    </button>
                    <button
                        onClick={fetchOpenApi}
                        className="py-2 px-4 rounded-lg border border-gray-300 text-l"
                    >
                        ⚙️ <br></br>Generate
                    </button>
                </div>
            </div>
            <div className="flex mt-10  md:w-[50%] md:mt-0">
                <div
                    id="recipe-wrapper"
                    className="flex flex-col items-end gap-10 md:self-start w-[100%]"
                >
                    {
                        !loading && !recipe && (
                            <div className="whitespace-pre-wrap md:w-[80%] md:max-h-[75vh] rounded-lg border border-gray-300 p-10 md:overflow-auto" >
                                <h2 className="text-xl xl:text-2xl font-bold">Example Recipe</h2>
                                {"\nIngredients:\n- 2 units of main ingredient\n- 1 cup of secondary ingredient\n- 1/2 cup of flavor ingredient A\n- 1/2 teaspoon of spice A\n- 1/2 teaspoon of spice B\n- 1/4 teaspoon of seasoning A\n- 1/4 teaspoon of seasoning B\n- 2 units of binding ingredient\n- 1 cup of sauce ingredient\n- 1/2 cup of additional ingredient\n- Garnish ingredient, for garnish\n\nInstructions:\n1. Preheat the appliance to a specific temperature.\n2. In a container, mix secondary ingredient, flavor ingredient A, spice A, and spice B.\n3. Add seasoning A and seasoning B to the mixture and stir well.\n4. Dip each main ingredient into the binding ingredient, ensuring it's well-coated.\n5. Coat the main ingredient with the mixture from step 2.\n6. Cook for a set time.\n7. Pour sauce ingredient over the main ingredient.\n8. Sprinkle additional ingredient on top.\n9. Cook for an additional set time until golden brown.\n10. Garnish with garnish ingredient.\n11. Serve and enjoy!"}
                            </div>
                        )
                    }
                    {loading && (
                        <div className="flex justify-center items-center w-[100%] h-[100%] md:w-[80%] md:min-h-[75vh] rounded-lg border border-gray-300">
                            <TailSpin
                                color="#c2c2c2"
                                height={100}
                                width={100}
                            />
                        </div>
                    )}
                    {recipe && (
                        <div className="rounded-lg border border-gray-300 md:w-[80%] md:overflow-auto md:max-h-[75vh]">
                            <div ref={printRef} className="whitespace-pre-wrap p-10">
                                <h2 className="text-xl xl:text-2xl font-bold">{recipe.split('\n')[0].split(': ')[1]}</h2>
                                <p>{recipe.split('\n').splice(1, recipe.length - 1).join('\n')}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>
    </Layout>
  )
}
