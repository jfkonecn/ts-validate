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
  if (ts.isTypeLiteralNode(node)) {
    console.log("is type literal node", node);
    if (ts.isStringLiteralLike(node)) {
      console.log("is string literal");
      const condition = ts.factory.createBinaryExpression(
        ts.factory.createTypeOfExpression(node),
        ts.SyntaxKind.EqualsEqualsEqualsToken,
        ts.factory.createStringLiteral("string"),
      );
      const ifBody = ts.factory.createBlock(
        [ts.factory.createReturnStatement(ts.factory.createNumericLiteral(1))],
        true,
      );
      statements.push(ts.factory.createIfStatement(condition, ifBody));
      console.log("pushed", statements);
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

  const decrementedArg = ts.factory.createBinaryExpression(
    paramName,
    ts.SyntaxKind.MinusToken,
    ts.factory.createNumericLiteral(1),
  );
  const recurse = ts.factory.createBinaryExpression(
    paramName,
    ts.SyntaxKind.AsteriskToken,
    ts.factory.createCallExpression(functionName, undefined, [decrementedArg]),
  );
  const statements: ts.Statement[] = [
    // ts.factory.createIfStatement(condition, ifBody),
    // ts.factory.createReturnStatement(recurse),
  ];
  node.forEachChild((node) => {
    createValidationLogic(node, statements);
  });

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
