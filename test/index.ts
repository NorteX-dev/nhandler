import * as path from "path";
import { AutocompleteInteraction, ChatInputCommandInteraction, Client, IntentsBitField } from "discord.js";
import { config } from "dotenv";

import { createCommands } from "../src";
import { TestCommand } from "./testCommand";

config({ path: path.join(__dirname, ".env") });
export class MyClient extends Client {
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
			if (interaction instanceof ChatInputCommandInteraction) {
				commandHandler.runCommand(interaction);
			} else if (interaction instanceof AutocompleteInteraction) {
				commandHandler.runAutocomplete(interaction);
			}
		});

		super.login(process.env.TOKEN).then((r) => {
			console.log("logged in");
		});
	}

	private createHandler() {
		const commandHandler = createCommands<MyClient>({ client: this, debug: true });
		commandHandler.registerCommand(new TestCommand());
		return commandHandler;
	}
}

new MyClient();
