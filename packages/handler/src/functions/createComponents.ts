import { Client } from "discord.js";

import { ComponentHandler } from "../classes/ComponentHandler";

export type ComponentHandlerCreationOptions<T> = {
	client: T;
	debug?: true;
};

export const createComponents = <T = Client>({
	client,
	debug = undefined,
}: ComponentHandlerCreationOptions<T>): ComponentHandler => {
	if (!client) throw new Error("createComponents(): Client is required.");
	const handler = new ComponentHandler(debug ? console.log : undefined);
	handler.setClient<T>(client);
	return handler;
};
