import { Event } from "../../src/interfaces/Event";
import { MyClient } from "../index";

export class ReadyEvent implements Event {
	client!: MyClient;
	name = "ready";

	async run() {
		MyClient.commandHandler.updateApplicationCommands();
	}
}
