import { Agent, tool, run } from "@openai/agents";
import { RECOMMENDED_PROMPT_PREFIX } from "@openai/agents-core/extensions";
import z from "zod";
import fs from "node:fs/promises";

/**
 * @RefundAgent ----------------------
 */
const refundCustomerTool = tool({
    name: "refund_customer",
    description: "This tool processes the refund for a customer.",
    parameters: z.object({
        customerId: z.string().describe("customer id for refund"),
        reason: z.string().describe("reason for refund"),
    }),
    execute: async function ({ customerId, reason }) {
        await fs.appendFile("./refund.txt", `Refunded customerId: ${customerId}, Reason: ${reason}`, "utf-8");
        return "refund successful";
    }
})

const refundAgent = new Agent({
    name: "refundAgent",
    instructions: `You are expert in issuing refunds to the customer.`,
    tools: [refundCustomerTool],
});

/**
 * @SalesAgent ----------------------
 */
const getAvailablePlansTool = tool({
    name: "available_plans",
    description: "Fetch the available plans.",
    parameters: z.object({}),
    execute: async function () {
        return [
            { plan_id: '1', price_inr: 399, day: 28, speed: '30MB/s' },
            { plan_id: '2', price_inr: 999, day: 84, speed: '40MB/s' },
            { plan_id: '3', price_inr: 1499, day: 365, speed: '50MB/s' },
        ];
    }
});

const salesAgent = new Agent({
    name: "salesAgent",
    instructions: `You are an expert sales agent for an internet broadband comapny. Talk to the user and help them with what they need.`,
    tools: [getAvailablePlansTool],
});

/**
 * @ReceptionAgent handle handoff's
 */
const receptionAgent = new Agent({
    name: "Reception Agent",
    instructions: `${RECOMMENDED_PROMPT_PREFIX}  You are the customer facing agent expert in understanding what customer needs and then route them or handoff them to the right agent.`,
    handoffDescription: `You have two agents available:
    - salesAgent: Expert in handling queries like all plans and pricing available. Good for new customers.
    - refundAgent: Expert in handling customer's refund processes.
    `,
    handoffs: [salesAgent, refundAgent],
});

const res = await run(receptionAgent, "hey i had a plan for refound because i had a plan for buy more better plan, here is my id cust_1234");

console.log(`Agent: `, res.finalOutput);
console.log("History: ", res.history);
