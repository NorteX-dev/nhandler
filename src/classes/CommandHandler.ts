import { readdirSync, statSync } from "fs";
import * as path from "path";
import { ApplicationCommandType } from "discord-api-types/v10";
import { AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js";

import { CommandError } from "../errors/CommandError";
import { Command, CommandOption, SubcommandWithOptions } from "../interfaces/Command";
import { BaseHandler, commandsToRegister } from "./BaseHandler";

export class CommandHandler extends BaseHandler {
	commands: Command[] = [];

	commandExists(name: string) {
		return this.commands.some((command) => command.name === name);
	}

	register(command: Command): CommandHandler {
		if (this.commandExists(command.name))
			throw new Error(`Cannot register command with duplicate name: '${command.name}'.`);
		this.debugLog(`Registered command ${command.name}.`);
		command.client = this.client;
		commandsToRegister.push(CommandHandler.commandMapper(command));
		this.commands.push(command);
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
	public registerFromDir(dir: string, recurse: boolean = true): CommandHandler {
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
				if (!CommandHandler.isInstanceOfCommand(instance)) {
					this.debugLog(`File ${absolutePath} does not correctly implement Command.`);
					continue;
				}
				this.register(instance);
			}
		}
		return this;
	}

	checkConditionals(event: ChatInputCommandInteraction, command: Command): CommandError | undefined {
		if (command.guildId && event.guildId !== command.guildId) {
			return new CommandError("This command is not available in this guild.");
		}
		if (command.allowDm === false && event.guildId === null) {
			return new CommandError("This command is not available in DMs.");
		}
		if (command.allowedGuilds && !command.allowedGuilds.includes(event.guildId!)) {
			return new CommandError("This command is not available in this guild.");
		}
		if (command.allowedUsers && !command.allowedUsers.includes(event.user.id)) {
			return new CommandError("You are not allowed to use this command.");
		}
		return undefined;
	}

	runCommand(event: ChatInputCommandInteraction, metadata: any = {}): void {
		if (!(event instanceof ChatInputCommandInteraction)) {
			throw new Error(
				"runCommand() only accepts ChatInputCommandInteraction. Use runContextMenuCommand() instead.",
			);
		}
		const command = this.commands.find((command) => command.name === event.commandName);
		if (!command) return this.debugLog(`runCommand(): Command ${event.commandName} not found.`);
		this.debugLog(`Running command ${command.name}.`);

		/* Check preconditions, like allowedGuilds, allowedUsers etc. */
		const error = this.checkConditionals(event, command);
		if (error) {
			this.callErrorIfPresent(command, event, error);
			return;
		}

		if (!command.run || typeof command.run !== "function") {
			return this.debugLog(`runCommand(): Command ${event.commandName} has no run() method implemented.`);
		}
		const promise: Promise<void> = command.run(event, metadata);
		if (!(typeof promise === "object" && promise instanceof Promise)) {
			throw new Error("Command run method must return a promise.");
		}

		promise.catch((cmdError) => {
			if (!(cmdError instanceof CommandError)) {
				throw cmdError;
			}
			this.callErrorIfPresent(command, event, cmdError);
		});
	}

	runAutocomplete(event: AutocompleteInteraction, metadata: any = {}): void {
		const command = this.commands.find((command) => command.name === event.commandName);
		if (!command) return this.debugLog(`runAutocomplete(): Command ${event.commandName} not found.`);
		this.debugLog(`Running autocomplete for ${command.name}.`);

		if (!command.autocomplete || typeof command.autocomplete !== "function") {
			return this.debugLog(
				`runAutocomplete(): Command ${event.commandName} has no autocomplete() method implemented.`,
			);
		}
		command.autocomplete(event, metadata);
	}

	private callErrorIfPresent(command: Command, event: ChatInputCommandInteraction, error: CommandError): void {
		if (!command.error || typeof command.error !== "function") {
			return this.debugLog(`Command ${event.commandName} has no error() method implemented.`);
		}
		command.error(event, error);
	}

	private static isOptionInstanceOfSubcommand(object: any): object is SubcommandWithOptions {
		return object.options !== undefined;
	}

	private static isInstanceOfCommand(object: any): object is Command {
		return object.name !== undefined && object.run !== undefined && object.description !== undefined;
	}

	private static commandMapper(command: Command) {
		return {
			type: ApplicationCommandType.ChatInput,
			name: command.name,
			guildId: command.guildId,
			nameLocalizations: command.nameLocalizations,
			dmPermission: command.allowDm,
			defaultMemberPermissions: command.defaultMemberPermissions ?? null,
			description: command.description,
			descriptionLocalizations: command.descriptionLocalizations,
			integration_types: command.integrationTypes ?? [0],
			contexts: command.contexts ?? [0],
			options: command.options?.map(CommandHandler.optionsMapper),
		};
	}

	private static optionsMapper(option: CommandOption) {
		if (CommandHandler.isOptionInstanceOfSubcommand(option)) {
			// Format subcommand or subcommand group
			return {
				type: option.type,
				name: option.name,
				description: option.description,
				descriptionLocalizations: option.descriptionLocalizations,
				options: option.options,
			};
		}
		// Format argument option
		return {
			name: option.name,
			nameLocalizations: option.nameLocalizations,
			description: option.description,
			descriptionLocalizations: option.descriptionLocalizations,
			type: option.type,
			required: option.required,
			autocomplete: option.autocomplete,
			choices: option.choices?.map((choice) => {
				return {
					name: choice.name,
					nameLocalizations: choice.nameLocalizations,
					value: choice.value,
				};
			}),
		};
	}
}
