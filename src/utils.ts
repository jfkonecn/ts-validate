import readline from "readline";
import { createSourceFile, ScriptTarget, SourceFile } from "typescript";

export async function readFromStandardIn(): Promise<string> {
  return await new Promise((resolve) => {
    const lines: string[] = [];
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });

    rl.on("line", (line) => {
      lines.push(line);
    });

    rl.once("close", () => {
      resolve(lines.join("\n"));
    });
  });
}

export function parseTypeSrcript(content: string): SourceFile {
  return createSourceFile("test.ts", content, ScriptTarget.ES2015);
}
