import {createOpenRouter} from "@openrouter/ai-sdk-provider";

export function getAgentModel()
{
    const client =  createOpenRouter({
        apiKey : process.env.OPENROUTER_API_KEY || "",
    });

    const model = process.env.OPENROUTER_DEFAULT_MODEL || "openrouter/free";

    return client(model);
}