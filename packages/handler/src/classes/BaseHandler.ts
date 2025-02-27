import EventEmitter from "node:events";
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

	protected debugLog(...args: unknown[]) {
		this.emit("debug", ...args);
		if (this.debug) this.debug(...args);
	}

	async updateApplicationCommands(useDirectApi: boolean = false): Promise<void> {
		if (!this.client.application) {
			throw new Error(
				"Application is not ready. Update application commands after the client has emitted 'ready'.",
			);
		}
		this.debugLog("Updating application commands.");
		if (useDirectApi) {
			await fetch(`https://discord.com/api/v10/applications/${this.client.application!.id}/commands`, {
				method: "PUT",
				body: JSON.stringify(commandsToRegister),
				headers: {
					Authorization: `Bot ${this.client.token}`,
					"Content-Type": "application/json; charset=UTF-8",
					"User-Agent": "DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)",
				},
			});
		} else {
			await this.client.application.commands.set(commandsToRegister);
		}
		this.debugLog("Successfully updated application commands.");
	}
}
