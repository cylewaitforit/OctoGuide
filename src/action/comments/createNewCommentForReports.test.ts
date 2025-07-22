import { describe, expect, it, vi } from "vitest";

import type { EntityActor } from "../../actors/types.js";
import type { CommentConfig } from "../../types/commentConfig.js";
import type { CommentEntity, DiscussionEntity } from "../../types/entities.js";

import { createCommentBody } from "./createCommentBody.js";
import { createNewCommentForReports } from "./createNewCommentForReports.js";

const mockCore = {
	info: vi.fn(),
};

vi.mock("@actions/core", () => ({
	get info() {
		return mockCore.info;
	},
}));

const reported = "Oh no!";

const mockCreateComment = vi.fn();
const entityActor = {
	createComment: mockCreateComment,
} as unknown as EntityActor;

const commentConfig = {
	footer: "Test footer",
	header: "Test header",
} satisfies CommentConfig;

describe(createNewCommentForReports, () => {
	it("targets the parent number when the entity is a comment", async () => {
		const parentNumber = 123;

		const entity = {
			data: {
				html_url: "github.com/owner/repo/issues/123#issuecomment-456",
			},
			parentNumber,
			type: "comment",
		} as CommentEntity;

		await createNewCommentForReports(
			entityActor,
			entity,
			reported,
			commentConfig,
		);

		expect(mockCreateComment).toHaveBeenCalledWith(
			createCommentBody(entity, reported, commentConfig),
		);
		expect(mockCore.info).toHaveBeenCalledWith(
			`Target number for comment creation: ${parentNumber.toString()}`,
		);
	});

	it("targets the entity's number when the entity is not a comment", async () => {
		const number = 456;

		const entity = {
			data: {
				html_url: "github.com/owner/repo/issues/456",
			},
			number,
			type: "discussion",
		} as DiscussionEntity;

		await createNewCommentForReports(
			entityActor,
			entity,
			reported,
			commentConfig,
		);

		expect(mockCreateComment).toHaveBeenCalledWith(
			createCommentBody(entity, reported, commentConfig),
		);
		expect(mockCore.info).toHaveBeenCalledWith(
			`Target number for comment creation: ${number.toString()}`,
		);
	});
});
