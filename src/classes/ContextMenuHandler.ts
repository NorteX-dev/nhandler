import { readdirSync, statSync } from "fs";
import * as path from "path";

import { ContextMenuActionError } from "../errors/ContextMenuActionError";
import { ContextMenuAction } from "../interfaces/ContextMenuAction";
import { ContextMenuInteraction } from "../util";
import { BaseHandler, commandsToRegister } from "./BaseHandler";

export class ContextMenuHandler extends BaseHandler {
	actions: ContextMenuAction[] = [];

	actionExists(name: string, type: number) {
		return this.actions.some((action) => action.name === name && action.type === type);
	}

	register(action: ContextMenuAction): ContextMenuHandler {
		if (this.actionExists(action.name, action.type))
			throw new Error(
				`Cannot register context menu action with duplicate name and type: '${action.name}', type '${action.type}'.`,
			);
		this.debugLog(`Registered context menu action ${action.name}.`);
		action.client = this.client;
		commandsToRegister.push(ContextMenuHandler.actionMapper(action));
		this.actions.push(action);
		this.emit("actionRegistered", action);
		return this;
	}

	/**
	 * registerFromDir automatically loads files & creates class instances in the directory specified.
	 * If recurse is true, it will also load context menu actions from subdirectories.
	 * Auto-load context menu actions need to have a __default__ export. Otherwise they will be ignored.
	 * @param dir The directory to load files from.
	 * @param recurse Whether to load files from subdirectories.
	 * */
	public registerFromDir(dir: string, recurse: boolean = true): ContextMenuHandler {
		if (!this.client) throw new Error("Client not set.");
		this.debugLog("Loading context menu actions from directory " + dir + ".");
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
				if (!ContextMenuHandler.isInstanceOfCtxMenuAction(instance)) {
					this.debugLog(`File ${absolutePath} does not correctly implement ContextMenuAction.`);
					continue;
				}
				this.register(instance);
			}
		}
		return this;
	}

	checkConditionals(event: ContextMenuInteraction, action: ContextMenuAction): ContextMenuActionError | undefined {
		if (action.guildId && event.guildId !== action.guildId) {
			return new ContextMenuActionError("This action is not available in this guild.");
		}
		if (action.allowDm === false && event.guildId === null) {
			return new ContextMenuActionError("This action is not available in DMs.");
		}
		if (action.allowedGuilds && !action.allowedGuilds.includes(event.guildId!)) {
			return new ContextMenuActionError("This action is not available in this guild.");
		}
		if (action.allowedUsers && !action.allowedUsers.includes(event.user.id)) {
			return new ContextMenuActionError("You are not allowed to use this action.");
		}
		return undefined;
	}

	runAction(event: ContextMenuInteraction, metadata: any = {}): void {
		if (!event.commandType || event.commandType < 2) {
			throw new Error("runAction() only accepts ContextMenuInteraction.");
		}
		const action = this.actions.find(
			(action) => action.name === event.commandName && action.type === event.commandType,
		);
		if (!action) return this.debugLog(`runAction(): Command ${event.commandName} not found.`);
		this.debugLog(`Running context menu action ${action.name}.`);

		/* Check preconditions, like allowedGuilds, allowedUsers etc. */
		const error = this.checkConditionals(event, action);
		if (error) {
			this.callErrorIfPresent(action, event, error);
			return;
		}

		if (!action.run || typeof action.run !== "function") {
			return this.debugLog(`runAction(): Action ${event.commandName} has no run() method implemented.`);
		}
		const promise: Promise<void> = action.run(event, metadata);
		if (!(typeof promise === "object" && promise instanceof Promise)) {
			throw new Error("Action run method must return a promise.");
		}

		promise.catch((actError) => {
			if (!(actError instanceof ContextMenuActionError)) {
				throw actError;
			}
			this.callErrorIfPresent(action, event, actError);
		});
	}

	private callErrorIfPresent(
		action: ContextMenuAction,
		event: ContextMenuInteraction,
		error: ContextMenuActionError,
	): void {
		if (!action.error || typeof action.error !== "function") {
			return this.debugLog(`Action ${event.commandName} has no error() method implemented.`);
		}
		action.error(event, error);
	}

	private static isInstanceOfCtxMenuAction(object: any): object is ContextMenuAction {
		return object.name !== undefined && object.run !== undefined;
	}

	private static actionMapper(action: ContextMenuAction) {
		return {
			type: action.type,
			name: action.name,
			guildId: action.guildId,
			dmPermission: action.allowDm,
			defaultMemberPermissions: action.defaultMemberPermissions ?? null,
		};
	}
}
