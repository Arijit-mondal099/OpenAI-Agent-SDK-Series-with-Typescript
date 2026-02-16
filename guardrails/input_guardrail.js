import { Agent, InputGuardrailTripwireTriggered, run } from "@openai/agents";
import Groq from "groq-sdk";
import { z } from "zod";

const groq = new Groq();

/**
 * Input Guardrail Agent to Keep Check User Querys
 * @param {*} q 
 * @returns { isValidQuery, reasoning }
 */
const isStockMarketRelatedQuery = async (q) => {
    const responseSchema = z.object({
        isValidQuery: z.boolean().describe("if the query is a stock market related question"),
        reasoning: z.string().optional().describe("reason for classification"),
    });

    try {
        const completions = await groq.chat.completions.create({
            model: "openai/gpt-oss-20b",
            temperature: 0,
            messages: [
                {
                    role: "system",
                    content: `You are a classifier. Determine if the user's question is about the stock market.

                    Respond with only:
                    - isValidQuery: true if the question involves stocks, trading, market analysis, investments, or financial markets
                    - isValidQuery: false if it's about anything else

                    Examples:
                    - "What is Apple stock price?" → true
                    - "How's the weather?" → false
                    - "Should I buy Tesla?" → true
                    - "What is pizza?" → false`,
                },
                { role: "user", content: q }
            ],
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: "InputGuardrailAgent",
                    schema: responseSchema.toJSONSchema(),
                }
            }
        });

        const result = JSON.parse(completions.choices[0].message.content);
        return result;
    } catch (error) {
        console.log(error);
        return false;
    }
}

/**
 * @Input_Guardrail to protect from invalid user query that not related to your agent
 */
const stockMarketGuardrail = {
    name: "Stock Market Guardrail",
    // Set runInParallel to false to block the model until the guardrail completes.
    runInParallel: false,
    execute: async function ({ input }) {
        const res = await isStockMarketRelatedQuery(input);
        return {
            outputInfo: res.reasoning,
            tripwireTriggered: !res.isValidQuery ?? true,
        }
    }
}

/**
 * @Agent for stock market
 */
const stockMarketAgent = new Agent({
    name: "Stock Market Agent",
    instructions: `You are an stock market expert agent.`,
    inputGuardrails: [stockMarketGuardrail],
});

const main = async (q = "") => {
    try {
        const result = await run(stockMarketAgent, q);
        console.log(`Agent: ${result.finalOutput}`);
    } catch (error) {
        if (error instanceof InputGuardrailTripwireTriggered) {
            console.error(`Agent: ${error.message}`);
        }
    }
}

main("Tesla market?");
