import { PineconeClient } from "@pinecone-database/pinecone";
import * as dotenv from "dotenv";
import { VectorDBQAChain } from "langchain/chains";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
dotenv.config();


const make = async(question) => {
  return new Promise(async(resolve, reject) => {
    try {
    const client = new PineconeClient();
    await client.init({
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT,
    });
    
    const pineconeIndex = client.Index(process.env.PINECONE_INDEX);
      const vectorStore = await PineconeStore.fromExistingIndex(
        new OpenAIEmbeddings({openAIApiKey:process.env.API_KEY_OPEN_AI}),
        { pineconeIndex }
      );
        const model = new OpenAI({openAIApiKey:process.env.API_KEY_OPEN_AI, temperature:.1, modelName: 'gpt-3.5-turbo'});
        const chain = VectorDBQAChain.fromLLM(model, vectorStore, {
          k: 10,
          returnSourceDocuments: true,
        });
        

        const response = await chain.call({  query: question.toLowerCase() });
        console.log(response);
      resolve(response.text)
    } catch (error) {
      console.log(error);
      console.log(error.response);
      reject(error.response)
    }
  })
 
 
}



export default make