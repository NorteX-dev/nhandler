import { exec, execSync } from "child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { confirm, input } from "@inquirer/prompts";
import { Command } from "commander";

const program = new Command();

type PackageManager = "pnpm" | "yarn" | "npm";

interface PackageJson {
	name: string;
	scripts?: {
		[key: string]: string;
	};
	[key: string]: any;
}

function detectPackageManager(forcedPM?: PackageManager | null): PackageManager {
	if (forcedPM) return forcedPM;

	const managers: PackageManager[] = ["pnpm", "yarn", "npm"];
	for (const pm of managers) {
		try {
			execSync(`${pm} --version`, { stdio: "ignore" });
			return pm;
		} catch (e) {}
	}
	return "npm";
}

function addPackageManagerOptions(command: Command): Command {
	return command
		.option("--use-pnpm", "Force use of pnpm")
		.option("--use-yarn", "Force use of yarn")
		.option("--use-npm", "Force use of npm");
}

program
	.name("nbot")
	.description("The NBot command line utility for generating projects and adding modules.")
	.version("0.1.0");

const initCommand = addPackageManagerOptions(
	program
		.command("init")
		.description("Initialize a new project")
		.option("--project-name <name>", "Project name")
		.option("--use-src-dir", "Use a src directory for your project")
		.option("--no-init-git", "Don't initialize a git repository"),
);

initCommand.action(
	async (options: {
		usePnpm?: boolean;
		useYarn?: boolean;
		useNpm?: boolean;
		projectName?: string;
		useSrcDir?: boolean;
		initGit?: boolean;
	}) => {
		const pm = detectPackageManager(
			options.usePnpm ? "pnpm" : options.useYarn ? "yarn" : options.useNpm ? "npm" : null,
		);

		const projectName =
			options.projectName !== undefined
				? options.projectName
				: await input({
						message: "Enter the project name:",
						validate: (input: string) => input.trim() !== "" || "Project name cannot be empty",
					});

		const useSrcDir =
			options.useSrcDir !== undefined
				? options.useSrcDir
				: await confirm({
						message: "Use a src directory for your project?",
						default: true,
					});

		const initGit =
			options.initGit !== undefined
				? options.initGit
				: await confirm({
						message: "Initialize a git repository?",
						default: true,
					});

		const fullPath = path.resolve(projectName);
		console.log("Initializing a new project inside:", fullPath);

		const cmds: string[] = [
			`git clone https://github.com/NorteX-dev/modular-dbot-template.git "${fullPath}"`,
			`cd "${fullPath}"`,
			`${pm} install`,
		];

		if (useSrcDir) {
			cmds.push(`mkdir src`);
			cmds.push(`mv commands events components src/`);
		}

		if (!initGit) {
			cmds.push(`rm -rf .git`);
		}

		exec(cmds.join(" && "), (err, stdout, stderr) => {
			if (err) {
				console.error("Error initializing project:", err);
				return;
			}

			const packageJsonPath = path.join(fullPath, "package.json");
			const packageJson: PackageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
			packageJson.name = projectName;
			writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

			console.log(`Project "${projectName}" has been initialized successfully using ${pm}!`);
			console.log("Project details:");
			console.log(`- Using src directory: ${useSrcDir ? "Yes" : "No"}`);
			console.log(`- Git initialized: ${initGit ? "Yes" : "No"}`);
		});
	},
);

const generateCommand = addPackageManagerOptions(
	program
		.command("generate")
		.description("Generate a new module")
		.argument("<type>", "Type of module to generate (command|event|component|legacycommand)")
		.option("--name <name>", "Name of the module")
		.option("--directory <path>", "Directory path for the module"),
);

generateCommand.action(
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

program.parse(process.argv);
