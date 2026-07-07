#!/usr/bin/env bun (shebang)

import {Command} from "commander";
import {runwakeup} from "./tui/wakeup.ts";


const program = new Command();

    program
        .name("ForgeCLI")
        .description("Forge CLI for managing Forge projects")
        .version("1.0.0");

    program.command("wakeup").description("show the banner and pick the cli or whatsapp mode")
            .action(async ()=> {
                await runwakeup();
            });

    await program.parseAsync(process.argv);