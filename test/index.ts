import * as path from "path";
import { AutocompleteInteraction, ChatInputCommandInteraction, Client, IntentsBitField } from "discord.js";
import { config } from "dotenv";

import { createCommands } from "../src";
import { CommandHandler } from "../src/classes/CommandHandler";
import { EventHandler } from "../src/classes/EventHandler";
import { createEvents } from "../src/functions/createEvents";
import { TestCommand } from "./commands/testCommand";
import { InteractionCreateEvent } from "./events/interactionCreateEvent";
import { ReadyEvent } from "./events/ready";

config({ path: path.join(__dirname, ".env") });
export class MyClient extends Client {
	static commandHandler: CommandHandler;
	static eventHandler: EventHandler;

	constructor() {
		super({
			intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages],
		});

		this.createHandlers();

		super.login(process.env.TOKEN).then(() => {
			console.log("logged in");
		});
	}

	private createHandlers() {
		MyClient.commandHandler = createCommands<MyClient>({ client: this, debug: true });
		MyClient.commandHandler.register(new TestCommand());
		MyClient.eventHandler = createEvents<MyClient>({ client: this, debug: true });
		MyClient.eventHandler.register(new ReadyEvent());
		MyClient.eventHandler.register(new InteractionCreateEvent());
	}
}

new MyClient();
