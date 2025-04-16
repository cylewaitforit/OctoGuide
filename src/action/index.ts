import * as github from "@actions/github";

import { runHublintAction } from "./runHublintAction.js";

await runHublintAction(github.context);
