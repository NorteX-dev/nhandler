export class ComponentError extends Error {
	metadata?: Record<string, unknown>;

	constructor(message?: string, metadata?: Record<string, unknown>) {
		super(message);
		this.name = "ComponentError";
		this.metadata = metadata;
	}
}
