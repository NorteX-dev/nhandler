import { ChatInputCommandInteraction, Client, IntentsBitField } from "discord.js";

import { createCommands } from "../src";
import { token } from "./config";
import { TestCommand } from "./testCommand";

class MyClient extends Client {
	constructor() {
		super({
			intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages],
		});

		const commandHandler = this.createHandler();

		this.on("ready", () => {
			console.log("ready");
			commandHandler.updateApplicationCommands();
		});

		this.on("interactionCreate", (interaction) => {
			if (!(interaction instanceof ChatInputCommandInteraction)) {
				return;
			}
			commandHandler.runCommand(interaction, {
				settings: "Abc",
			});
		});

		super.login(token).then((r) => {
			console.log("logged in");
		});
	}

	private createHandler() {
		const commandHandler = createCommands<typeof this>({ client: this, debug: true });
		commandHandler.registerCommand(new TestCommand());
		return commandHandler;
	}
}

new MyClient();
