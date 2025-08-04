import type { Octokit } from "octokit";

import { afterEach, describe, expect, it, vi } from "vitest";

import { runOctoGuideRules } from "./runOctoGuideRules.js";

const mockCore = {
	debug: vi.fn(),
	isDebug: vi.fn().mockReturnValue(false),
};

vi.mock("@actions/core", () => ({
	get debug() {
		return mockCore.debug;
	},
	get isDebug() {
		return mockCore.isDebug;
	},
}));

const mockOctokitFromAuth = vi.fn();

vi.mock("octokit-from-auth", () => ({
	get octokitFromAuth() {
		return mockOctokitFromAuth;
	},
}));

const mockCreateActor = vi.fn();

vi.mock("./actors/createActor.js", () => ({
	get createActor() {
		return mockCreateActor;
	},
}));

const mockRunRuleOnEntity = vi.fn();

vi.mock("./execution/runRuleOnEntity.js", () => ({
	get runRuleOnEntity() {
		return mockRunRuleOnEntity;
	},
}));

// Mock the configs to provide test rules
vi.mock("./rules/configs.js", () => ({
	configs: {
		recommended: {
			"issue-body-not-empty": {
				about: { description: "Test rule 1", name: "issue-body-not-empty" },
			},
			"issue-labels-required": {
				about: { description: "Test rule 3", name: "issue-labels-required" },
			},
			"issue-title-conventional": {
				about: { description: "Test rule 2", name: "issue-title-conventional" },
			},
		},
	},
}));

// Mock allRules to include additional rules that aren't in the recommended config
vi.mock("./rules/all.js", () => ({
	allRules: [
		{
			about: { description: "Test rule 1", name: "issue-body-not-empty" },
		},
		{
			about: { description: "Test rule 3", name: "issue-labels-required" },
		},
		{
			about: { description: "Test rule 2", name: "issue-title-conventional" },
		},
		{
			about: {
				description: "Custom rule from all",
				name: "pr-title-conventional",
			},
		},
		{
			about: { description: "Another custom rule", name: "comment-meaningful" },
		},
	],
}));

/**
 * Creates a mock Octokit instance with minimal required properties.
 * @returns Minimal Octokit mock that satisfies basic test requirements
 * @example
 * ```typescript
 * const octokit = createMockOctokit();
 * ```
 */
const createMockOctokit = () =>
	({
		auth: vi.fn(),
		graphql: vi.fn(),
		hook: {
			after: vi.fn(),
			before: vi.fn(),
			error: vi.fn(),
			wrap: vi.fn(),
		},
		log: {
			debug: vi.fn(),
			error: vi.fn(),
			info: vi.fn(),
			warn: vi.fn(),
		},
		request: vi.fn(),
		rest: { issues: { get: vi.fn() } },
	}) as unknown as Octokit;

describe("runOctoGuideRules", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it("should be a function", () => {
		expect(typeof runOctoGuideRules).toBe("function");
	});

	it("should throw error when actor cannot be resolved", async () => {
		const mockOctokit = createMockOctokit();

		mockOctokitFromAuth.mockResolvedValue(mockOctokit);
		mockCreateActor.mockReturnValue({ actor: undefined, locator: undefined });

		await expect(
			runOctoGuideRules({
				entity: "https://github.com/test-owner/test-repo/issues/1",
			}),
		).rejects.toThrow("Could not resolve GitHub entity actor.");

		expect(mockOctokitFromAuth).toHaveBeenCalledWith({ auth: undefined });
		expect(mockCreateActor).toHaveBeenCalledWith(
			mockOctokit,
			"https://github.com/test-owner/test-repo/issues/1",
		);
	});

	it("should use provided authentication token", async () => {
		const mockOctokit = createMockOctokit();

		mockOctokitFromAuth.mockResolvedValue(mockOctokit);

		mockCreateActor.mockReturnValue({
			actor: { getData: vi.fn() },
			locator: { owner: "test-owner", repository: "test-repo" },
		});

		await runOctoGuideRules({
			auth: "test-token",
			entity: "https://github.com/test-owner/test-repo/issues/1",
		});

		expect(mockOctokitFromAuth).toHaveBeenCalledWith({ auth: "test-token" });
	});

	it("should not run any rules when all are explicitly disabled", async () => {
		const mockOctokit = createMockOctokit();
		const mockEntityData = {
			html_url: "https://github.com/test-owner/test-repo/issues/1",
			number: 1,
			title: "Test Issue",
		};
		const mockActor = {
			getData: vi.fn().mockResolvedValue(mockEntityData),
			metadata: { number: 1, type: "issue" as const },
		};

		mockOctokitFromAuth.mockResolvedValue(mockOctokit);
		mockCreateActor.mockReturnValue({
			actor: mockActor,
			locator: { owner: "test-owner", repository: "test-repo" },
		});

		const result = await runOctoGuideRules({
			auth: "test-token",
			entity: "https://github.com/test-owner/test-repo/issues/1",
			settings: {
				config: "recommended",
				rules: {
					"issue-body-not-empty": false,
					"issue-labels-required": false,
					"issue-title-conventional": false,
				},
			},
		});

		expect(result).toEqual({
			actor: mockActor,
			entity: {
				data: mockEntityData,
				number: 1,
				type: "issue",
			},
			reports: [],
		});

		// Verify runRuleOnEntity was never called (all rules explicitly disabled)
		expect(mockRunRuleOnEntity).not.toHaveBeenCalled();
	});

	it("should run all config rules when no settings are provided", async () => {
		const mockOctokit = createMockOctokit();
		const mockEntityData = {
			html_url: "https://github.com/test-owner/test-repo/issues/1",
			number: 1,
			title: "Test Issue",
		};
		const mockActor = {
			getData: vi.fn().mockResolvedValue(mockEntityData),
			metadata: { number: 1, type: "issue" as const },
		};

		mockOctokitFromAuth.mockResolvedValue(mockOctokit);
		mockCreateActor.mockReturnValue({
			actor: mockActor,
			locator: { owner: "test-owner", repository: "test-repo" },
		});

		const result = await runOctoGuideRules({
			auth: "test-token",
			entity: "https://github.com/test-owner/test-repo/issues/1",
			settings: {
				config: "recommended",
			},
		});

		expect(result).toEqual({
			actor: mockActor,
			entity: {
				data: mockEntityData,
				number: 1,
				type: "issue",
			},
			reports: [],
		});

		// Verify runRuleOnEntity was called three times (for all rules in the recommended config)
		expect(mockRunRuleOnEntity).toHaveBeenCalledTimes(3);

		const calledRules = mockRunRuleOnEntity.mock.calls.map(
			(call) => (call[1] as { about: { name: string } }).about.name,
		);
		expect(calledRules).toContain("issue-body-not-empty");
		expect(calledRules).toContain("issue-labels-required");
		expect(calledRules).toContain("issue-title-conventional");
	});

	it("should default to recommended config when no settings are provided at all", async () => {
		const mockOctokit = createMockOctokit();
		const mockEntityData = {
			html_url: "https://github.com/test-owner/test-repo/issues/1",
			number: 1,
			title: "Test Issue",
		};
		const mockActor = {
			getData: vi.fn().mockResolvedValue(mockEntityData),
			metadata: { number: 1, type: "issue" as const },
		};

		mockOctokitFromAuth.mockResolvedValue(mockOctokit);
		mockCreateActor.mockReturnValue({
			actor: mockActor,
			locator: { owner: "test-owner", repository: "test-repo" },
		});

		const result = await runOctoGuideRules({
			auth: "test-token",
			entity: "https://github.com/test-owner/test-repo/issues/1",
			// No settings provided at all - should default to recommended config
		});

		expect(result).toEqual({
			actor: mockActor,
			entity: {
				data: mockEntityData,
				number: 1,
				type: "issue",
			},
			reports: [],
		});

		// Verify runRuleOnEntity was called three times (for all rules in the recommended config)
		expect(mockRunRuleOnEntity).toHaveBeenCalledTimes(3);

		const calledRules = mockRunRuleOnEntity.mock.calls.map(
			(call) => (call[1] as { about: { name: string } }).about.name,
		);
		expect(calledRules).toContain("issue-body-not-empty");
		expect(calledRules).toContain("issue-labels-required");
		expect(calledRules).toContain("issue-title-conventional");
	});
	it("should filter rules based on config and rule overrides", async () => {
		const mockOctokit = createMockOctokit();
		const mockEntityData = {
			html_url: "https://github.com/test-owner/test-repo/pull/1",
			number: 1,
			title: "Test PR",
		};
		const mockActor = {
			getData: vi.fn().mockResolvedValue(mockEntityData),
			metadata: { number: 1, type: "pr" as const },
		};

		mockOctokitFromAuth.mockResolvedValue(mockOctokit);
		mockCreateActor.mockReturnValue({
			actor: mockActor,
			locator: { owner: "test-owner", repository: "test-repo" },
		});

		const result = await runOctoGuideRules({
			auth: "test-token",
			entity: "https://github.com/test-owner/test-repo/pull/1",
			settings: {
				config: "recommended",
				rules: {
					// Disable one rule from config
					"issue-title-conventional": false,
					// Enable rules that exist in allRules but not in recommended config
					"comment-meaningful": true,
					"pr-title-conventional": true,
					// Enable a rule that doesn't exist anywhere
					"non-existent-rule": true,
				},
			},
		});

		expect(result).toEqual({
			actor: mockActor,
			entity: {
				data: mockEntityData,
				number: 1,
				type: "pr",
			},
			reports: [],
		});

		// Should run 4 rules:
		// From config (not disabled): issue-body-not-empty, issue-labels-required
		// From allRules (enabled in settings): comment-meaningful, pr-title-conventional
		// Should NOT run: issue-title-conventional (disabled), non-existent-rule (doesn't exist)
		expect(mockRunRuleOnEntity).toHaveBeenCalledTimes(4);

		const calledRules = mockRunRuleOnEntity.mock.calls.map(
			(call) => (call[1] as { about: { name: string } }).about.name,
		);

		// Check that config rules (not disabled) are included
		expect(calledRules).toContain("issue-body-not-empty");
		expect(calledRules).toContain("issue-labels-required");

		// Check that additional rules from allRules are included
		expect(calledRules).toContain("comment-meaningful");
		expect(calledRules).toContain("pr-title-conventional");

		// Check that disabled rule is not included
		expect(calledRules).not.toContain("issue-title-conventional");

		// Check that non-existent rule is not included
		expect(calledRules).not.toContain("non-existent-rule");

		expect(mockOctokitFromAuth).toHaveBeenCalledWith({ auth: "test-token" });
		expect(mockCreateActor).toHaveBeenCalledWith(
			mockOctokit,
			"https://github.com/test-owner/test-repo/pull/1",
		);
		expect(mockActor.getData).toHaveBeenCalled();
	});
});
