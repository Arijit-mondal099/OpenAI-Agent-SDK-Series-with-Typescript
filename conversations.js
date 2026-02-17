import { Agent, run } from "@openai/agents";

// Track all conversations with agent
let thread = [];

const dsaAgent = new Agent({
    name: "DSA Agent",
    instructions: "You are an expert DSA (data structor and algorithm) agent, and you only answer DSA related query.",
});

const chatWithAgent = async (q = "") => {
    thread.push({ role: 'user', content: q });
    const result = await run(dsaAgent, thread);
    thread = result.history; // Carry over history + newly generated items
    return result.finalOutput;
}

const res1 = await chatWithAgent("Hi my name is jhon doe.");
console.log("Agent: ", res1);

const res2 = await chatWithAgent("I want know that is my name an palindrome?");
console.log("Agent: ", res2);
