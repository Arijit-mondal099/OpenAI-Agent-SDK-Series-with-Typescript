import { Agent, run, tool } from "@openai/agents";
import axios from "axios";
import nodemailer from "nodemailer";
import readline from "node:readline/promises";
import { z } from "zod";

export const getWeatherTool = tool({
    name: "get_weather",
    description: 'Get the weather for a given city',
    parameters: z.object({ 
        city: z.string().describe("Name of the city") 
    }),
    execute: async function ({ city }) {
        try {
            const URI = `https://wttr.in/${city?.toLowerCase()}?format=%C+%t`;
            const { data } = await axios.get(URI, { responseType: "text" });
            console.log(data)
            return `The weather of ${city} is ${data}`;
        } catch (error) {
            if (error instanceof Error) console.error(`Error :: get_weather :: ${error.message}`);
            return "Faild to fetch weather of given city, please try again.";
        }
    }
});

export const sendEmailTool = tool({
    name: "send_email",
    description: "This tool sends an email.",
    parameters: z.object({
        toEmail: z.string().describe('email address to'),
        subject: z.string().describe('subject'),
        body: z.string().describe('body of the email'),
    }),
    needsApproval: true,
    execute: async function ({ toEmail, subject, body }) {
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD,
                },
            });

            const info = await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: toEmail,
                subject: subject,
                text: body,
                html: `<p>${body}</p>`
            });

            return `Email sent successfully to ${toEmail}`;
        } catch (error) {
            if (error instanceof Error) console.error(`Error :: send_email :: ${error.message}`);
            return "Faild to send email, please try again.";
        }
    }
});

const agent = new Agent({
    name: "Weather Agent",
    instructions: `You are a helpful weather assistant.

    CAPABILITIES:
    - get_weather: Fetch current weather data for any city
    - send_email: Send weather reports via email

    WORKFLOW:
    1. Weather Query: Use get_weather tool → Present formatted results
    2. Email Request: get_weather → Format report → send_email → Confirm delivery

    IMPORTANT RULES:
    - Always fetch fresh weather data before sending emails
    - Ask for email address if not provided
    - Format email reports professionally with all weather details
    - Confirm successful email delivery to the user
    - Handle errors gracefully and inform the user

    Be friendly, accurate, and efficient.`,
    tools: [getWeatherTool, sendEmailTool],
});

const confirm = async (question: string): Promise<boolean> => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await rl.question(`${question} (y/n): `);
    const normalizedAnswer = answer.toLowerCase();
    rl.close();
    return normalizedAnswer === 'y' || normalizedAnswer === 'yes';
}

const runWeatherAgent = async (q: string): Promise<void> => {
    try {
        let result = await run(agent, q);
        let hasInterruptions = result.interruptions.length > 0;
    
        while (hasInterruptions) {
            const state = result.state;
    
            for (const interruption of result.interruptions) {
                const isConfirmed = await confirm(`Agent ${interruption.agent.name} would like to use the tool ${interruption.name} with "${interruption.arguments}". Do you approve?\n`);
    
                if (isConfirmed) {
                    state.approve(interruption);
                } else {
                    state.reject(interruption);
                }
            }
    
            // resume execution of the current state
            result = await run(agent, state);
            hasInterruptions = result.interruptions?.length > 0;
        }
    
        console.log(`Agent: ${result.finalOutput}`);
    } catch (error) {
        if (error instanceof Error) console.error("Error::", error.message);
    }
}

runWeatherAgent("What is the weather of kolkata and goa? and sent it to mondalpritam777888999@gmail.com");
