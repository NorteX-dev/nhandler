import { ApplicationCommandOptionType, ButtonStyle } from "discord-api-types/v10";
import { ActionRowBuilder, AutocompleteInteraction, ButtonBuilder, ChatInputCommandInteraction } from "discord.js";

import { CommandError } from "../../src/classes/CommandError";
import { Command } from "../../src/interfaces/Command";
import { MyClient } from "../index";

export class TestCommand implements Command {
	client!: MyClient;

	name = "test";
	nameLocalizations = {
		pl: "testowa",
	};
	description = "test command";
	descriptionLocalizations = {
		pl: "testowa komenda",
	};
	metadata = {
		category: "test",
	};
	options = [
		{
			type: ApplicationCommandOptionType.String,
			name: "test3",
			description: "test3 option",
			required: true,
		},
	];

	autocomplete(interaction: AutocompleteInteraction): Promise<void> | void {
		return interaction.respond([
			{ name: "test1", value: "test1" },
			{ name: "test2", value: "test2" },
		]);
	}

	error(interaction: ChatInputCommandInteraction, error: CommandError): Promise<void> | void {
		interaction.reply({
			content: "Error: " + error.message,
			ephemeral: true,
		});
		return;
	}

	async run(interaction: ChatInputCommandInteraction): Promise<CommandError | void> {
		const thing = 1;

		// @ts-ignore this is a test, this should intentionally always fail or always succeed
		if (thing === 2) {
			return new CommandError("thing is 2");
		}

		await interaction.reply({
			content: "test command ran",
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder().setCustomId("test-1").setLabel("test").setStyle(ButtonStyle.Primary),
				),
			],
			ephemeral: true,
		});
	}
}
