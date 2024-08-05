import { Client } from "discord.js";

import { EventHandler } from "../classes/EventHandler";

export type EventHandlerCreationOptions<T> = {
	client: T;
	debug?: true;
};

export const createEvents = <T = Client>({
	client,
	debug = undefined,
}: EventHandlerCreationOptions<T>): EventHandler => {
	if (!client) throw new Error("createEvents(): Client is required.");
	const handler = new EventHandler(debug ? console.log : undefined);
	handler.setClient<T>(client);
	return handler;
};
