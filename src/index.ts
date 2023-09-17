import { readFromStandardIn } from "./utils";

async function main(): Promise<void> {
  const input = await readFromStandardIn();
  console.log(input);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
