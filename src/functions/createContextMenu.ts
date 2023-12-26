import { Client } from "discord.js";

import { ContextMenuHandler } from "../classes/ContextMenuHandler";

export type ContextMenuHandlerCreationOptions<T> = {
	client: T;
	debug?: true;
};

export const createContextMenu = <T = Client>({
	client,
	debug = undefined,
}: ContextMenuHandlerCreationOptions<T>): ContextMenuHandler => {
	if (!client) throw new Error("createContextMenu(): Client is required.");
	const handler = new ContextMenuHandler(debug ?? false);
	handler.setClient<T>(client);
	return handler;
};
