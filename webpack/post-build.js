/* eslint-disable @typescript-eslint/no-var-requires */
const { spawn } = require("child_process");

const dir = "test/files";

const files = ["objects.ts"];

files.forEach((file) => {
  const inputPath = `${dir}/${file}`;
  const generatedDir = "test/generated";
  const capitalizedFile = file.charAt(0).toUpperCase() + file.slice(1);
  const outputPath = `${generatedDir}/validate${capitalizedFile}`;
  const childProcess = spawn("node", [
    "build/index.js",
    "-i",
    `${inputPath}`,
    "-o",
    outputPath,
  ]);

  childProcess.stdout.on("data", (data) => {
    console.log(`${data}`);
  });

  childProcess.stderr.on("data", (data) => {
    console.error(`${data}`);
  });

  childProcess.stdin.end();
});
