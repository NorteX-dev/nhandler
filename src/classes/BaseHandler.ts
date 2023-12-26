import { EventEmitter } from "events";
import { Client } from "discord.js";

export class BaseHandler extends EventEmitter {
	public client!: Client;
	public debug: boolean;

	public commandsToRegister: any[] = [];

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

	checkApplicationReady(): void {
		if (!this.client.application) {
			throw new Error(
				"Application is not ready. Update application commands after the client has emitted 'ready'.",
			);
		}
	}

	updateApplicationCommands() {
		this.checkApplicationReady();
		this.debugLog("Updating application commands.");
		this.debugLog("Sending out", this.commandsToRegister);
		this.client.application!.commands.set(this.commandsToRegister).then(() => {
			this.debugLog("Successfully updated application commands.");
			this.commandsToRegister = [];
		});
	}
}
