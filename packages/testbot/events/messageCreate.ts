import { Message } from "discord.js";
import { Event } from "nhandler";

import { MyClient } from "../index";

export class MessageCreateEvent implements Event {
	client!: MyClient;
	// The name defines the event that is listened to.
	name = "messageCreate";

	// This run callback is fired when an interaction is created.
	async run(message: Message) {
		MyClient.legacyCommandHandler.runLegacyCommand(message);
	}
}
