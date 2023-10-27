import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { ChatInputCommandInteraction } from "discord.js";

import { CommandError } from "../src/classes/CommandError";
import { Command } from "../src/interfaces/Command";

export class TestCommand implements Command {
	name = "test";
	description = "test command";
	get options() {
		return [
			{
				type: ApplicationCommandOptionType.String,
				name: "test3",
				description: "test3 option",
				required: true,
			},
		];
	}

	error(interaction: ChatInputCommandInteraction, error: CommandError): Promise<void> | void {
		return undefined;
	}

	// TODO : add metadata optional generic type
	async run<M>(interaction: ChatInputCommandInteraction, metadata: M): Promise<CommandError | void> {
		const thing = 1;
		console.log(metadata.settings);

		// @ts-expect-error this is a test, this should intentionally always fail or always succeed
		if (thing === 2) {
			return new CommandError("thing is 2");
		}

		await interaction.reply({
			content: "test command ran",
			ephemeral: true,
		});
	}
}
