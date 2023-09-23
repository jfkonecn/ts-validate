import ts from "typescript";
import { v4 } from "uuid";

// https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API

export function createValidators(content: string): string {
  const parsedFile = ts.createSourceFile(
    "test.ts",
    content,
    ts.ScriptTarget.ES2015,
  );

  return createValidator(parsedFile);
}

function primitiveTypeToValidator(
  typeString: string,
  varName: ts.Identifier,
  node: ts.PropertySignature,
  statements: ts.Statement[],
): void {
  const condition = ts.factory.createBinaryExpression(
    ts.factory.createTypeOfExpression(
      ts.factory.createPropertyAccessExpression(
        varName,
        node.name as any as string,
      ),
    ),
    ts.SyntaxKind.ExclamationEqualsEqualsToken,
    ts.factory.createStringLiteral(typeString),
  );
  const ifBody = ts.factory.createBlock(
    [ts.factory.createReturnStatement(ts.factory.createFalse())],
    true,
  );
  statements.push(ts.factory.createIfStatement(condition, ifBody));
}

function createValidationLogic(
  varName: ts.Identifier,
  node: ts.Node,
  statements: ts.Statement[],
): void {
  if ((node as any).name === "null") {
    console.log(node);
  }
  if (ts.isTypeAliasDeclaration(node)) {
    const newVarName = ts.factory.createIdentifier(
      `var_${v4()}`.replace(/-/g, "_"),
    );
    const assignment = ts.factory.createExpressionStatement(
      ts.factory.createAssignment(varName, newVarName),
    );
    statements.push(assignment);
    node.type.forEachChild((node) => {
      createValidationLogic(newVarName, node, statements);
    });
  } else if (ts.isPropertySignature(node)) {
    if (node.type?.kind === ts.SyntaxKind.StringKeyword) {
      primitiveTypeToValidator("string", varName, node, statements);
    } else if (node.type?.kind === ts.SyntaxKind.NumberKeyword) {
      primitiveTypeToValidator("number", varName, node, statements);
    } else if (node.type?.kind === ts.SyntaxKind.BigIntKeyword) {
      primitiveTypeToValidator("bigint", varName, node, statements);
    } else if (node.type?.kind === ts.SyntaxKind.BooleanKeyword) {
      primitiveTypeToValidator("boolean", varName, node, statements);
    } else if (node.type?.kind === ts.SyntaxKind.SymbolKeyword) {
      primitiveTypeToValidator("symbol", varName, node, statements);
    } else if (
      node.type?.kind === ts.SyntaxKind.LiteralType &&
      (node.type as any).literal.kind === ts.SyntaxKind.NullKeyword
    ) {
      console.log(node);
      const condition = ts.factory.createBinaryExpression(
        ts.factory.createPropertyAccessExpression(
          varName,
          node.name as any as string,
        ),
        ts.SyntaxKind.ExclamationEqualsEqualsToken,
        ts.factory.createNull(),
      );
      const ifBody = ts.factory.createBlock(
        [ts.factory.createReturnStatement(ts.factory.createFalse())],
        true,
      );
      statements.push(ts.factory.createIfStatement(condition, ifBody));
    } else if (node.type?.kind === ts.SyntaxKind.UndefinedKeyword) {
      primitiveTypeToValidator("undefined", varName, node, statements);
    } else {
      console.log(node);
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
  createValidationLogic(paramName, node, statements);
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
