import { GoogleGenerativeAI } from "@google/generative-ai";
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY; 

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ 
	model: "gemini-1.5-flash",
   systemInstruction: "Choose a popular place for tourists in the area. Return a single place name as a string. Only return the name of specific places, not general categories.",
   temperature: 3,
 });

 async function generatePlaceSuggestion(visited_places){
    const prompt = "Generate a place for the user to visit based off of the following places, but not including them:" + visited_places.map(place => place.displayName).join(", ");
    const response = await model.generateContent(prompt);
    const result = response.response.text();
    console.log(result);
    return result;
  }

  export { generatePlaceSuggestion };