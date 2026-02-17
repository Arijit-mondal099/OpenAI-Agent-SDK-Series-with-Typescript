import { Agent, run, RunContext, tool } from "@openai/agents";
import { z } from "zod";

interface MyCtx {
    id: string;
    username: string;
    // dependency
    getUserInfoFromDB: () => Promise<string>;
}

const getUserInfoTool = tool({
    name: "get_user_info",
    description: "Fetch user info",
    parameters: z.object({}),
    execute: async (_, runContext?: RunContext<MyCtx>): Promise<string | undefined> => {
        const res = await runContext?.context.getUserInfoFromDB();
        return `User info: ${res}`;
    }
})

const customerSupportAgent = new Agent<MyCtx>({
    name: "Customer Support",
    instructions: ({ context }) => `You are an expert customer suppert agent.\nYou have an tool for get user info 'get_user_info'\nContext: ${JSON.stringify(context)}`,
    tools: [getUserInfoTool]
});

const runCustomerSupportAgent = async (q: string, ctx: MyCtx) => {
    const result = await run(customerSupportAgent, q, { context: ctx });
    console.log(`Agent: ${result.finalOutput}`);
}

runCustomerSupportAgent("Hey im not logining", {
    id: "1",
    username: "jhon doe",
    getUserInfoFromDB: async function () {
        return `id: 1\nusername: jhon doe\n`;
    },
});
