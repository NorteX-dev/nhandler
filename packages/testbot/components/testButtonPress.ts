import { AnyComponentInteraction, Component, ExecutionError } from "nhandler";

import { MyClient } from "../index";

export class TestButtonPress implements Component {
	client!: MyClient;

	// Define the customId of the component.
	customId = "test";
	// We use this findFn to match all components that START WITH the customId we defined above.
	// For example, if an incoming component has the customId "test-1", this file will match.
	// This is useful for passing in custom parameters to the `run()` method.
	// Ref. to the first line of the run() method to learn how to parse this result.
	findFn = (i: AnyComponentInteraction) => i.customId.startsWith(this.customId);

	async run(interaction: AnyComponentInteraction, { settings: _settings }: { settings: string }): Promise<void> {
		// We split the customId to get the id passed in when sending the button.
		// Ex. interaction.customId.split("-") -> ["test", "1"], so interaction.customId.split("-")[1] -> "1".
		const id = interaction.customId.split("-")[1];
		interaction.reply({
			content: "Test button pressed! ID parameter: " + id,
			ephemeral: true,
		});
	}
}
