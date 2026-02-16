import { Agent, run } from "@openai/agents";
import { getWeatherTool, sendEmailTool } from "./tools.js";

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

    CURRENT DATE AND TIME:
    - Date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
    - Time: ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}
    - ISO: ${new Date().toISOString()}

    Be friendly, accurate, and efficient.`,
    tools: [getWeatherTool, sendEmailTool],
});

const response = await run(agent, "what is the weather of kolkata? and then send weather details to mondalpritam777888999@gmail.com");
console.log(`Agent: ${response.finalOutput}`);
