import readline from "readline";

export async function readFromStandardIn(): Promise<string> {
  return await new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });

    rl.on("line", (line) => {
      resolve(line);
    });

    rl.once("close", () => {
      // end of input
    });
  });
}
