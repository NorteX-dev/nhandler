import { AnyComponentInteraction, Component, ComponentExecutionError } from "../../src";
import { MyClient } from "../index";

export class TestComponent implements Component {
	client!: MyClient;

	customId = "test";
	findFn = (i: AnyComponentInteraction) => i.customId.startsWith(this.customId);

	async run(interaction: AnyComponentInteraction, _metadata: { settings: string }): Promise<ComponentExecutionError | void> {
		interaction.reply({
			content: "test component ran",
			ephemeral: true,
		});
	}
}
