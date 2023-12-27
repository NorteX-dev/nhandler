import { ApplicationCommandType } from "discord-api-types/v10";
import { Client } from "discord.js";

import { CommandError } from "../errors/CommandError";
import { ContextMenuInteraction } from "../util";

export interface ContextMenuAction {
	/**
	 * client - the client that the command is registered to
	 * */
	client: Client;
	/**
	 * name - defines the name of the command
	 * */
	name: string;
	/**
	 * type - defines the type of the context menu - can either be user or message
	 * */
	type: ApplicationCommandType;
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
	 * metadata - miscellaneous data for the command, for example category
	 * */
	metadata?: Record<string, string>;

	/**
	 * this function will be called when an error occurs while executing the command,
	 * for example an unauthorized user tries to use the command
	 *
	 * this will also be called if run() throws a CommandError
	 *
	 * this method should respond using interaction.respond()
	 * */
	error?: (interaction: ContextMenuInteraction, error: CommandError) => Promise<void> | void;
	/**
	 * this function will be called when the action is successfully executed.
	 *
	 * this method should return a Promise<void>.
	 *
	 * if the command throws a ContextMenuActionError, this.error will be called, otherwise (in case of returning void) the action will be considered successful.
	 * */
	run: (interaction: ContextMenuInteraction, metadata: any) => Promise<void>;
}
