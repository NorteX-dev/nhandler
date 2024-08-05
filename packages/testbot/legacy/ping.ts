import { Message } from "discord.js";
import { ExecutionError, LegacyCommand } from "nhandler";

import { MyClient } from "../index";

export class PingLegacyCommand implements LegacyCommand {
	client!: MyClient;

	// Top-level defined fields define the command's parameters.
	// Here we define the `name` and `description` of the command.
	// There are more fields that can be defined, but unlike the below two, they are optional.
	name = "ping";
	description = "Pong!";

	args = [
		{
			name: "test",
			description: "Testing option",
			required: false,
		},
	];
	// The error method is called when a precondition fails, or when the command returns ExecutionError.
	// You should handle the error by replying to the interaction with the error message.
	async error(message: Message, args: string[], error: ExecutionError): Promise<void> {
		await message.channel.send({
			content: "Error: " + error.message,
		});
		return;
	}

	// The run callback is called when the command is ran.
	async run(message: Message, args: string[]): Promise<void> {
		const thing = 1;

		// @ts-expect-error
		if (thing === 2) {
			throw new ExecutionError("thing is 2");
		}

		await message.channel.send({
			content: "Test command ran!",
			components: [],
		});
	}
}
