import { readFileSync } from "./util";

export const loadConfig = async <T>(configShape: ZodObject<any>): Promise<T> => {
	let yamlFile: any;
	try {
		yamlFile = yaml.load(readFileSync(path.join(__dirname, "../../config.yml"), "utf-8"));
	} catch (err) {
		severeLog("Fatal: config.yml is not a valid YAML file.");
		process.exit(1);
	}

	let result = configShape.safeParse(yamlFile);
	if (!result.success) {
		severeLog("Fatal: Failed to parse configuration file. Errors:");
		severeLog(prettifyZodError(result.error));
		process.exit(1);
	}

	let config = result.data;
	return <T>config;
};
