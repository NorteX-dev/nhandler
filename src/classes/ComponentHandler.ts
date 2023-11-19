import { readdirSync, statSync } from "fs";
import * as path from "path";

import { CommandError } from "../errors/CommandError";
import { ComponentError } from "../errors/ComponentError";
import { Component } from "../interfaces/Component";
import { AnyComponentInteraction } from "../util";
import { BaseHandler } from "./BaseHandler";

export class ComponentHandler extends BaseHandler {
	components: Component[] = [];

	componentExists(name: string) {
		return this.components.some((cmp) => cmp.customId === name);
	}

	register(component: Component): ComponentHandler {
		if (this.componentExists(component.customId))
			throw new Error(`Cannot register component with duplicate customId: '${component.customId}'.`);
		this.debugLog(`Registered component ${component.customId}.`);
		component.client = this.client;
		this.components.push(component);
		return this;
	}

	/**
	 * registerFromDir automatically loads files & creates class instances in the directory specified.
	 * If recurse is true, it will also load commands from subdirectories.
	 * Auto-load commands need to have a __default__ export. Otherwise they will be ignored.
	 * @param dir The directory to load files from.
	 * @param recurse Whether to load files from subdirectories.
	 * */
	public registerFromDir(dir: string, recurse: boolean = true): ComponentHandler {
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
				if (!ComponentHandler.isInstanceOfComponent(instance)) {
					this.debugLog(`File ${absolutePath} does not correctly implement Component.`);
					continue;
				}
				this.register(instance);
			}
		}
		return this;
	}

	private static isInstanceOfComponent(object: any): object is Component {
		return object.customId !== undefined && object.run !== undefined;
	}

	runComponent(event: AnyComponentInteraction, metadata: any = {}): void {
		const component = this.components.find((component) => {
			if (component.findFn && typeof component.findFn === "function") return component.findFn(event);
			return component.customId === event.customId;
		});
		if (!component)
			return this.debugLog(`runComponent(): Component ${event.customId} not found (did not match any findFn).`);
		this.debugLog(`Running component ${component.customId}.`);

		if (!component.run || typeof component.run !== "function") {
			return this.debugLog(`runComponent(): Component ${event.customId} has no run() method implemented.`);
		}
		const promise: Promise<void> = component.run(event, metadata);
		if (!(typeof promise === "object" && promise instanceof Promise)) {
			throw new Error("Component run method must return a promise.");
		}

		promise.catch((cmpError) => {
			if (!(cmpError instanceof CommandError)) {
				throw cmpError;
			}
			this.callErrorIfPresent(component, event, cmpError);
		});
	}

	private callErrorIfPresent(component: Component, event: AnyComponentInteraction, error: CommandError): void {
		if (!component.error || typeof component.error !== "function") {
			return this.debugLog(`Component ${event.customId} has no error() method implemented.`);
		}
		component.error(event, error);
	}
}
