import React from "react";
import { rules } from "@/AI/prompts/rules";
import ai from "@/AI/config/AI";
import { getLogger } from "@/lib/logger"; 
const logger = getLogger(import.meta.url);

export default async function handler(req,res) {

    if(req.method==="POST"){
    try {
          const { question } = req.body;
          const prompt = question+"follow this rules before answering "+ rules;
           const output = await ai.generate({prompt});
           const airesponse =output.message?.content[0].text;
          res.status(200).json(airesponse);   
    } catch (error) {
        logger.error("Error in POST handler", {
            message: error.message,
            stack: error.stack,
        });
    }
}else{
    res.status(405).json({message:"Method not allowed"});
}   

}