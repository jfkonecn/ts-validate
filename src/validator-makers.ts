import ts from "typescript";
import { v4 } from "uuid";
import path from "path";

// https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API

function primitiveTypeToValidator(
  typeString: string,
  varName: ts.Identifier,
  node: ts.PropertySignature,
  statements: ts.Statement[],
): void {
  const condition = ts.factory.createLogicalOr(
    ts.factory.createPrefixUnaryExpression(
      ts.SyntaxKind.ExclamationToken,
      ts.factory.createParenthesizedExpression(
        ts.factory.createBinaryExpression(
          ts.factory.createStringLiteralFromNode(node.name as any),
          ts.SyntaxKind.InKeyword,
          varName,
        ),
      ),
    ),
    ts.factory.createBinaryExpression(
      ts.factory.createTypeOfExpression(
        ts.factory.createPropertyAccessExpression(
          varName,
          node.name as any as string,
        ),
      ),
      ts.SyntaxKind.ExclamationEqualsEqualsToken,
      ts.factory.createStringLiteral(typeString),
    ),
  );
  const ifBody = ts.factory.createBlock(
    [ts.factory.createReturnStatement(ts.factory.createFalse())],
    true,
  );
  statements.push(ts.factory.createIfStatement(condition, ifBody));
}

function createValidationLogic(
  varNode: ts.Identifier,
  node: ts.Node,
  statements: ts.Statement[],
): void {
  if (ts.isTypeAliasDeclaration(node)) {
    const newVarName = ts.factory.createIdentifier(
      `var${v4()}`.replace(/-/g, ""),
    );
    statements.push(
      ts.factory.createVariableStatement(
        undefined,
        ts.factory.createVariableDeclarationList(
          [
            ts.factory.createVariableDeclaration(
              newVarName,
              undefined,
              undefined,
              varNode,
            ),
          ],
          ts.NodeFlags.Const,
        ),
      ),
    );
    const condition = ts.factory.createLogicalOr(
      ts.factory.createBinaryExpression(
        ts.factory.createTypeOfExpression(newVarName),
        ts.SyntaxKind.ExclamationEqualsEqualsToken,
        ts.factory.createStringLiteral("object"),
      ),
      ts.factory.createBinaryExpression(
        newVarName,
        ts.SyntaxKind.EqualsEqualsEqualsToken,
        ts.factory.createNull(),
      ),
    );
    const ifBody = ts.factory.createBlock(
      [ts.factory.createReturnStatement(ts.factory.createFalse())],
      true,
    );
    statements.push(ts.factory.createIfStatement(condition, ifBody));

    node.type.forEachChild((node) => {
      createValidationLogic(newVarName, node, statements);
    });
  } else if (ts.isPropertySignature(node)) {
    if (node.type?.kind === ts.SyntaxKind.StringKeyword) {
      primitiveTypeToValidator("string", varNode, node, statements);
    } else if (node.type?.kind === ts.SyntaxKind.NumberKeyword) {
      primitiveTypeToValidator("number", varNode, node, statements);
    } else if (node.type?.kind === ts.SyntaxKind.BigIntKeyword) {
      primitiveTypeToValidator("bigint", varNode, node, statements);
    } else if (node.type?.kind === ts.SyntaxKind.BooleanKeyword) {
      primitiveTypeToValidator("boolean", varNode, node, statements);
    } else if (node.type?.kind === ts.SyntaxKind.SymbolKeyword) {
      primitiveTypeToValidator("symbol", varNode, node, statements);
    } else if (
      node.type?.kind === ts.SyntaxKind.LiteralType &&
      (node.type as any).literal.kind === ts.SyntaxKind.NullKeyword
    ) {
      const condition = ts.factory.createLogicalOr(
        ts.factory.createPrefixUnaryExpression(
          ts.SyntaxKind.ExclamationToken,
          ts.factory.createParenthesizedExpression(
            ts.factory.createBinaryExpression(
              ts.factory.createStringLiteralFromNode(node.name as any),
              ts.SyntaxKind.InKeyword,
              varNode,
            ),
          ),
        ),
        ts.factory.createBinaryExpression(
          ts.factory.createPropertyAccessExpression(
            varNode,
            node.name as any as string,
          ),
          ts.SyntaxKind.ExclamationEqualsEqualsToken,
          ts.factory.createNull(),
        ),
      );
      const ifBody = ts.factory.createBlock(
        [ts.factory.createReturnStatement(ts.factory.createFalse())],
        true,
      );
      statements.push(ts.factory.createIfStatement(condition, ifBody));
    } else if (node.type?.kind === ts.SyntaxKind.UndefinedKeyword) {
      primitiveTypeToValidator("undefined", varNode, node, statements);
    } else {
      // console.log(node);
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

export function createValidators(
  inputFilePath: string,
  node: ts.SourceFile,
  outputFilePath: string,
): string {
  const file = ts.createSourceFile(
    "source.ts",
    "",
    ts.ScriptTarget.ESNext,
    false,
    ts.ScriptKind.TS,
  );
  const inputFolderPath = path.dirname(inputFilePath);
  const outputFolderPath = path.dirname(outputFilePath);

  const importDic: Record<string, ts.ImportSpecifier[]> = {};
  function addImport(importPath: string, importNames: string[]): void {
    if (importDic[importPath] === undefined) {
      importDic[importPath] = [];
    }
    importNames.forEach((importName) => {
      (importDic[importPath] as ts.ImportSpecifier[]).push(
        ts.factory.createImportSpecifier(
          true,
          undefined,
          ts.factory.createIdentifier(importName),
        ),
      );
    });
  }
  const newNodes: ts.FunctionDeclaration[] = [];
  node.forEachChild((node) => {
    if (ts.isTypeAliasDeclaration(node)) {
      const inputFileWithNoExtension = path.parse(
        path.basename(inputFilePath),
      ).name;
      const final = path.relative(
        outputFolderPath,
        path.join(inputFolderPath, inputFileWithNoExtension),
      );
      addImport(final, [node.name.text]);
      newNodes.push(createValidatorForType(node));
    } else if (ts.isImportDeclaration(node)) {
      const importPath = (node.moduleSpecifier as any).text;
      const typesFolder = path.resolve(inputFolderPath, importPath);
      const final = path.relative(outputFolderPath, typesFolder);

      const types: string[] = [];
      node.importClause?.namedBindings?.forEachChild((node) => {
        types.push((node as any).name.text);
      });
      addImport(final, types);
    }
  });
  const imports = Object.entries(importDic).map(
    ([importPath, namedImports]) => {
      return ts.factory.createImportDeclaration(
        undefined,
        ts.factory.createImportClause(
          false,
          undefined,
          ts.factory.createNamedImports(namedImports),
        ),
        ts.factory.createStringLiteral(importPath) as any,
      );
    },
  );

  const arr = ts.factory.createNodeArray([...imports, ...newNodes]);

  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  return printer.printList(ts.ListFormat.MultiLine, arr, file);
}
