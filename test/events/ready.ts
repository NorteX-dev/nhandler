import { Event } from "../../out";
import { MyClient } from "../index";

export class ReadyEvent implements Event {
	client!: MyClient;
	name = "ready";

	async run() {
		MyClient.commandHandler.updateApplicationCommands();
	}
}
