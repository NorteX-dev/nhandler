import { exec } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { confirm, input } from "@inquirer/prompts";
import { Command } from "commander";

import { PackageJson } from "../types";
import { addPackageManagerOptions, detectPackageManager } from "../utils";

export function initCommand(program: Command): void {
	const initCmd = addPackageManagerOptions(
		program
			.command("init")
			.description("Initialize a new project")
			.option("--project-name <name>", "Project name")
			.option("--use-src-dir", "Use a src directory for your project")
			.option("--init-git", "Initialize a git repository")
			.option("--no-init-git", "Don't initialize a git repository"),
	);

	initCmd.action(
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
				options.projectName ||
				(await input({
					message: "Enter the project name:",
					validate: (input: string) => input.trim() !== "" || "Project name cannot be empty",
				}));

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
}
