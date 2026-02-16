import { Agent, OutputGuardrailTripwireTriggered, run } from "@openai/agents";
import Groq from "groq-sdk";
import { z } from "zod";

const groq = new Groq();

/**
 * Output Guardrail Agent to safe from dangerous sql query
 * @param {*} q 
 * @returns { isDangerousQuery, reasoning }
 */
const isDangerousSqlQuery = async (q) => {
    const responseSchema = z.object({
        isDangerousQuery: z.boolean().describe("if the sql query is dangerous"),
        reasoning: z.string().optional().describe("reason for classification"),
    });

    try {
        const completions = await groq.chat.completions.create({
            model: "openai/gpt-oss-20b",
            temperature: 0,
            messages: [
                {
                    role: "system",
                    content: `"You are a SQL security guard. Detect dangerous queries containing DELETE, DROP, TRUNCATE, ALTER, UPDATE operations. Flag queries that modify or destroy data. Return isDangerous: true if unsafe."`,
                },
                { role: "user", content: q }
            ],
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: "OutputGuardrailAgent",
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
 * @Output_guradrail to protect form dangerous SQL qurey (e.g. DELETE)
 */
const sqlGuardrail = {
  name: 'SQL Guardrail',
  async execute({ agentOutput }) {
    const result = await isDangerousSqlQuery(agentOutput.sql);

    return {
      outputInfo: result.reasoning,
      tripwireTriggered: result.isDangerousQuery ?? true,
    };
  },
};

/**
 * @Agent to write SQL query fron natural language
 */
const sqlAgent = new Agent({
    name: "SQL Agent",
    instructions: `You are an expert SQL agent. Convert natural language to accurate SQL queries and only return SQL query.
    Example:
    User: "how many credits today"
    Output: "SELECT COUNT(*) FROM transactions WHERE type = 'credit' AND DATE(created_at) = CURDATE() AND status = 'completed'"`,
    outputGuardrails: [sqlGuardrail],
    outputType: z.object({ sql: z.string().describe("SQL query") }),
});

const main = async (q = "") => {
    try {
        const result = await run(sqlAgent, q);
        console.log(`Agent: ${result.finalOutput.sql}`);
    } catch (error) {
        if (error instanceof OutputGuardrailTripwireTriggered) {
            console.error(`Agent: ${error.message}`);
        }
    }
}

main("Want to see all users");
