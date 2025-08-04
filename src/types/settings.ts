import type { ConfigName } from "./core.js";

export interface Settings {
	comments?: Comments;
	config?: ConfigName;
	rules?: Record<string, boolean>;
}

interface Comments {
	footer: string;
	header: string;
}
