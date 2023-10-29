import { EventEmitter } from "events";
import { Client } from "discord.js";

export class BaseHandler extends EventEmitter {
	public client!: Client;
	public debug: boolean;

	constructor(debug: boolean) {
		super();
		this.debug = debug;
	}

	setClient<T>(client: T) {
		this.client = client as unknown as Client;
		return this;
	}

	public debugLog(...args: unknown[]) {
		this.emit("debug", ...args);
		if (this.debug) console.log("[NHandler DEBUG]", ...args);
	}
}
