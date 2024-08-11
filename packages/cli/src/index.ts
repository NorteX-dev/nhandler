import { Command } from "commander";

import { generateCommand } from "./commands/generate";
import { initCommand } from "./commands/init";

const program = new Command();

program
	.name("nhandler")
	.description("The nhandler command line utility for initalizing projects and generating new modules.")
	.version("0.1.0");

initCommand(program);
generateCommand(program);

program.parse(process.argv);
