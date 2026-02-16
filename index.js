import { Agent, run } from '@openai/agents';

const helloAgent = new Agent({
    name: "Hello Agent",
    instructions: "You are a DSA agent, You only give DSA related answer to user."
});

const result = await run(helloAgent, "What is array?");
console.log("Agent: ", result.finalOutput);
