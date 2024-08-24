import { readdirSync, statSync } from "fs";
import * as path from "path";
import { Message } from "discord.js";

import { ExecutionError } from "../errors/ExecutionError";
import { LegacyCommand, LegacyCommandArgument } from "../interfaces/LegacyCommand";
import { BaseHandler } from "./BaseHandler";

/*
 * MAKE SURE TO ADD
 * IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.MessageContent
 * TO THE BITFIELD LIST
 * */
export class LegacyCommandHandler extends BaseHandler {
	legacyCommands: LegacyCommand[] = [];
	public prefixes: string[] = [];

	constructor(prefixes: string[], debug?: (...args: any[]) => void) {
		super(debug);
		this.prefixes = prefixes;
	}

	protected commandExists(name: string) {
		return this.legacyCommands.some((command) => command.name === name);
	}

	public register(command: LegacyCommand): LegacyCommandHandler {
		if (this.commandExists(command.name))
			throw new Error(`Cannot register command with duplicate name: '${command.name}'.`);
		this.debugLog(`Registered command ${command.name}.`);
		command.client = this.client;
		this.legacyCommands.push(command);
		this.emit("commandRegistered", command);
		return this;
	}

	/**
	 * registerFromDir automatically loads files & creates class instances in the directory specified.
	 * If recurse is true, it will also load commands from subdirectories.
	 * Auto-load commands need to have a __default__ export. Otherwise they will be ignored.
	 * @param dir The directory to load files from.
	 * @param recurse Whether to load files from subdirectories.
	 * */
	public registerFromDir(dir: string, recurse: boolean = true): LegacyCommandHandler {
		if (!this.client) throw new Error("Client not set.");
		this.debugLog("Loading commands from directory " + dir + ".");
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
				if (!LegacyCommandHandler.isInstanceOfLegacyCommand(instance)) {
					this.debugLog(`File ${absolutePath} does not correctly implement LegacyCommand.`);
					continue;
				}
				this.register(instance);
			}
		}
		return this;
	}

	protected checkConditionals(message: Message, legacyCommand: LegacyCommand): ExecutionError | undefined {
		if (legacyCommand.guildId && message.guildId !== legacyCommand.guildId) {
			return new ExecutionError("This command is not available in this guild.");
		}
		if (legacyCommand.allowDm === false && message.guildId === null) {
			return new ExecutionError("This command is not available in DMs.");
		}
		if (legacyCommand.allowedGuilds && !legacyCommand.allowedGuilds.includes(message.guildId!)) {
			return new ExecutionError("This command is not available in this guild.");
		}
		if (legacyCommand.allowedUsers && !legacyCommand.allowedUsers.includes(message.author.id)) {
			return new ExecutionError("You are not allowed to use this command.");
		}
		return undefined;
	}

	protected validateArgs(args: string[], rules: LegacyCommandArgument[]): ExecutionError | undefined {
		if (args.length < rules.filter((rule) => rule.required).length) {
			return new ExecutionError("Missing required arguments.");
		}
		if (!rules.some((r) => r.spread) && args.length > rules.length) {
			return new ExecutionError("Too many arguments.");
		}
		return undefined;
	}

	public setPrefixes(prefixes: string[]): void {
		this.prefixes = prefixes;
	}

	public runLegacyCommand(event: Message, metadata: any = {}): void {
		if (!(event instanceof Message)) {
			throw new Error("runLegacyCommand() only accepts Message as its first argument.");
		}

		const [commandNameWithPrefix, ...args] = event.content.split(" ");

		const prefix = this.prefixes.find((prefix) => commandNameWithPrefix.startsWith(prefix));
		if (!prefix) return;
		const commandName = commandNameWithPrefix.slice(prefix.length);

		const command = this.legacyCommands.find((command) => command.name === commandName);
		if (!command) return this.debugLog(`runLegacyCommand(): Legacy command ${commandName} not found.`);
		this.debugLog(`Running legacy command ${command.name}.`);

		const error = this.checkConditionals(event, command);
		// const error2 = this.validateArgs(args, command.args || []);

		if (error /*|| error2*/) {
			this.callErrorIfPresent(command, args, event, error /* || error2*/!);
			return;
		}

		if (!command.run || typeof command.run !== "function") {
			return this.debugLog(`runLegacyCommand(): Legacy command ${commandName} has no run() method implemented.`);
		}
		const promise: Promise<void> = command.run(event, args, metadata);
		if (!(typeof promise === "object" && promise instanceof Promise)) {
			throw new Error("Legacy command run method must return a promise.");
		}

		promise.catch((execError) => {
			if (!(execError instanceof ExecutionError)) {
				throw execError;
			}
			this.callErrorIfPresent(command, args, event, execError);
		});
	}

	private static isInstanceOfLegacyCommand(object: any): object is LegacyCommand {
		return object.name !== undefined && object.run !== undefined && object.description !== undefined;
	}

	private callErrorIfPresent(command: LegacyCommand, args: string[], event: Message, error: ExecutionError): void {
		if (!command.error || typeof command.error !== "function") {
			return this.debugLog(`Command ${command.name} has no error() method implemented.`);
		}
		command.error(event, args, error);
	}
}
