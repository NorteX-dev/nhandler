import { Component, ComponentExecutionError } from "../../src/interfaces/Component";
import { AnyComponentInteraction } from "../../src/util";
import { MyClient } from "../index";

export class TestComponent implements Component {
	client!: MyClient;

	customId = "test";
	findFn(i: AnyComponentInteraction) {
		return i.customId.startsWith(this.customId);
	}

	async run(interaction: AnyComponentInteraction, metadata: { settings: string }): Promise<ComponentExecutionError | void> {
		interaction.reply({
			content: "test component ran",
			ephemeral: true,
		});
	}
}
