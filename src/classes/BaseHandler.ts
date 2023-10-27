import { Client } from "discord.js";

export class BaseHandler {
	public client!: Client;
	public debug: boolean;

	constructor(debug: boolean) {
		this.debug = debug;
	}

	setClient<T>(client: T) {
		this.client = client as unknown as Client;
		return this;
	}

	public debugLog(...args: unknown[]) {
		if (this.debug) console.log("[NHandler DEBUG]", ...args);
	}
}
