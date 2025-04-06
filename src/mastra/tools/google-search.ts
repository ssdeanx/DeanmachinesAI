import { GoogleCustomSearchClient } from "@agentic/google-custom-search";

const googleCustomSearch = new GoogleCustomSearchClient();
const results = await googleCustomSearch.search("latest news about openai");
console.log(results);
