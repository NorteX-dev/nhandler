import { Client } from "discord.js";

export interface Event<T = Client> {
	/**
	 * client - the client that the command is registered to
	 * */
	client: T;
	/**
	 * name - name of the event
	 * */
	name: string;
	/**
	 * once - delete listener after 1 execution
	 * */
	once?: boolean;
	/**
	 * this function will be called when the event is triggered
	 * */
	run: (...args: any[]) => void;
}
