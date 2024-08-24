export type PackageManager = "pnpm" | "yarn" | "npm";

export interface PackageJson {
	name: string;
	scripts?: {
		[key: string]: string;
	};
	[key: string]: any;
}
