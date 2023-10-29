import { Event } from "../interfaces/Event";
import { BaseHandler } from "./BaseHandler";

export class EventHandler extends BaseHandler {
	events: Event[] = [];

	eventExists(name: string) {
		return this.events.some((ev) => ev.name === name);
	}

	register(event: Event): EventHandler {
		if (this.eventExists(event.name)) throw new Error(`Cannot register event with duplicate name: '${event.name}'.`);
		this.debugLog(`Registered event ${event.name}.`);
		event.client = this.client;
		this.client[event.once ? "once" : "on"](event.name, (...args) => event.run(...args));
		this.events.push(event);
		return this;
	}
}
