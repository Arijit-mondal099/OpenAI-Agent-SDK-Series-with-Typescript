# OpenAI Agent SDK - Learning Project

A collection of examples demonstrating different patterns of the **OpenAI Agents SDK** (`@openai/agents`). Covers tool calling, multi-agent systems, guardrails, streaming, runtime context, and human-in-the-loop workflows.

## Examples

| Script | Pattern | Description |
|--------|---------|-------------|
| `npm start` | Basic Agent | Simple DSA-focused agent |
| `npm run conversation` | Multi-turn Chat | Conversation history with `result.history` |
| `npm run streaming` | Streaming | Chunk-by-chunk streamed output |
| `npm run run-time-ctx` | Runtime Context | Inject external dependencies into tools |
| `npm run tool-calling` | Tool Calling + Structured Output | Weather fetch & email with Zod schema |
| `npm run manager` | Agent-as-Tool | Sales agent delegates to Refund agent |
| `npm run handoff` | Agent Handoff | Receptionist routes to Sales or Refund agent |
| `npm run input_guard` | Input Guardrail | Blocks non-stock-market queries |
| `npm run output_guard` | Output Guardrail | Blocks dangerous SQL queries |
| `npm run human-loop` | Human-in-the-Loop | User approval before tool execution |

## Setup

```bash
npm install
```

Create a `.env` file:

```env
OPENAI_API_KEY=your_openai_api_key
GROQ_API_KEY=your_groq_api_key
EMAIL_USER=your_gmail_address
EMAIL_PASSWORD=your_gmail_app_password
```

## Run

Each example has its own npm script:

```bash
npm start                 # Basic agent
npm run conversation       # Multi-turn chat
npm run streaming          # Streaming output
npm run run-time-ctx       # Runtime context
npm run tool-calling       # Tool calling
npm run manager            # Agent-as-tool
npm run handoff            # Agent handoff
npm run input_guard        # Input guardrail
npm run output_guard       # Output guardrail
npm run human-loop         # Human-in-the-loop
```

## Tech Stack

- [OpenAI Agents SDK](https://www.npmjs.com/package/@openai/agents) v0.4.10
- [Groq SDK](https://www.npmjs.com/package/groq-sdk) v0.37.0
- [Zod](https://www.npmjs.com/package/zod) v4.3.6
- [Axios](https://www.npmjs.com/package/axios)
- [Nodemailer](https://www.npmjs.com/package/nodemailer)
- Node.js >= 20.6.0

## Project Structure

```
OpenAI-Agent-SDK/
├── index.js                      # Basic agent
├── conversations.js              # Multi-turn conversation
├── streaming.ts                  # Streaming output
├── run-time-ctx.ts               # Runtime context injection
├── human-in-the-loop.ts          # Tool approval flow
├── tool-calling/
│   ├── agent.js                  # Weather + Email agent
│   └── tools.js                  # Weather & email tool definitions
├── multi-agent/
│   ├── agent_manager.js          # Agent-as-tool pattern
│   └── agent_handoff.js          # Agent handoff routing
└── guardrails/
    ├── input_guardrail.js        # Input query filtering
    └── output_guardrail.js       # Output safety check
```

## Author

[Arijit Mondal](https://github.com/Arijit-mondal099)
