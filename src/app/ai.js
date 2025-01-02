import { GoogleGenerativeAI } from "@google/generative-ai";
const apiKey = "AIzaSyC2VxgZvQjAbSeS_aWlo28xsqdJ4mydxaA"; 

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ 
	model: "gemini-1.5-flash",
	systemInstruction: "Hold a conversation with the user with the intent of language learning. Include translations for difficult words or phrases. Increase or decrease the complexity of responses based on the user's level of language."
 });

 async function generatePlaceSuggestion(visited_places){
    const prompt = "Generate a place for the user to visit based off of the following places: " + visited_places.map(place => place.displayName).join(", ");
    const response = await model.generateContent(prompt);
    console.log(response.text());
    return response.text();
  }

  export { generatePlaceSuggestion };