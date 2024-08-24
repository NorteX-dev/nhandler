export class ExecutionError extends Error {
	metadata?: Record<string, unknown>;

	constructor(message?: string, metadata?: Record<string, unknown>) {
		super(message);
		this.name = "ExecutionError";
		this.metadata = metadata;
	}
}
