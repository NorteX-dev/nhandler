import { Client } from "discord.js";

import { CommandHandler } from "../classes/CommandHandler";

export type CommandHandlerCreationOptions<T> = {
	client: T;
	debug?: true;
};

export const createCommands = <T = Client>({
	client,
	debug = undefined,
}: CommandHandlerCreationOptions<T>): CommandHandler => {
	if (!client) throw new Error("createCommands(): Client is required.");
	const handler = new CommandHandler(debug ? console.log : undefined);
	handler.setClient<T>(client);
	return handler;
};
