import chalk from "chalk";
import {isCancel , select} from "@clack/prompts";
import {runAgentMode} from "./agent/orchestrator";
import {runAskMode} from "./ask/orchestrator";
import { runPlanMode } from "./plan/orchestrator";

export async function runCliMode()
{
    while(true)
    {
        const mode = await select({
            message : "Select the CLI mode you want to use",
            options : [
                {value : "agent", label : "Agent Mode"},
                {value : "plan", label : "Plan Mode"},
                {value : "ask", label : "Ask Mode"},
                {value : "back" , label : "← Back to main menu"}
            ]
        });

        if(isCancel(mode) || mode === "back") return;

        if(mode === "agent")
        {
            await runAgentMode();
        }

        if(mode === "plan")
        {
            await runPlanMode();
        }
        
        if(mode === "ask")
        {
            await runAskMode();
        }

        if(mode !== "agent" && mode !== "plan" && mode !== "ask")
        {
            console.log(chalk.dim("Select a valid Mode"));
        }
    }
}