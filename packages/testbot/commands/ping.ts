import { ButtonStyle } from "discord-api-types/v10";
import { ActionRowBuilder, ButtonBuilder, ChatInputCommandInteraction } from "discord.js";
import { Command, ExecutionError } from "nhandler";

import { MyClient } from "../index";

export class PingCommand implements Command {
	client!: MyClient;

	// Top-level defined fields define the command's parameters.
	// Here we define the `name` and `description` of the command.
	// There are more fields that can be defined, but unlike the below two, they are optional.
	name = "ping";
	description = "Pong!";

	// The error method is called when a precondition fails, or when the command returns ExecutionError.
	// You should handle the error by replying to the interaction with the error message.
	error(interaction: ChatInputCommandInteraction, error: ExecutionError): Promise<void> | void {
		interaction.reply({
			content: "Error: " + error.message,
			ephemeral: true,
		});
		return;
	}

	// The run callback is called when the command is ran.
	async run(interaction: ChatInputCommandInteraction): Promise<ExecutionError | void> {
		const thing = 1;

		// @ts-expect-error
		if (thing === 2) {
			// You can throw a ExecutionError. If you do, the exception will be caught & `error()` will be called.
			// If you throw anything else than ExecutionError, the exception will be thrown as normal.
			throw new ExecutionError("thing is 2");
		}

		await interaction.reply({
			content: "Test command ran!",
			components: [
				// To see how the callback for this button looks, go to `components/testButtonPress.ts`.
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder().setCustomId("test-1").setLabel("Test Button").setStyle(ButtonStyle.Primary),
				),
			],
			ephemeral: true,
		});
		// If the interaction is successful, return nothing.
		// void undefined;
	}
}
