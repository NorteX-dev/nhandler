import { readdirSync, statSync } from "fs";
import * as path from "path";

import { Event } from "../interfaces/Event";
import { BaseHandler } from "./BaseHandler";

export class EventHandler extends BaseHandler {
	events: Event[] = [];

	eventExists(name: string) {
		return this.events.some((ev) => ev.name === name);
	}

	register(event: Event): EventHandler {
		if (this.eventExists(event.name))
			throw new Error(`Cannot register event with duplicate name: '${event.name}'.`);
		this.debugLog(`Registered event ${event.name}.`);
		event.client = this.client;
		this.client[event.once ? "once" : "on"](event.name, (...args) => event.run(...args));
		this.events.push(event);
		return this;
	}

	/**
	 * registerFromDir automatically loads files & creates class instances in the directory specified.
	 * If recurse is true, it will also load commands from subdirectories.
	 * Auto-load commands need to have a __default__ export. Otherwise they will be ignored.
	 * @param dir The directory to load files from.
	 * @param recurse Whether to load files from subdirectories.
	 * */
	public registerFromDir(dir: string, recurse: boolean = true): EventHandler {
		if (!this.client) throw new Error("Client not set.");
		this.debugLog("Loading components from directory " + dir + ".");
		const filesInDirectory = readdirSync(dir);
		for (const file of filesInDirectory) {
			const absolutePath = path.join(dir, file);
			if (recurse && statSync(absolutePath).isDirectory()) {
				this.registerFromDir(absolutePath);
			} else if (file.endsWith(".js") || file.endsWith(".ts")) {
				delete require.cache[require.resolve(absolutePath)];
				const defaultExport = require(absolutePath).default;
				if (!defaultExport) {
					this.debugLog(`File ${absolutePath} does not default-export a class. Ignoring.`);
					continue;
				}
				const instance = new defaultExport(this.client);
				if (!EventHandler.isInstanceOfEvent(instance)) {
					this.debugLog(`File ${absolutePath} does not correctly implement Event.`);
					continue;
				}
				this.register(instance);
			}
		}
		return this;
	}

	private static isInstanceOfEvent(object: any): object is Event {
		return object.name !== undefined;
	}
}
