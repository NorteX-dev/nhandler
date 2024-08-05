import { Client, Message } from "discord.js";

import { ExecutionError } from "../errors/ExecutionError";

export interface LegacyCommandArgument {
	name: string;
	description: string;
	required?: boolean;
	// Spread argument is the last one and takes all the remaining arguments
	spread?: boolean;
}

export interface LegacyCommand {
	/**
	 * client - the client that the command is registered to
	 * */
	client: Client;
	/**
	 * name - defines the name of the command
	 * */
	name: string;
	/**
	 * description - defines the description of the command
	 * */
	description: string;
	/**
	 * args - array of LegacyCommandArgument that specify the argument validators for this command
	 * */
	args?: LegacyCommandArgument[];
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
	 * this function will be called when an error occurs while executing the command,
	 * for example an unauthorized user tries to use the command
	 *
	 * this will also be called if run() throws a ExecutionError
	 *
	 * this method should respond using interaction.respond()
	 * */
	error?: (message: Message, args: string[], error: ExecutionError) => Promise<void> | void;
	/**
	 * this function will be called when the command is successfully executed.
	 *
	 * this method should return a Promise<void>.
	 *
	 * if the command throws a ExecutionError, this.error will be called, otherwise (in case of returning void) the command will be considered successful
	 * */
	run: (message: Message, args: string[], metadata: any) => Promise<void>;
}
