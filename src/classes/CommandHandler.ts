import { ApplicationCommandType } from "discord-api-types/v10";
import { ChatInputCommandInteraction } from "discord.js";

import { Command, CommandExecutionResult, CommandOption, SubcommandWithOptions } from "../interfaces/Command";
import { BaseHandler } from "./BaseHandler";
import { CommandError } from "./CommandError";

export class CommandHandler extends BaseHandler {
	commands: Command[] = [];

	commandExists(name: string) {
		return this.commands.some((command) => command.name === name);
	}

	registerCommand(command: Command) {
		if (this.commandExists(command.name)) throw new Error(`Cannot register command with duplicate name: '${command.name}'.`);
		this.debugLog("Registered command", command.name);
		this.commands.push(command);
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

	runCommand(event: ChatInputCommandInteraction, metadata?: Record<string, unknown>): void {
		const command = this.commands.find((command) => command.name === event.commandName);
		if (!command) return this.debugLog(`runCommand(): Command ${event.commandName} not found.`);
		this.debugLog(`Running command ${command.name}.`);

		/* Check preconditions, like allowedGuilds, allowedUsers etc. */
		const error = this.checkConditionals(event, command);
		if (error) {
			if (!command.error || typeof command.error !== "function") {
				return this.debugLog(`runCommand(): Command ${event.commandName} failed conditionals but has no error() method implemented.`);
			}
			command.error(event, error);
			return;
		}

		if (!command.run || typeof command.run !== "function") {
			return this.debugLog(`runCommand(): Command ${event.commandName} has no run() method implemented.`);
		}
		command.run(event, metadata);
	}

	checkApplicationReady() {
		if (!this.client.application) {
			throw new Error("Application is not ready. Update application commands after the client has emitted 'ready'.");
		}
	}

	updateApplicationCommands() {
		this.checkApplicationReady();
		this.debugLog("Updating application commands.");
		// Convert command classes to API compatible format.
		const commands = this.commands.map(commandMapper);
		this.client
			.application!.commands.set(commands as any)
			.then((r) => this.debugLog(`Registered ${r.size} commands.`))
			.catch((err) => {
				throw err;
			});
	}
}

function isInstanceOfSubcommandWithOptions(object: any): object is SubcommandWithOptions {
	return object.options !== undefined;
}

function commandMapper(command: Command) {
	return {
		type: ApplicationCommandType.ChatInput,
		name: command.name,
		guildId: command.guildId,
		nameLocalizations: command.nameLocalizations,
		dmPermission: command.allowDm,
		defaultMemberPermissions: command.defaultMemberPermissions,
		description: command.description,
		descriptionLocalizations: command.descriptionLocalizations,
		options: command.options?.map(optionsMapper),
	};
}

function optionsMapper(option: CommandOption) {
	if (isInstanceOfSubcommandWithOptions(option)) {
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
		description: option.description,
		descriptionLocalizations: option.descriptionLocalizations,
		type: option.type,
		required: option.required,
		autocomplete: option.autocomplete,
		choices:
			option.choices?.map((choice) => {
				return {
					name: choice.name,
					nameLocalizations: choice.nameLocalizations,
					value: choice.value,
				};
			}) || [],
	};
}
