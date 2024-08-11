import { existsSync, mkdirSync, writeFileSync } from "fs";
import path from "path";
import { input } from "@inquirer/prompts";
import { Command } from "commander";

import { addPackageManagerOptions, detectPackageManager } from "../utils";

export function generateCommand(program: Command): void {
	const generateCmd = addPackageManagerOptions(
		program
			.command("generate")
			.description("Generate a new module")
			.argument("<type>", "Type of module to generate (command|event|component|legacycommand)")
			.option("--name <name>", "Name of the module")
			.option("--directory <path>", "Directory path for the module"),
	);

	generateCmd.action(
		async (
			type: string,
			options: {
				usePnpm?: boolean;
				useYarn?: boolean;
				useNpm?: boolean;
				name?: string;
				directory?: string;
			},
		) => {
			if (!["command", "event", "component", "legacycommand"].includes(type)) {
				console.error("Invalid module type. Choose from: command, event, component, legacycommand");
				return;
			}

			const pm = detectPackageManager(
				options.usePnpm ? "pnpm" : options.useYarn ? "yarn" : options.useNpm ? "npm" : null,
			);

			const srcExists = existsSync("./src");
			const defaultDir = srcExists ? `./src/${type}s` : `./${type}s`;

			const nameAnswer = options.name || (await input({ message: `Enter the name for the ${type}:` }));
			const directoryAnswer =
				options.directory ||
				(await input({ message: `Enter the directory path for the ${type}:`, default: defaultDir }));

			const fullPath = path.resolve(directoryAnswer);
			if (!existsSync(fullPath)) {
				mkdirSync(fullPath, { recursive: true });
			}

			const fileName = `${nameAnswer}.ts`;
			const filePath = path.join(fullPath, fileName);

			let template = "";
			switch (type) {
				case "command":
					template = `
import { ChatInputCommandInteraction } from "discord.js";
import { BaseCommand } from "$utils";

export default class ${nameAnswer.charAt(1).toUpperCase() + nameAnswer.slice(1).toLowerCase()}Command implements BaseCommand {
    name = "${nameAnswer}";
    description = "${nameAnswer} description";

    async run(interaction: ChatInputCommandInteraction): Promise<void> {
        
    }
}`;
					break;
				case "event":
					template = `
import { ChatInputCommandInteraction } from "discord.js";
import { Event } from "nhandler";

export default class ${nameAnswer.charAt(1).toUpperCase() + nameAnswer.slice(1).toLowerCase()}Event implements Event {
    name = "${nameAnswer}";

    async run(param: any): Promise<void> {
        
    }
}`;
					break;
				case "component":
					template = `
import { AnyComponentInteraction } from "discord.js";
import { BaseComponent } from "$utils";

export default class ${nameAnswer.charAt(1).toUpperCase() + nameAnswer.slice(1).toLowerCase()}Component implements BaseComponent {
    customId = "${nameAnswer}";

    async run(interaction: AnyComponentInteraction): Promise<void> {
        
    }
}`;
					break;
				case "legacycommand":
					template = `
import { Message } from "discord.js";
import { BaseLegacyCommand } from "$utils";

export default class ${nameAnswer.charAt(1).toUpperCase() + nameAnswer.slice(1).toLowerCase()}LegacyCommand implements BaseLegacyCommand {
    name = "${nameAnswer}";

    async run(message: Message, args: string[]): Promise<void> {
        
    }
};`;
					break;
			}

			writeFileSync(filePath, template.trim());
			console.log(`${type} "${nameAnswer}" has been created at ${filePath}`);
			console.log(`Using package manager: ${pm}`);
		},
	);
}
