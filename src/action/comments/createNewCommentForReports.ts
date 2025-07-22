import * as core from "@actions/core";

import type { EntityActor } from "../../actors/types.js";
import type { CommentConfig } from "../../types/commentConfig.js";
import type { Entity } from "../../types/entities.js";

import { createCommentBody } from "./createCommentBody.js";

export async function createNewCommentForReports(
	actor: EntityActor,
	entity: Entity,
	reported: string,
	commentConfig: CommentConfig,
) {
	const targetNumber =
		entity.type === "comment" ? entity.parentNumber : entity.number;
	core.info(`Target number for comment creation: ${targetNumber.toString()}`);

	return await actor.createComment(
		createCommentBody(entity, reported, commentConfig),
	);
}
