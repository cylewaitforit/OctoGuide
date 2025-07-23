import type { EntityActor } from "../../actors/types.js";
import type { CommentData, Entity } from "../../types/entities.js";
import type { Settings } from "../../types/settings.js";

import { createCommentBody } from "./createCommentBody.js";

export async function updateExistingCommentForReports(
	actor: EntityActor,
	entity: Entity,
	existingComment: CommentData,
	reported: string,
	settings: Settings,
) {
	await actor.updateComment(
		existingComment.id,
		createCommentBody(entity, reported, settings),
	);
}
