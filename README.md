# CulinaryAI v2.0
CulinaryAI is a Chat-GPT3 powered web application that suggests recipes based on users preferred ingredients and exclusions. New suggestions are generated each time and user's are able to save recipes to their associated Google accounts.

## NOTE:
Currently using trial premium hosting option from netifly, once finished, API fetching longer than 10s will cause an error.

## Demo link:
Access my site at [culinaryaiv2.netlify.app](https://culinaryaiv2.netlify.app/)

## Table of Content:

- [Technologies](#technologies)
- [Setup](#setup)
- [Approach](#approach)
- [Status](#status)
- [Credits](#credits)
- [License](#license)

## Technologies
I used `Next.js` for the frontend/backend (used API routing). `MongoDB` to store data and `TailWindCSS` for styling. `OAuth` was used for user authentication.

## Setup
- download or clone the repository
- run `npm install`
- run `npm run dev`

## Approach
I wanted to integrate the new Chat-GPT3 API while also learning TailWindCSS for the first time. I knew recipe makers already exist, but none use the power of AI to make 
tailored suggestions towards the user. I hope to add more "options" for the user to select in the future (e.g. themed based recipes) alongside implementing a backend for users to save 
some of their favorite recipes.

## Status
Minimal viable product currently, plan to add more features surrounding recipe types and collaboration.

## Credits
List of contriubutors:
- [Victor Yoshida](victoryoshida.com)

## License

MIT license @ [Victor Yoshida](victoryoshida.com)
