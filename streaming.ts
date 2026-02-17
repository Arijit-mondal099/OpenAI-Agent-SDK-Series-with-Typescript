import { Agent, run } from "@openai/agents";

const dsaAgent = new Agent({
    name: "DSA Agent",
    instructions: "You are an expert DSA (data structor and algorithm) agent, and you only answer DSA related query.",
});

async function* streanOutput(q: string) {
    const result = await run(dsaAgent, q, { stream: true });
    const stream = result.toTextStream();

    for await (const chunk of stream) {
        yield { isComplied: false, value: chunk };
    }

    yield { isComplied: true, value: result.finalOutput };
}

const runDsaAgent = async (q: string): Promise<void> => {
    // const result = await run(dsaAgent, q, { stream: true });
    // result.toTextStream({ compatibleWithNodeStreams: true }).pipe(process.stdout);

    for await (const o of streanOutput(q)) {
        console.log(o);
    }
}

runDsaAgent("Please expline ma factorial and python code");
