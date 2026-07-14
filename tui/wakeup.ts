import {select , isCancel} from "@clack/prompts";
import chalk from "chalk";
import figlet from "figlet";
import {runCliMode} from "../modes/cli/cli.ts";
// import {runWhatsappMode} from "../modes/whatsapp";
import { runTelegramMode } from "../modes/telegram/index.ts";

//inside the file tui/wakeup.ts, we will create a function to print the banner with shadow effect and then run the wakeup function to select the mode.

const BANNER_FONT = "ANSI Shadow";
const SHADOW = chalk.hex("#5b4d9e");
const FACE = chalk.hex("#e8dcf8").bold;

function printBannerWithShadow(ascii: string) {

  const bannerLines = ascii.replace(/\s+$/, '').split('\n');
  const maxLen = Math.max(...bannerLines.map((l) => l.length), 0);
  const rowWidth = maxLen + 2;
  for (const line of bannerLines) {
    console.log(SHADOW(('  ' + line).padEnd(rowWidth)));
  }
  process.stdout.write(`\x1b[${bannerLines.length}A`);
  for (const line of bannerLines) {
    console.log(FACE(line.padEnd(rowWidth)));
  }
  console.log();
}


export async function runwakeup()
{
    let ascii:string;
    try {
        ascii = figlet.textSync("ForgeCLI", { font: BANNER_FONT });
    } catch(error)
    {
        ascii = figlet.textSync("ForgeCLI" , { font: "Standard" });
    }

    printBannerWithShadow(ascii);

    const mode = await select({
        message : "Select the mode you want to use",
        options : [
            {value : "cli", label : "CLI Mode"},
            {value : "whatsapp", label : "WhatsApp Mode"},
            {value : "telegram" , label : "Telegram Mode"},
            {value : "exit", label : "Exit"}
        ]
    })

    if(isCancel(mode || mode == "exit"))
    {
        console.log(chalk.dim("Operation cancelled. Exiting..."));
        return;
    }

    if(mode === "cli")
    {
        await runCliMode();
    }
    if(mode === "whatsapp")
    {
        // await runWhatsappMode();
    }
    if(mode === "telegram")
    {
        await runTelegramMode();
    }
}