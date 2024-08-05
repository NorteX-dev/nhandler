import { exec, execSync } from "child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { Command } from "commander";
import inquirer from "inquirer";

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

const initCommand = addPackageManagerOptions(program.command("init").description("Initialize a new project"));

initCommand.action(async (options: { usePnpm?: boolean; useYarn?: boolean; useNpm?: boolean }) => {
	const pm = detectPackageManager(
		options.usePnpm ? "pnpm" : options.useYarn ? "yarn" : options.useNpm ? "npm" : null,
	);

	const answers = await inquirer.prompt([
		{
			type: "input",
			name: "projectName",
			message: "Enter the project name:",
			validate: (input: string) => input.trim() !== "" || "Project name cannot be empty",
		},
		{
			type: "confirm",
			name: "useSrcDir",
			message: "Use a src directory for your project?",
			default: true,
		},
		{
			type: "confirm",
			name: "initGit",
			message: "Initialize a git repository?",
			default: true,
		},
	] as any);

	const fullPath = path.resolve(answers.projectName);
	console.log("Initializing a new project inside:", fullPath);

	const cmds: string[] = [
		`git clone https://github.com/NorteX-dev/modular-dbot-template.git "${fullPath}"`,
		`cd "${fullPath}"`,
		`${pm} install`,
	];

	if (answers.useSrcDir) {
		cmds.push(`mkdir src`);
		cmds.push(`mv commands events components src/`);
	}

	if (!answers.initGit) {
		cmds.push(`rm -rf .git`);
	}

	exec(cmds.join(" && "), (err, stdout, stderr) => {
		if (err) {
			console.error("Error initializing project:", err);
			return;
		}

		const packageJsonPath = path.join(fullPath, "package.json");
		const packageJson: PackageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
		packageJson.name = answers.projectName;
		writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

		console.log(`Project "${answers.projectName}" has been initialized successfully using ${pm}!`);
		console.log("Project details:");
		console.log(`- Using src directory: ${answers.useSrcDir ? "Yes" : "No"}`);
		console.log(`- Git initialized: ${answers.initGit ? "Yes" : "No"}`);
	});
});

const generateCommand = addPackageManagerOptions(
	program
		.command("generate")
		.description("Generate a new module")
		.argument("<type>", "Type of module to generate (command|event|component|legacycommand)"),
);

generateCommand.action(async (type: string, options: { usePnpm?: boolean; useYarn?: boolean; useNpm?: boolean }) => {
	if (!["command", "event", "component", "legacycommand"].includes(type)) {
		console.error("Invalid module type. Choose from: command, event, component, legacycommand");
		return;
	}

	const pm = detectPackageManager(
		options.usePnpm ? "pnpm" : options.useYarn ? "yarn" : options.useNpm ? "npm" : null,
	);

	const srcExists = existsSync("./src");
	const defaultDir = srcExists ? `./src/${type}s` : `./${type}s`;

	const answers = await inquirer.prompt([
		{
			type: "input",
			name: "directory",
			message: `Enter the directory path for the ${type}:`,
			default: defaultDir,
		},
		{
			type: "input",
			name: "name",
			message: `Enter the name for the ${type}:`,
		},
	] as any);

	const fullPath = path.resolve(answers.directory);
	if (!existsSync(fullPath)) {
		mkdirSync(fullPath, { recursive: true });
	}

	const fileName = `${answers.name}.js`;
	const filePath = path.join(fullPath, fileName);

	let template = "";
	switch (type) {
		case "command":
			template = `
export default {
    name: "${answers.name}",
    description: "Description of ${answers.name} command",
    execute: async (interaction) => {
        // Command logic here
    },
};`;
			break;
		case "event":
			template = `
export default {
    name: "${answers.name}",
    once: false,
    execute: async (...args) => {
        // Event logic here
    },
};`;
			break;
		case "component":
			template = `
export default {
    name: "${answers.name}",
    execute: async (interaction) => {
        // Component logic here
    },
};`;
			break;
		case "legacycommand":
			template = `
export default {
    name: "${answers.name}",
    description: "Description of ${answers.name} legacy command",
    execute: async (message, args) => {
        // Legacy command logic here
    },
};`;
			break;
	}

	writeFileSync(filePath, template.trim());
	console.log(`${type} "${answers.name}" has been created at ${filePath}`);
	console.log(`Using package manager: ${pm}`);
});

program.parse(process.argv);
