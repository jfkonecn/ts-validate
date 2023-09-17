import { SyntaxKind } from "typescript";
import { parseTypeSrcript, readFromStandardIn } from "./utils";

async function main(): Promise<void> {
  const input = await readFromStandardIn();
  console.log(input);
  const parsed = parseTypeSrcript(input);
  parsed.forEachChild((node) => {
    console.log(node.kind);
    if (SyntaxKind.TypeAliasDeclaration === node.kind) {
      console.log("type alias");
    }
  });
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
