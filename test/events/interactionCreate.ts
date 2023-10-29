import { Interaction } from "discord.js";

import { Event } from "../../src/interfaces/Event";
import { isAutocompleteInteraction, isCommandInteraction, isComponentInteraction } from "../../src/util";
import { MyClient } from "../index";

export class InteractionCreate implements Event {
	client!: MyClient;
	name = "interactionCreate";

	async run(interaction: Interaction) {
		if (isCommandInteraction(interaction)) {
			MyClient.commandHandler.runCommand(interaction);
		} else if (isAutocompleteInteraction(interaction)) {
			MyClient.commandHandler.runAutocomplete(interaction);
		} else if (isComponentInteraction(interaction)) {
			MyClient.componentHandler.runComponent(interaction, { settings: "a" });
		}
	}
}
