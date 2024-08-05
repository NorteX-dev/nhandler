import * as path from "path";
import { Client, IntentsBitField } from "discord.js";
import { config } from "dotenv";
import {
	CommandHandler,
	ComponentHandler,
	createCommands,
	createComponents,
	createEvents,
	createLegacyCommands,
	EventHandler,
	LegacyCommandHandler,
} from "nhandler";

import { PingCommand } from "./commands/ping";
import { TestButtonPress } from "./components/testButtonPress";
import { InteractionCreateEvent } from "./events/interactionCreate";
import { MessageCreateEvent } from "./events/messageCreate";
import { ReadyEvent } from "./events/ready";
import { PingLegacyCommand } from "./legacy/ping";

/*
 * This is the init file. Here you should define your handlers, we init all 3:
 * The command handler - register application commands, such as /ping.
 * The event handler - add callbacks to client events, such as "ready".
 * The component handler - add callbacks to component interactions, such as button presses, select menu selections, modal submits & others.
 * */

config({ path: path.join(__dirname, ".env") });
export class MyClient extends Client {
	// Define the handlers as static fields, so that they're accessible from anywhere.
	static commandHandler: CommandHandler;
	static eventHandler: EventHandler;
	static componentHandler: ComponentHandler;
	static legacyCommandHandler: LegacyCommandHandler;

	constructor() {
		super({
			intents: [
				IntentsBitField.Flags.Guilds,
				IntentsBitField.Flags.GuildMessages,
				IntentsBitField.Flags.MessageContent,
			],
		});

		this.createHandlers();

		// Login using the token.
		super.login(process.env.TOKEN).then(() => {
			console.log("-> Logged in.");
		});
	}

	private createHandlers() {
		// Init the commandHandler using the createCommands method.
		// Right after the initialization we chain a register method to add the PingCommand to our bot.
		MyClient.commandHandler = createCommands<MyClient>({ client: this, debug: true }).register(new PingCommand());
		// Init the eventHandler in similar fashion.
		MyClient.eventHandler = createEvents<MyClient>({ client: this, debug: true })
			.register(new ReadyEvent())
			.register(new InteractionCreateEvent())
			.register(new MessageCreateEvent());
		// ...and the component handler...
		MyClient.componentHandler = createComponents<MyClient>({ client: this, debug: true }).register(
			new TestButtonPress(),
		);
		MyClient.legacyCommandHandler = createLegacyCommands<MyClient>({
			prefixes: ["!"],
			client: this,
			debug: true,
		}).register(new PingLegacyCommand());
	}
}

// Instantiate the client.
new MyClient();
