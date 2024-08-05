import { Client } from "discord.js";

import { LegacyCommandHandler } from "../classes/LegacyCommandHandler";

export type LegacyCommandHandlerCreationOptions<T> = {
	client: T;
	prefixes: string[];
	debug?: true;
};

export const createLegacyCommands = <T = Client>({
	client,
	prefixes = [],
	debug = undefined,
}: LegacyCommandHandlerCreationOptions<T>): LegacyCommandHandler => {
	if (!client || !prefixes || !prefixes.length)
		throw new Error("createLegacyCommands(): Client and prefix is required.");
	const handler = new LegacyCommandHandler(prefixes, debug ? console.log : undefined);
	handler.setClient<T>(client);
	return handler;
};
