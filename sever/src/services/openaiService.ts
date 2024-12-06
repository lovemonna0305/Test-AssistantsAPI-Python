import OpenAI from "openai";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export const chatjsonData = async (message: string): Promise<string> => {
  try {
    const dataPath = path.resolve("public", "data.json");

    const fileUpload = await openai.files.create({
      file: fs.createReadStream(dataPath),
      purpose: "assistants",
    });
    console.log("File uploaded:", fileUpload);

    const assistant = await openai.beta.assistants.create({
      name: "E-commerce assistant",
      instructions:
        "You are my e-commerce assistant who can answer questions from the given JSON. Respond concisely.",
      model: "gpt-4-1106-preview",
      tools: [{ type: "retrieval" }],
      file_ids: [fileUpload.id],
    });
    console.log("Assistant created:", assistant);

    const thread = await openai.beta.threads.create();
    console.log("Thread created:", thread);

    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: message,
    });


    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id,
    });

    let runStatus;
    do {
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Poll every 5 seconds
    } while (runStatus.status !== "completed");

    // Retrieve the assistant's response
    const messages = await openai.beta.threads.messages.list(thread.id);
    const reply = messages.data.find((msg) => msg.role === "assistant")?.content;

    return reply || "No response available.";
  } catch (error) {
    console.error("Error in chatjsonData:", error);
    throw new Error("Failed to process the assistant's response.");
  }
};
