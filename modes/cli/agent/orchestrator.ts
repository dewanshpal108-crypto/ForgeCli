import chalk from "chalk";
import {isCancel , text} from "@clack/prompts";
import {defaultAgentConfig} from "./types";
import { ActionTracker } from "./action-tracker";
import { ToolExecutor } from "./tool-executor";
import { createAgentTools } from "./agent-tools";
import { ToolLoopAgent , stepCountIs } from "ai";
import { getAgentModel } from "../../../ai";
import { renderTerminalMarkdown } from "../../../tui/terminal-md";
import { runApprovalFlow } from "./approval";

export async function runAgentMode()
{
    console.log(chalk.bold("\n 🤖 Agent Mode \n")); 
    
    const goal = await text({
        message : "Enter the goal for the agent to achieve",
        placeholder : "Build a simple web scraper",
    })

    if(isCancel(goal) || !goal.trim())
    {
        return
    }

    const config = defaultAgentConfig();
    const tracker = new ActionTracker();
    const executor = new ToolExecutor(tracker, config);
    const tools = createAgentTools(executor);

    const agent  = new ToolLoopAgent({
        model:getAgentModel(),
        stopWhen: stepCountIs(51),
        instructions: [
            `Workspace root : ${config.codebasePath}`,
            "All mutations are staged until approved",
        ].join("\n"),
        tools,
    })

    const result  = await agent.generate({
        prompt: goal.trim(),
        onStepFinish: ({toolCalls}) => {
            for(const tc of toolCalls){
                const preview = JSON.stringify(tc.input, null, 2).slice(0, 100);
                console.log(
                    chalk.green("  ✓"),
                    chalk.bold(String(tc.toolName)),
                    chalk.dim(preview + (preview.length >= 100 ? "..." : ""))
                )
            }
        }
    })

    if(result.text?.trim()) console.log(renderTerminalMarkdown(result.text))

    const ok = await runApprovalFlow(tracker);
  if (!ok) return executor.clearStaging();

  const { errors } = executor.applyApprovedFromTracker();

  if (errors.length) {
    console.log(chalk.red("\nSome operations reported errors:\n"));
    for (const e of errors) console.log(chalk.red(`  • ${e}`));
  }
  else{
   console.log(chalk.green('\n✓ Applied.\n'));
  }

  executor.clearStaging()
}