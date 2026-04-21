#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";

const GITLAB_URL = process.env.GITLAB_URL ?? "http://localhost:8929";
const GITLAB_TOKEN = process.env.GITLAB_PERSONAL_ACCESS_TOKEN;

if (!GITLAB_TOKEN) {
  console.error("Error: GITLAB_PERSONAL_ACCESS_TOKEN environment variable is required.");
  console.error("Usage: GITLAB_PERSONAL_ACCESS_TOKEN=glpat-xxx gitlab-mcp");
  process.exit(1);
}

const server = createServer({
  baseUrl: GITLAB_URL,
  token: GITLAB_TOKEN,
});

const transport = new StdioServerTransport();
await server.connect(transport);
