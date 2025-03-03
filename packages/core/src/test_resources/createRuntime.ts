import { SqliteDatabaseAdapter } from "@elizaos/adapter-sqlite";
import { type SqlJsDatabaseAdapter } from "@elizaos/adapter-sqljs";
import { type SupabaseDatabaseAdapter } from "@elizaos/adapter-supabase";
import { type PGLiteDatabaseAdapter } from "@elizaos/adapter-pglite";
import { AgentRuntime } from "../runtime.ts";
import { type Action, type Character, type Provider, type Plugin, ModelProviderName } from "../types.ts";
import { TEST_ACTOR_ID, TEST_ACTOR_NAME, TEST_ACTOR_SYSTEM_PROMPT } from "./constants.ts";

export type DatabaseType = "sqljs" | "supabase" | "pglite" | "sqlite";

/**
 * Creates a runtime environment for the agent.
 *
 * @param {Object} param - The parameters for creating the runtime.
 * @param {Record<string, string> | NodeJS.ProcessEnv} [param.env] - The environment variables.
 * @param {number} [param.conversationLength] - The length of the conversation.
 * @param {Evaluator[]} [param.evaluators] - The evaluators to be used.
 * @param {Action[]} [param.actions] - The actions to be used.
 * @param {Provider[]} [param.providers] - The providers to be used.
 * @param {string} [param.databaseType] - The type of database to be used.
 * @returns {Object} An object containing the created user, session, and runtime.
 */
export async function createRuntime(
    actions: Action[] = [],
    evaluators: any[] = [],
    providers: Provider[] = [],
    databaseType: DatabaseType = "sqljs"
): Promise<AgentRuntime> {
    let adapter: SqliteDatabaseAdapter | SqlJsDatabaseAdapter | SupabaseDatabaseAdapter | PGLiteDatabaseAdapter;

    try {
        switch (databaseType) {
            case "sqljs": {
                const { Database } = await import("sql.js");
                const { SqlJsDatabaseAdapter } = await import("@elizaos/adapter-sqljs");
                const db = new Database();
                adapter = new SqlJsDatabaseAdapter(db);
                break;
            }
            case "supabase": {
                const { SupabaseDatabaseAdapter } = await import("@elizaos/adapter-supabase");
                adapter = new SupabaseDatabaseAdapter(process.env.SUPABASE_URL || "", process.env.SUPABASE_KEY || "");
                break;
            }
            case "pglite": {
                const { PGLiteDatabaseAdapter } = await import("@elizaos/adapter-pglite");
                adapter = new PGLiteDatabaseAdapter({ dataDir: "../pglite" });
                break;
            }
            case "sqlite": {
                const { SqliteDatabaseAdapter } = await import("@elizaos/adapter-sqlite");
                const { Database } = await import("better-sqlite3");
                adapter = new SqliteDatabaseAdapter(new Database(":memory:"));
                break;
            }
            default:
                throw new Error(`Unsupported database type: ${databaseType}`);
        }

        const character: Character = {
            id: TEST_ACTOR_ID,
            name: TEST_ACTOR_NAME,
            system: TEST_ACTOR_SYSTEM_PROMPT,
            modelProvider: ModelProviderName.OPENAI,
            bio: "Test character bio",
            lore: [],
            messageExamples: [],
            postExamples: [],
            topics: [],
            adjectives: [],
            plugins: [],
            style: {
                all: [],
                chat: [],
                post: []
            },
            templates: {
                messageHandlerTemplate: "Test message handler template",
                shouldRespondTemplate: "Test should respond template"
            }
        };

        const runtime = new AgentRuntime({
            character,
            token: "test-token",
            serverUrl: "http://localhost:7998",
            actions,
            evaluators,
            providers,
            databaseAdapter: adapter,
            modelProvider: ModelProviderName.OPENAI
        });

        return runtime;
    } catch (error) {
        console.error("Error creating runtime:", error);
        throw error;
    }
}
