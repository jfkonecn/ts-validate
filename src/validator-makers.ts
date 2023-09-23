import ts from "typescript";

// https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API

export function createValidators(content: string): string {
  const parsedFile = ts.createSourceFile(
    "test.ts",
    content,
    ts.ScriptTarget.ES2015,
  );

  return createValidator(parsedFile);
}

function createValidationLogic(
  node: ts.Node,
  statements: ts.Statement[],
): void {
  if (ts.isPropertySignature(node)) {
    if (node.type?.kind === ts.SyntaxKind.StringKeyword) {
      const condition = ts.factory.createBinaryExpression(
        ts.factory.createTypeOfExpression(
          ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier("arg"),
            node.name as any as string,
          ),
        ),
        ts.SyntaxKind.ExclamationEqualsEqualsToken,
        ts.factory.createStringLiteral("string"),
      );
      const ifBody = ts.factory.createBlock(
        [ts.factory.createReturnStatement(ts.factory.createFalse())],
        true,
      );
      statements.push(ts.factory.createIfStatement(condition, ifBody));
    } else if (node.type?.kind === ts.SyntaxKind.NumberKeyword) {
      const condition = ts.factory.createBinaryExpression(
        ts.factory.createTypeOfExpression(
          ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier("arg"),
            node.name as any as string,
          ),
        ),
        ts.SyntaxKind.ExclamationEqualsEqualsToken,
        ts.factory.createStringLiteral("number"),
      );
      const ifBody = ts.factory.createBlock(
        [ts.factory.createReturnStatement(ts.factory.createFalse())],
        true,
      );
      statements.push(ts.factory.createIfStatement(condition, ifBody));
    }
  }
}

function createValidatorForType(
  node: ts.TypeAliasDeclaration,
): ts.FunctionDeclaration {
  const functionName = ts.factory.createIdentifier(`validate${node.name.text}`);
  const paramName = ts.factory.createIdentifier("arg");
  const parameter = ts.factory.createParameterDeclaration(
    undefined,
    undefined,
    paramName,
    undefined,
    ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
  );

  const statements: ts.Statement[] = [];
  node.type.forEachChild((node) => {
    createValidationLogic(node, statements);
  });
  statements.push(ts.factory.createReturnStatement(ts.factory.createTrue()));

  return ts.factory.createFunctionDeclaration(
    [ts.factory.createToken(ts.SyntaxKind.ExportKeyword)],
    undefined,
    functionName,
    undefined,
    [parameter],
    ts.factory.createTypePredicateNode(undefined, paramName, node.type),
    ts.factory.createBlock(statements, true),
  );
}

function createValidator(node: ts.SourceFile): string {
  const file = ts.createSourceFile(
    "source.ts",
    "",
    ts.ScriptTarget.ESNext,
    false,
    ts.ScriptKind.TS,
  );

  const newNodes: ts.FunctionDeclaration[] = [];
  node.forEachChild((node) => {
    if (ts.isTypeAliasDeclaration(node)) {
      newNodes.push(createValidatorForType(node));
    }
  });

  const arr = ts.factory.createNodeArray(newNodes);

  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  return printer.printList(ts.ListFormat.MultiLine, arr, file);
}
