import type { EntityActor } from "../../actors/types.js";
import type { CommentConfig } from "../../types/commentConfig.js";
import type { CommentData, Entity } from "../../types/entities.js";

import { createCommentBody } from "./createCommentBody.js";

export async function updateExistingCommentForReports(
	actor: EntityActor,
	entity: Entity,
	existingComment: CommentData,
	reported: string,
	commentConfig: CommentConfig,
) {
	await actor.updateComment(
		existingComment.id,
		createCommentBody(entity, reported, commentConfig),
	);
}
