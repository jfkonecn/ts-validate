/* eslint-disable @typescript-eslint/no-var-requires */
const { spawn } = require("child_process");
const fs = require("fs");

const dir = "test/files";

const files = ["objects.ts"];

files.forEach((file) => {
  const inputPath = `${dir}/${file}`;
  const data = fs.readFileSync(inputPath, "utf8");
  const childProcess = spawn("node", ["build/index.js"], {
    stdio: "pipe",
  });

  childProcess.stdout.on("data", (data) => {
    const output = data.toString();
    const capitalizedFile = file.charAt(0).toUpperCase() + file.slice(1);

    const generatedDir = "test/generated";
    fs.mkdirSync(generatedDir, { recursive: true });
    const outputPath = `${generatedDir}/validate${capitalizedFile}`;
    fs.writeFileSync(outputPath, output);
  });

  childProcess.stdin.write(data);
  childProcess.stdin.end();
});
