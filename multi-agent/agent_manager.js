import { Agent, tool, run } from "@openai/agents";
import z from "zod";
import fs from "node:fs/promises";

/**
 * @RefundAgent ----------------------
 */
const refundCustomerTool = tool({
    name: "refund_ucustomer",
    description: "This tool processes the refund for a customer.",
    parameters: z.object({
        customerId: z.string().describe("customer id for refund"),
        reason: z.string().describe("reason for refund"),
    }),
    execute: async function ({ customerId, reason }) {
        await fs.appendFile("./refund.txt", `Refunded customerId: ${customerId}, Reason: ${reason}`);
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
    tools: [
        getAvailablePlansTool,
        // here we connect another as a tool
        refundAgent.asTool({
            toolName: "refund_expert",
            toolDescription: "Help customer to refund thir plan."
        })
    ],
});

const res = await run(salesAgent, "I had a plan for refund how can i and process? customer ID cus_12345, reason currently im having 28 days plan and now i want to increse my plan.");
console.log(`Agent: ${res.finalOutput}`);
