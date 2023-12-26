export class ContextMenuActionError extends Error {
	metadata?: Record<string, unknown>;

	constructor(message?: string, metadata?: Record<string, unknown>) {
		super(message);
		this.name = "ContextMenuActionError";
		this.metadata = metadata;
	}
}
