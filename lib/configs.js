import { rules } from "./rules/index.js";
export const configs = Object.groupBy(rules, (rule) => rule.about.config);
