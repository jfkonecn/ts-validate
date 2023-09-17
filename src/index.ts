import { readFromStandardIn } from "./utils";
import { createValidators } from "./validator-makers";

async function main(): Promise<void> {
  const input = await readFromStandardIn();
  const result = createValidators(input);
  console.log(result);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
