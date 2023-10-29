import * as path from "path";
import { Client, IntentsBitField } from "discord.js";
import { config } from "dotenv";

import { CommandHandler, ComponentHandler, createCommands, createComponents, createEvents, EventHandler } from "../src";
import { TestCommand } from "./commands/testCommand";
import { TestComponent } from "./components/testComponent";
import { InteractionCreate } from "./events/interactionCreate";
import { ReadyEvent } from "./events/ready";

config({ path: path.join(__dirname, ".env") });
export class MyClient extends Client {
	static commandHandler: CommandHandler;
	static eventHandler: EventHandler;
	static componentHandler: ComponentHandler;

	constructor() {
		super({
			intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages],
		});

		this.createHandlers();

		super.login(process.env.TOKEN).then(() => {
			console.log("-> Logged in.");
		});
	}

	private createHandlers() {
		MyClient.commandHandler = createCommands<MyClient>({ client: this, debug: true }).register(new TestCommand());
		MyClient.eventHandler = createEvents<MyClient>({ client: this, debug: true }).register(new ReadyEvent()).register(new InteractionCreate());
		MyClient.componentHandler = createComponents<MyClient>({ client: this, debug: true }).register(new TestComponent());
	}
}

new MyClient();
