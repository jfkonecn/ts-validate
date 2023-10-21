import { extractInputFromArgs, readInputFileFromArgs } from "./utils";
import { createValidators } from "./validator-makers";
import fs from "fs";
import path from "path";

function main(): void {
  const args = process.argv.slice(2);
  const { inputFilePath, outputFilePath } = extractInputFromArgs(args);
  if (typeof inputFilePath !== "string") {
    console.error("No input file path provided");
    process.exit(1);
  } else if (typeof outputFilePath !== "string") {
    console.error("No output file path provided");
    process.exit(1);
  }
  const inputFile = readInputFileFromArgs(inputFilePath);
  const outputDir = path.dirname(outputFilePath);

  console.log(path.dirname(inputFilePath));
  const result = createValidators(inputFilePath, inputFile, outputFilePath);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputFilePath, result);
}

main();
