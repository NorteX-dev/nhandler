import { EventEmitter } from "events";
import { Client } from "discord.js";

export let commandsToRegister: any[] = [];

export class BaseHandler extends EventEmitter {
	public client!: Client;
	public debug?: (...args: any[]) => void;

	constructor(debug?: (...args: any[]) => void) {
		super();
		this.debug = debug;
	}

	setClient<T>(client: T) {
		this.client = client as unknown as Client;
		return this;
	}

	public debugLog(...args: unknown[]) {
		this.emit("debug", ...args);
		if (this.debug) this.debug(...args);
	}

	updateApplicationCommands() {
		if (!this.client.application) {
			throw new Error(
				"Application is not ready. Update application commands after the client has emitted 'ready'.",
			);
		}
		this.debugLog("Updating application commands.");
		this.client.application.commands.set(commandsToRegister).then(() => {
			this.debugLog("Successfully updated application commands.");
		});
	}
}
