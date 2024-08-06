# Nhandler v4

NHandler is an opinionated framework to help you with development of advanced Discord bots using discord.js.

It supports Discord.js version v14.14.1 and TypeScript v5.3.2.

### Changelog v4.1
- Added support for legacy (text, prefixed) commands.

### Changelog v3 to v4

- Consolidated CommandError and ComponentError into a single error: ExecutionError. This was done because it was too easy to throw a CommandError in a component class, and therefore the error was not caught by the command handler.

### Main features

- Fully TypeScript based.
- Strict typing included out of the box.
- Simple, robust and explicit API that helps build type-safe applications.
- Support for class-based architecture.

### Prerequisites
- Node.js v16 or newer,
- Discord.js v14.14.1,
- TypeScript v5.3.*.

This handler won't work with non-TS projects, as it relies on implementing interfaces. However, we're planning to add support (through alternative ways) when out of beta.

### Installation

```bash
$ npm install nhandler

$ yarn add nhandler

$ pnpm install nhandler
```

### Example usage

```ts

/// File: src/index.ts



// Imports

import { Client, IntentsBitField } from "discord.js";

import { CommandHandler, ComponentHandler, createCommands, createComponents, createEvents, EventHandler } from "nhandler";

import { TestCommand } from "./commands/testCommand";

import { TestComponent } from "./components/testComponent";

import { ReadyEvent } from "./events/ready";



// Define a class called "MyClient", which extends Discord.js' Client class.

export class MyClient extends Client {

  // Define variables to store each of our handlers.

  static commandHandler: CommandHandler;

  static eventHandler: EventHandler;

  static componentHandler: ComponentHandler;



  constructor() {

    super({

      intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages],

    });



    this.createHandlers();



    super.login(process.env.TOKEN).then(() => {

      console.log("-> Logged in.");

    });

  }



  private createHandlers() {

    // Create each of our handlers using the appropriate create* utility function.

    // The create* functions take a generic parameter which decides the type of the client.

    // In the options, define the required `client` property, as well as the optional `debug` property for extended logging.

    // Then, either call `handler.register` or directly chain the `register` method to the `create*` function.

    // Pass an instance of your command into the `register` method.

    MyClient.commandHandler = createCommands<MyClient>({ client: this, debug: true }).register(new TestCommand());

    MyClient.eventHandler = createEvents<MyClient>({ client: this }).register(new ReadyEvent());

    MyClient.componentHandler = createComponents<MyClient>({ client: this }).register(new TestComponent());

  }

}

new MyClient();

```

```ts

/// File: src/commands/testCommand.ts



// Imports

import { ApplicationCommandOptionType } from "discord-api-types/v10";

import { ChatInputCommandInteraction } from "discord.js";



import { Command, CommandError } from "nhandler";

import { MyClient } from "../index";



// Define the TestCommand class. It implements the `Command` interface, which is imported from `nhandler`.

export class TestCommand implements Command {

  // Define the required `client` property, which is an instance of your client.

  // Here, we need to use the ! operator to tell TypeScript that the property is defined, even though it's not assigned in the constructor.

  client!: MyClient;



  // Define command properties. Name and description are required by Discord, however, options is not.

  // Options define the command's subcommands & arguments.

  // Find more command parameters in the full examples in the `examples` folder.

  name = "test";

  description = "test command";

  options = [

    {

      type: ApplicationCommandOptionType.String,

      name: "string-option",

      description: "Example string option",

      required: true,

    },

  ];



  // This is our error method. It will be called when preconditions fail, or when the command returns a CommandError.

  // The error() method is an excellent way to keep your errors consistent in styling, as well as to shorten your code.

  error(interaction: ChatInputCommandInteraction, error: CommandError): Promise<void> | void {

    interaction.reply({ content: "Error: " + error.message, ephemeral: true, });

    return;

  }



  // The run() method will be ran when the command is executed.

  // It returns a Promise, which can be used to return a CommandError.

  // If you return CommandError, `error()` will be called with the value.

  // If you don't return anything (void), the command will be considered successful.

  async run(interaction: ChatInputCommandInteraction): Promise<CommandError | void> {

    if (1 === 2) {

      // Throw a CommandError to call the error() method.

      throw new CommandError("fatal error");

    }

    // Successful: reply to the interaction and return nothing.

    await interaction.reply({ content: "Test command ran!", ephemeral: true });

  }

}

```



```ts

import { Interaction } from "discord.js";



import { Event, isCommandInteraction } from "nhandler";

import { MyClient } from "../index";



// Use the Event handler

export class InteractionCreate implements Event {

  client!: MyClient;

  name = "interactionCreate";



  // You must trigger the runCommand function for commands to work.

  // You can use the built-in util function isCommandInteraction to type-safely check if the interaction is a command.

  async run(interaction: Interaction) {

    if (isCommandInteraction(interaction)) {

      MyClient.commandHandler.runCommand(interaction);

    }

  }

}

```



For a full example, take a look at the `examples` folder in our [GitHub repository](https://github.com/nortex-dev/nhandler).
