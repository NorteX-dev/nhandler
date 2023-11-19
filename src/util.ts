import {
	AutocompleteInteraction,
	ButtonInteraction,
	ChannelSelectMenuInteraction,
	ChatInputCommandInteraction,
	MentionableSelectMenuInteraction,
	MessageContextMenuCommandInteraction,
	ModalSubmitInteraction,
	RoleSelectMenuInteraction,
	StringSelectMenuInteraction,
	UserContextMenuCommandInteraction,
	UserSelectMenuInteraction,
} from "discord.js";

export type AnyCommandInteraction =
	| ChatInputCommandInteraction
	| UserContextMenuCommandInteraction
	| MessageContextMenuCommandInteraction;

export type AnyComponentInteraction =
	| ButtonInteraction
	| StringSelectMenuInteraction
	| UserSelectMenuInteraction
	| ChannelSelectMenuInteraction
	| RoleSelectMenuInteraction
	| MentionableSelectMenuInteraction
	| ModalSubmitInteraction;

export const isCommandInteraction = (interaction: any): interaction is AnyCommandInteraction => {
	return (
		interaction instanceof ChatInputCommandInteraction ||
		interaction instanceof UserContextMenuCommandInteraction ||
		interaction instanceof MessageContextMenuCommandInteraction
	);
};

export const isAutocompleteInteraction = (interaction: any): interaction is AutocompleteInteraction => {
	return interaction instanceof AutocompleteInteraction;
};

export const isComponentInteraction = (interaction: any): interaction is AnyComponentInteraction => {
	return (
		interaction instanceof ButtonInteraction ||
		interaction instanceof StringSelectMenuInteraction ||
		interaction instanceof UserSelectMenuInteraction ||
		interaction instanceof ChannelSelectMenuInteraction ||
		interaction instanceof RoleSelectMenuInteraction ||
		interaction instanceof MentionableSelectMenuInteraction ||
		interaction instanceof ModalSubmitInteraction
	);
};
