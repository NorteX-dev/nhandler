import { AutocompleteInteraction, ChatInputCommandInteraction, Interaction } from "discord.js";

import { Event } from "../../src/interfaces/Event";
import { MyClient } from "../index";

export class InteractionCreateEvent implements Event {
	client!: MyClient;
	name = "interactionCreate";

	async run(interaction: Interaction) {
		if (interaction instanceof ChatInputCommandInteraction) {
			MyClient.commandHandler.runCommand(interaction);
		} else if (interaction instanceof AutocompleteInteraction) {
			MyClient.commandHandler.runAutocomplete(interaction);
		}
	}
}
