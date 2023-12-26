import { Client } from "discord.js";

import { ComponentError } from "../errors/ComponentError";
import { AnyComponentInteraction } from "../util";

export interface Component {
	/**
	 * client - the client that the command is registered to
	 * */
	client: Client;
	/**
	 * customId - the custom id property of the component
	 * */
	customId: string;
	/**
	 * findFn - method which defines how to find the component
	 *
	 * If findFn returns true for a component, it will be run
	 *
	 * findFn will be rerun per each interaction
	 *
	 * if findFn is not defined, a simple check for customId equality will be used
	 *
	 * @example
	 * findFn(i: AnyComponentInteraction) {
	 *   return i.customId.startsWith(this.customId);
	 * }
	 * */
	findFn?: (event: AnyComponentInteraction) => boolean;

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
	error?: (interaction: AnyComponentInteraction, error: ComponentError) => Promise<void> | void;
	/**
	 * this function will be called when the command is successfully executed.
	 *
	 * this method should return a Promise<void>.
	 *
	 * if the command throws a ComponentError, this.error will be called, otherwise (in case of returning void) the component execution will be considered successful.
	 * */
	run: (interaction: AnyComponentInteraction, metadata: any) => Promise<void>;
}
