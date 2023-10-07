import ts from "typescript";
import fs from "fs";

export type CommandArgs = {
  inputFilePath: string | undefined;
  outputFilePath: string | undefined;
};

export function extractInputFromArgs(args: string[]): CommandArgs {
  let inputFilePath: string | undefined;
  let outputFilePath: string | undefined;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--input" || args[i] === "-i") {
      inputFilePath = args[i + 1];
      i++;
    } else if (args[i] === "--output" || args[i] === "-o") {
      outputFilePath = args[i + 1];
      i++;
    }
  }
  return {
    inputFilePath,
    outputFilePath,
  };
}

export function readInputFileFromArgs(path: string): ts.SourceFile {
  const content = fs.readFileSync(path, "utf8");
  const parsedFile = ts.createSourceFile(path, content, ts.ScriptTarget.Latest);
  return parsedFile;
}
