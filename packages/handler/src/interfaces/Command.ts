import { ApplicationCommandOptionType, LocalizationMap } from "discord-api-types/v10";
import { AutocompleteInteraction, ChatInputCommandInteraction, Client } from "discord.js";

import { ExecutionError } from "../errors/ExecutionError";

type SubcommandOptionTypesUnion =
	| ApplicationCommandOptionType.Subcommand
	| ApplicationCommandOptionType.SubcommandGroup;
type NormalOptionTypesUnion =
	| ApplicationCommandOptionType.String
	| ApplicationCommandOptionType.Integer
	| ApplicationCommandOptionType.Boolean
	| ApplicationCommandOptionType.User
	| ApplicationCommandOptionType.Channel
	| ApplicationCommandOptionType.Role
	| ApplicationCommandOptionType.Mentionable
	| ApplicationCommandOptionType.Number
	| ApplicationCommandOptionType.Attachment;

// SubcommandWithOptions is a subcommand or subcommand group and takes optional `options`
export type SubcommandWithOptions = {
	name: string;
	nameLocalizations?: LocalizationMap;
	description: string;
	descriptionLocalizations?: LocalizationMap;
	type: SubcommandOptionTypesUnion;
	options?: CommandOption[];
};

export type Choice = {
	name: string;
	nameLocalizations?: LocalizationMap;
	value: string;
};

// ArgumentOption is a normal option (ref. NormalOptionTypes) and does not take `options` as a property
export type ArgumentOption = {
	name: string;
	nameLocalizations?: LocalizationMap;
	description: string;
	descriptionLocalizations?: LocalizationMap;
	type: NormalOptionTypesUnion;
	required?: boolean;
	autocomplete?: boolean;
	choices?: Choice[];
};
export type CommandOption = SubcommandWithOptions | ArgumentOption;

export interface Command<T = Client> {
	/**
	 * client - the client that the command is registered to
	 * */
	client: T;
	/**
	 * name - defines the name of the command
	 * */
	name: string;
	/**
	 * nameLocalizations - defines the localizations of the name of the command
	 * */
	nameLocalizations?: LocalizationMap;
	/**
	 * description - defines the description of the command
	 * */
	description: string;
	/**
	 * descriptionLocalizations - defines the localizations of the description of the command
	 * */
	descriptionLocalizations?: LocalizationMap;
	/**
	 * options - array of Command#CommandOption that specify the subcommands or arguments of the command
	 * */
	options?: CommandOption[];
	/**
	 * allowDm - boolean, enables or disables the command for DMs
	 * */
	allowDm?: boolean;
	/**
	 * guildId - if specified, the command is going to be guild-scoped
	 * */
	guildId?: string;
	/**
	 * allowedGuilds - array of guild IDs in which the command is permitted to be used
	 * */
	allowedGuilds?: string[];
	/**
	 * allowedUsers - array of user IDs that are permitted to use the command
	 * */
	allowedUsers?: string[];
	/**
	 * defaultMemberPermissions - a permissions bitfield ([PermissionsBitField](https://old.discordjs.dev/#/docs/discord.js/main/class/PermissionsBitField)) written in bigint, that defines the default permissions for the command
	 * */
	defaultMemberPermissions?: bigint;
	/**
	 * integrationTypes - array of integration types that the command is allowed to be used in
	 * */
	integrationTypes?: number[];
	/**
	 * contexts - array of contexts in which the command is allowed to be used
	 * */
	contexts?: number[];
	/**
	 * metadata - miscellaneous data for the command, for example category
	 * */
	metadata?: Record<string, string>;

	/**
	 * for autocomplete interactions, this function will called when the user types in the command name
	 *
	 * this method should respond using interaction.respond()
	 * */
	autocomplete?: (interaction: AutocompleteInteraction, metadata: any) => Promise<void> | void;
	/**
	 * this function will be called when an error occurs while executing the command,
	 * for example an unauthorized user tries to use the command
	 *
	 * this will also be called if run() throws a ExecutionError
	 *
	 * this method should respond using interaction.respond()
	 * */
	error?: (interaction: ChatInputCommandInteraction, error: ExecutionError) => Promise<void> | void;
	/**
	 * this function will be called when the command is successfully executed.
	 *
	 * this method should return a Promise<void>.
	 *
	 * if the command throws a ExecutionError, this.error will be called, otherwise (in case of returning void) the command will be considered successful
	 * */
	run: (interaction: ChatInputCommandInteraction, metadata: any) => Promise<void>;
}
