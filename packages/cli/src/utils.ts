import { execSync } from "child_process";
import { Command } from "commander";

import { PackageManager } from "./types";

export function detectPackageManager(forcedPM?: PackageManager | null): PackageManager {
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

export function addPackageManagerOptions(command: Command): Command {
	return command
		.option("--use-pnpm", "Force use of pnpm")
		.option("--use-yarn", "Force use of yarn")
		.option("--use-npm", "Force use of npm");
}
