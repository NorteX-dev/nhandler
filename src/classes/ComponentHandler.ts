import { Component, ComponentExecutionError } from "../interfaces/Component";
import { AnyComponentInteraction } from "../util";
import { BaseHandler } from "./BaseHandler";
import { CommandError } from "./CommandError";
import { ComponentError } from "./ComponentError";

export class ComponentHandler extends BaseHandler {
	components: Component[] = [];

	componentExists(name: string) {
		return this.components.some((cmp) => cmp.customId === name);
	}

	register(component: Component): ComponentHandler {
		if (this.componentExists(component.customId)) throw new Error(`Cannot register component with duplicate customId: '${component.customId}'.`);
		this.debugLog(`Registered component ${component.customId}.`);
		component.client = this.client;
		this.components.push(component);
		return this;
	}

	runComponent(event: AnyComponentInteraction, metadata: any = {}): void {
		const component = this.components.find((component) => {
			if (component.findFn && typeof component.findFn === "function") return component.findFn(event);
			return component.customId === event.customId;
		});
		if (!component) return this.debugLog(`runComponent(): Component ${event.customId} not found (did not match any findFn).`);
		this.debugLog(`Running component ${component.customId}.`);

		if (!component.run || typeof component.run !== "function") {
			return this.debugLog(`runComponent(): Component ${event.customId} has no run() method implemented.`);
		}
		const promise: Promise<ComponentExecutionError> | ComponentExecutionError = component.run(event, metadata);
		if (!(typeof promise === "object" && promise instanceof Promise)) {
			throw new Error("Component run method must return a promise.");
		}

		promise.then((cmpExecResult) => {
			if (cmpExecResult instanceof ComponentError) {
				this.callErrorIfPresent(component, event, cmpExecResult);
			}
		});
	}

	private callErrorIfPresent(component: Component, event: AnyComponentInteraction, error: CommandError): void {
		if (!component.error || typeof component.error !== "function") {
			return this.debugLog(`Component ${event.customId} has no error() method implemented.`);
		}
		component.error(event, error);
	}
}
