import { rules } from "./rules/index.js";
import { ConfigName } from "./types/configs.js";
import { Rule } from "./types/rules.js";

export const configs = Object.groupBy(
	rules,
	(rule) => rule.about.config,
) as Record<ConfigName, Rule[]>;
