# nhandler/framework

### Beta

NHandler Framework is an extension to NHandler which provides opinionated baseplates for Discord bot creation.

Import like:

```js
import { method } from "nhandler/framework";
```

It includes:

-   Module loader for decoupling code logic between "dumb" modules.

```js
// commandHandler is a CommandHandler instance from NHandler.
// eventHandler is an EventHandler instance from NHandler.
// componentHandler is a ComponentHandler instance from NHandler.
await loadModules({ commandHandler, eventHandler, componentHandler });
```

-   Opinionated colorful logger with 4 stages of severity and writing to disk.

```js
// Inits logger and will write to filePath.
// filePath should be absolute.
initLogger(filePath);

// Use the logger methods:
welcomeLog(project_name, project_version);
infoLog(...args);
severeLog(...args);
debugLog(...args);
warnLog(...args);
```

-   Opinionated embed set for keeping consistency.

```js
// Inits embeds with a colorset and optional footer that will be added to all embeds.
initEmbeds(colors, footer?);

infoEmbed(description);
errorEmbed(description);
warnEmbed(description);
successEmbed(description);

// Optionally you can continue the chain, as the returned value is an EmbedBuilder.
infoEmbed(description).setTitle(...).setAuthor(...); // etc.
```

-   A YAML config logger with shape validation & parsing using Zod.

```js
export let configShape = z.object({
	token: z.string(),
	// ...additional props...
});

export type Config = z.infer<typeof configShape>;

// The loadConfig function takes in a Zod schema as the first parameter and also a config type generic parameter.
// The returned value is type of T (specified generic), or in this case `Config`.
const parsedConfig = loadConfig<Config>(configShape);
```

More customisability coming in updates.
