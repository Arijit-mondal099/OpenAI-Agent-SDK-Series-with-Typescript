import { tool } from '@openai/agents';
import axios from 'axios';
import { z } from 'zod';
import nodemailer from "nodemailer";

/**
 * @tool for fetching weather by 'chity name'
 * @param { city }
 */
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
            return `The weather of ${city} is ${data}`;
        } catch (error) {
            console.error(`Error :: get_weather :: ${error?.message}`);
            return "Faild to fetch weather of given city, please try again.";
        }
    }
});

/**
 * @tool for send email
 * @param { toEmail, subject, body }
 */
export const sendEmailTool = tool({
    name: "send_email",
    description: "This tool sends an email.",
    parameters: z.object({
        toEmail: z.string().describe('email address to'),
        subject: z.string().describe('subject'),
        body: z.string().describe('body of the email'),
    }),
    execute: async function ({ toEmail, subject, body }) {
        try {
            // Create transporter
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD,
                },
            });

            // Send email
            const info = await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: toEmail,
                subject: subject,
                text: body,
                html: `<p>${body}</p>`
            });

            // console.log('Email sent:', info.messageId);
            return `Email sent successfully to ${toEmail}`;
        } catch (error) {
            console.error(`Error :: send_email :: ${error?.message}`);
            return "Faild to send email, please try again.";
        }
    }
});
