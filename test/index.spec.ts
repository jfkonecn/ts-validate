import { spawn } from "child_process";
import fs from "fs";

const dir = "test/files";

const files = ["objects.ts"];

describe("Your Test Suite", () => {
  files.forEach((file) => {
    const path = `${dir}/${file}`;
    it(`${file} should pass files through stdin to index.js`, (done) => {
      const data = fs.readFileSync(path, "utf8");
      const childProcess = spawn("node", ["build/index.js"], {
        stdio: "pipe", // Enable stdin, stdout, and stderr pipes
      });

      childProcess.stdout.on("data", (data) => {
        const output = data.toString();
        console.log(output);
        // expect(output).toContain("Expected Output");
      });

      childProcess.on("exit", (code) => {
        if (code === 0) {
          done();
        } else {
          done.fail(`Process exited with code ${code}`);
        }
      });

      // Write files to the stdin of the child process
      childProcess.stdin.write(data);
      childProcess.stdin.end(); // Close stdin
    });
  });
});
