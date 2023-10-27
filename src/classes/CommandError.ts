export class CommandError extends Error {
	metadata?: Record<string, unknown>;

	constructor(message?: string, metadata?: Record<string, unknown>) {
		super(message);
		this.name = "CommandError";
		this.metadata = metadata;
	}
}
