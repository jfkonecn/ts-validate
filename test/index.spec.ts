import { spawn } from "child_process";

describe("Your Test Suite", () => {
  it("should pass files through stdin to index.js", (done) => {
    const childProcess = spawn("node", ["build/index.js"], {
      stdio: "pipe", // Enable stdin, stdout, and stderr pipes
    });

    // Handle the output (stdout) from your script
    childProcess.stdout.on("data", (data) => {
      const output = data.toString();
      expect(output).toContain("Expected Output");
    });

    // Handle errors (stderr)
    childProcess.stderr.on("data", (data) => {
      // Handle any errors from your script
      console.error(data.toString());
      done.fail(data.toString());
    });

    // Handle process exit
    childProcess.on("exit", (code) => {
      if (code === 0) {
        done();
      } else {
        done.fail(`Process exited with code ${code}`);
      }
    });

    // Write files to the stdin of the child process
    childProcess.stdin.write("file content here");
    childProcess.stdin.end(); // Close stdin
  });
});
