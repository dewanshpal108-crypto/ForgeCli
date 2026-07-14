import {
    Output,
    extractJsonMiddleware,
    generateText,
    stepCountIs,
    tool,
    wrapLanguageModel
} from "ai";
import { z } from "zod";
import chalk from "chalk";
import { getAgentModel } from "../../../ai/ai.config.ts";
import { ActionTracker } from "../agent/action-tracker.ts";
import { ToolExecutor } from "../agent/tool-executor.ts";
import { defaultAgentConfig } from "../agent/types";
import type { Plan, PlanStep } from "./types.ts"
import { createWebTools } from "./web-tools.ts";

const planSchema = z.object({
    researchSummary: z.string().optional(),
    steps: z.array(z.object({
        title: z.string(),
        description: z.string(),
        hints: z.array(z.string()).optional(),
        complexity: z.enum(["low", "medium", "high"]).optional(),
    })).min(1).max(15),
});


function readOnlyTools(executor: ToolExecutor) {
    return {
        readFile: tool({
            description: "Read a file from the codebase",
            inputSchema: z.object({
                path: z.string().describe("Relative file path"),
            }),
            execute: async ({ path: p }) => executor.readFile(p),
        }),

        list_files: tool({
            description: "List files and directories under a path.",
            inputSchema: z.object({
                path: z.string(),
                recursive: z.boolean().optional().default(false),
            }),
            execute: async ({ path: p, recursive }) =>
                executor.listFiles(p, recursive),
        }),

        search_files: tool({
            description:
                'Find files matching a glob pattern (e.g. "*.ts", "**/*.md"). Optional content substring filter.',
            inputSchema: z.object({
                root: z.string().describe("Directory to search, relative to root"),
                pattern: z
                    .string()
                    .describe("Glob-like pattern using * and ** (forward slashes)"),
                content_contains: z.string().optional(),
            }),
            execute: async ({ root, pattern, content_contains }) =>
                executor.searchFiles(root, pattern, content_contains),
        }),

        analyze_codebase: tool({
            description:
                "Summarize structure: file counts, size, extensions. Read-only.",
            inputSchema: z.object({
                path: z.string().default("."),
            }),
            execute: async ({ path: p }) => executor.analyzeCodebase(p),
        }),

        list_skills: tool({
            description:
                "List absolute paths to SKILL.md files under configured skill directories (Cursor / Claude).",
            inputSchema: z.object({}),
            execute: async () => executor.listSkills(),
        }),

        read_skill: tool({
            description:
                "Read a SKILL.md file. Path must be absolute and under skill roots, or use a path returned by list_skills.",
            inputSchema: z.object({
                path: z.string(),
            }),
            execute: async ({ path: p }) => executor.readSkill(p),
        }),
    };
}

const Plan_intructions = (codebase: string, hasWeb: boolean) => [
    "You are a Read-Only Planning Agent. You DO NOT modify files.",
`Workspace: ${codebase}`,
"CRITICAL RULES:",
"1. Use read-only tools to research the codebase. Do NOT attempt to write or edit files.",
hasWeb 
    ? "2. Web tools are ENABLED (web_search/web_crawl/fetch_url). Use them only if needed." 
    : "2. Web tools are DISABLED. Do not attempt network requests.",
"3. Output MUST strictly match the provided JSON schema.",
"4. Keep the output plan brief: exactly 1–15 steps.",
].join("\n");

export async function generatePlan(goal: string): Promise<Plan> {
    const config = defaultAgentConfig();
    const tracker = new ActionTracker();
    const executor = new ToolExecutor(tracker, config);

    //!! this is used to convert the value in boolean format
    const hasWeb  = !!process.env.FIRECRAWL_API_KEY;
    const model = wrapLanguageModel({
        model:getAgentModel(),
        middleware:extractJsonMiddleware(),
    });

    const tools = { ...readOnlyTools(executor) , ...(hasWeb ? createWebTools(tracker) : {}) };

    console.log(chalk.cyan("\n 🧠 Generating plan..."));

    const result = await generateText({
        model,   
        tools,
        stopWhen: stepCountIs(20),
        system: Plan_intructions(config.codebasePath, hasWeb),
        prompt: `User goal: \n${goal}`,
        output: Output.object({ schema: planSchema })
    });

    const validated = planSchema.parse(result.output);

    const steps: PlanStep[] = validated.steps.map((s, i) => ({
        id: `step-${i + 1}`,
        title: s.title,
        description: s.description,
        hints: s.hints,
        complexity: s.complexity
    }));

    return { goal, researchSummary: validated.researchSummary, steps }
}