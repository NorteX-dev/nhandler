import { Event } from "nhandler";

import { MyClient } from "../index";

export class ReadyEvent implements Event {
	client!: MyClient;
	// The name defines the event that is listened to.
	name = "ready";

	// This run callback is fired when an interaction is created.
	async run() {
		// We update the application commands when the bot is ready.
		// Updating the commands is essential for the bot to work.
		// This tells Discord what commands are available for the bot.
		// This must be done only after the ready event fires, because `client.application` must be defined.
		MyClient.commandHandler.updateApplicationCommands();
	}
}
