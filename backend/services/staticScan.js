const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

function staticScan(code) {
  const issues = [];

  try {
    const ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx"]
    });

    traverse(ast, {
      CallExpression(path) {
        if (path.node.callee.name === "eval") {
          issues.push(`Critical: Found eval() at line ${path.node.loc.start.line}. This is a major security risk.`);
        }
      },
      VariableDeclarator(path) {
        const varName = path.node.id.name?.toLowerCase();
        if (varName && (varName.includes("key") || varName.includes("secret") || varName.includes("password"))) {
          if (path.node.init && path.node.init.type === "StringLiteral" && path.node.init.value.length > 0) {
            issues.push(`Warning: Potential hardcoded secret '${path.node.id.name}' at line ${path.node.loc.start.line}.`);
          }
        }
      }
    });
  } catch (error) {
    issues.push(`Syntax Error: Could not parse code. ${error.message}`);
  }

  return issues;
}

module.exports = staticScan;