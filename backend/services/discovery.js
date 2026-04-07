const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

function discoverRoutes(code) {
  const routes = [];
  
  try {
    const ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx"]
    });

    traverse(ast, {
      CallExpression(path) {
        const callee = path.node.callee;
        if (callee.type === "MemberExpression") {
          const method = callee.property.name; 
          const validMethods = ['get', 'post', 'put', 'delete', 'patch'];
          
          if (validMethods.includes(method)) {
            const firstArg = path.node.arguments[0];
            if (firstArg && firstArg.type === "StringLiteral") {
              routes.push({
                method: method.toUpperCase(),
                path: firstArg.value
              });
            }
          }
        }
      }
    });
  } catch (e) {
    console.error("Discovery Error:", e.message);
  }

  return routes;
}

module.exports = discoverRoutes;