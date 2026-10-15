import { SchematicsException, Tree } from '@angular-devkit/schematics';
import { dirname, posix } from 'node:path';
import ts from 'typescript';

/** Deliberately limited to the static source forms emitted by the Angular CLI. */
export class StaticSource {
  private readonly sources = new Map<string, ts.SourceFile>();

  constructor(private readonly tree: Tree) {}

  read(path: string): ts.SourceFile {
    path = posix.resolve('/', path);
    let source = this.sources.get(path);
    if (!source) {
      if (!this.tree.exists(path)) exampleError(`source file "${path}" is missing`);
      source = ts.createSourceFile(path, this.tree.readText(path), ts.ScriptTarget.Latest, true);
      this.sources.set(path, source);
    }
    return source;
  }

  relative(from: string, reference: string, extension = '.ts'): string {
    if (!reference.startsWith('.')) {
      exampleError(`"${reference}" must be a direct relative import; path aliases are unsupported`);
    }
    return posix.resolve(
      dirname(from),
      reference.endsWith(extension) ? reference : reference + extension,
    );
  }

  importedName(expression: ts.Expression, module: string): string | undefined {
    expression = unwrap(expression);
    if (!ts.isIdentifier(expression)) return undefined;
    const binding = this.imported(expression);
    return binding?.module === module ? binding.name : undefined;
  }

  declaration(identifier: ts.Identifier): ts.Declaration {
    const source = identifier.getSourceFile();
    const imported = this.imported(identifier);
    const declarationSource = imported
      ? this.read(this.relative(source.fileName, imported.module))
      : source;
    const name = imported?.name ?? identifier.text;
    for (const statement of declarationSource.statements) {
      if (ts.isClassDeclaration(statement) && statement.name?.text === name) return statement;
      if (ts.isVariableStatement(statement)) {
        const declaration = statement.declarationList.declarations.find(
          (candidate) => ts.isIdentifier(candidate.name) && candidate.name.text === name,
        );
        if (declaration) return declaration;
      }
    }
    return exampleError(
      `cannot statically resolve "${name}"; factories and re-exports are unsupported`,
    );
  }

  resolve(expression: ts.Expression): ts.Expression {
    const visited = new Set<string>();
    let imported = false;
    for (;;) {
      expression = unwrap(expression);
      if (!ts.isIdentifier(expression)) return expression;
      const key = `${expression.getSourceFile().fileName}:${expression.text}`;
      if (visited.has(key)) exampleError('cyclic source references cannot be analyzed');
      visited.add(key);
      this.assertUnchangedReferences(expression.getSourceFile(), expression.text);
      if (this.imported(expression)) {
        if (imported) exampleError('indirect imported configuration is unsupported');
        imported = true;
      }
      const declaration = this.declaration(expression);
      if (!ts.isVariableDeclaration(declaration) || !declaration.initializer) {
        exampleError(`"${expression.text}" is not a static variable`);
      }
      this.assertStaticVariable(declaration);
      expression = declaration.initializer;
    }
  }

  object(expression: ts.Expression, label: string): ts.ObjectLiteralExpression {
    const resolved = this.resolve(expression);
    if (!ts.isObjectLiteralExpression(resolved)) exampleError(`${label} must be a static object`);
    if (resolved.properties.some(ts.isSpreadAssignment)) {
      exampleError(`${label} spread composition cannot be analyzed safely`);
    }
    if (
      resolved.properties.some(
        (property) => property.name && ts.isComputedPropertyName(property.name),
      )
    ) {
      exampleError(`${label} computed properties cannot be analyzed safely`);
    }
    return resolved;
  }

  array(expression: ts.Expression, label: string): ts.ArrayLiteralExpression {
    const resolved = this.resolve(expression);
    if (!ts.isArrayLiteralExpression(resolved)) exampleError(`${label} must be a static array`);
    if (resolved.elements.some(ts.isSpreadElement)) {
      exampleError(`${label} array spread cannot be analyzed safely`);
    }
    return resolved;
  }

  private assertStaticVariable(declaration: ts.VariableDeclaration): void {
    if (!(declaration.parent.flags & ts.NodeFlags.Const)) {
      exampleError(
        'mutable configuration variables are unsupported; use a static const declaration',
      );
    }
    const name = declaration.name.getText();
    this.assertUnchangedReferences(declaration.getSourceFile(), name);
  }

  private assertUnchangedReferences(source: ts.SourceFile, name: string): void {
    const visit = (node: ts.Node): void => {
      const assignment =
        ts.isBinaryExpression(node) &&
        node.operatorToken.kind >= ts.SyntaxKind.FirstAssignment &&
        node.operatorToken.kind <= ts.SyntaxKind.LastAssignment &&
        rootIdentifier(node.left) === name;
      const update =
        (ts.isPrefixUnaryExpression(node) || ts.isPostfixUnaryExpression(node)) &&
        rootIdentifier(node.operand) === name;
      const method =
        ts.isCallExpression(node) &&
        (ts.isPropertyAccessExpression(node.expression) ||
          ts.isElementAccessExpression(node.expression)) &&
        rootIdentifier(node.expression.expression) === name;
      const passedToUnknownCall =
        ts.isCallExpression(node) &&
        node.arguments.some((argument) => rootIdentifier(argument) === name) &&
        this.importedName(node.expression, '@angular/router') !== 'provideRouter' &&
        this.importedName(node.expression, '@angular/platform-browser') !==
          'bootstrapApplication' &&
        this.importedName(node.expression, '@angular/core') !== 'Component';
      if (assignment || update || method || passedToUnknownCall) {
        exampleError(`potential mutation of "${name}" makes the configuration dynamic`);
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  }

  private imported(identifier: ts.Identifier): { module: string; name: string } | undefined {
    for (const statement of identifier.getSourceFile().statements) {
      if (
        !ts.isImportDeclaration(statement) ||
        !ts.isStringLiteral(statement.moduleSpecifier) ||
        !statement.importClause?.namedBindings ||
        !ts.isNamedImports(statement.importClause.namedBindings)
      )
        continue;
      const binding = statement.importClause.namedBindings.elements.find(
        (candidate) => candidate.name.text === identifier.text,
      );
      if (binding) {
        return {
          module: statement.moduleSpecifier.text,
          name: (binding.propertyName ?? binding.name).text,
        };
      }
    }
    return undefined;
  }
}

function rootIdentifier(expression: ts.Expression): string | undefined {
  expression = unwrap(expression);
  while (ts.isPropertyAccessExpression(expression) || ts.isElementAccessExpression(expression)) {
    expression = unwrap(expression.expression);
  }
  return ts.isIdentifier(expression) ? expression.text : undefined;
}

export function unwrap(expression: ts.Expression): ts.Expression {
  while (
    ts.isParenthesizedExpression(expression) ||
    ts.isAsExpression(expression) ||
    ts.isSatisfiesExpression(expression) ||
    ts.isNonNullExpression(expression)
  )
    expression = expression.expression;
  return expression;
}

export function property(
  object: ts.ObjectLiteralExpression,
  name: string,
): ts.Expression | undefined {
  const matches = object.properties.filter(
    (candidate) =>
      candidate.name &&
      (ts.isIdentifier(candidate.name) || ts.isStringLiteral(candidate.name)) &&
      candidate.name.text === name,
  );
  if (matches.length > 1) exampleError(`duplicate "${name}" properties cannot be analyzed safely`);
  const match = matches[0];
  if (!match) return undefined;
  if (ts.isPropertyAssignment(match)) return match.initializer;
  if (ts.isShorthandPropertyAssignment(match)) return match.name;
  return exampleError(`"${name}" must be a static property`);
}

export function stringValue(expression: ts.Expression | undefined): string | undefined {
  if (!expression) return undefined;
  expression = unwrap(expression);
  return ts.isStringLiteralLike(expression) ? expression.text : undefined;
}

export function exampleError(reason: string): never {
  throw new SchematicsException(
    `Cannot add the map example: ${reason}. Configure a standalone application with an existing ` +
      'provideRouter static route array and primary root <router-outlet>, or run ng add with --no-example and integrate a map manually.',
  );
}
