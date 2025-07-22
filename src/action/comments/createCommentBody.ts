import type { CommentConfig } from "../../types/commentConfig.js";
import type { Entity } from "../../types/entities.js";

import { createCommentIdentifier } from "./createCommentIdentifier.js";

export function createCommentBody(
	entity: Entity,
	message: string,
	commentConfig: CommentConfig,
): string {
	return [
		`## ${commentConfig.header}`,
		message,
		`> _${commentConfig.footer}_`,
		createCommentIdentifier(entity.data.html_url),
	].join("\n\n");
}
