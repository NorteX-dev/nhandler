import { Interaction } from "discord.js";
import { Event, isAutocompleteInteraction, isCommandInteraction, isComponentInteraction } from "nhandler";

import { MyClient } from "../index";

export class InteractionCreateEvent implements Event {
	client!: MyClient;
	// The name defines the event that is listened to.
	name = "interactionCreate";

	// This run callback is fired when an interaction is created.
	async run(interaction: Interaction) {
		// We check if the interaction is a command, autocomplete or component interaction.
		// The in-built util methods are used to check this. They narrow down the type of the interaction to the proper one, as well.
		if (isCommandInteraction(interaction)) {
			MyClient.commandHandler.runCommand(interaction);
		} else if (isAutocompleteInteraction(interaction)) {
			MyClient.commandHandler.runAutocomplete(interaction);
		} else if (isComponentInteraction(interaction)) {
			MyClient.componentHandler.runComponent(interaction, { settings: "ExampleValue" });
		}
	}
}
