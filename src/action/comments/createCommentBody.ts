import type { Entity } from "../../types/entities.js";

import { createCommentIdentifier } from "./createCommentIdentifier.js";

export function createCommentBody(
	entity: Entity,
	message: string,
	footer: string,
): string {
	return [
		message,
		`> _${footer}_`,
		createCommentIdentifier(entity.data.html_url),
	].join("\n\n");
}
