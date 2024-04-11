import type { AstPath, Printer } from "prettier";
import { doc } from "prettier";
import { FastlyVclNode } from "./types.js";

const { group, indent, join, line, softline, hardline } = doc.builders;

export const printer: Printer<FastlyVclNode> = {
  print(path: AstPath<FastlyVclNode>, _options, print) {
    const node = path.node;
    switch (node.kind) {
      case "vcl":
        return join([line, line], path.map(print, "declarations"));

      // declarations
      case "sub":
        return group([
          "sub ",
          node.name,
          " ",
          node.returnType
            ? node.returnType.kind === "UNKNOWN"
              ? node.returnType.value
              : node.returnType.kind
            : "",
          "{",
          indent([hardline, join(line, path.map(print, "body"))]),
          line,
          "}",
        ]);
      case "acl":
        return group([
          "acl ",
          node.name,
          " {",
          indent([line, join(line, path.map(print, "entries"))]),
          line,
          "}",
        ]);
      case "acl-entry":
        return group([
          node.negated ? "! " : "",
          '"',
          node.address,
          '"',
          node.cidr ? "/" + node.cidr : "",
          ";",
        ]);
      case "import":
        return group(["import ", node.ident, ";"]);
      case "include":
        return group(['include "', node.path, '";']);
      case "penaltybox":
      case "ratecounter":
        return group([node.kind, " ", node.name, " {", "}"]);
      case "table":
        return group([
          "table ",
          node.name,
          " ",
          node.type ? node.type.kind + " " : "",
          "{",
          indent([line, join(line, path.map(print, "entries"))]),
          line,
          "}",
        ]);
      case "table-entry":
        return group([
          path.call(print, "key"),
          ": ",
          path.call(print, "value"),
          ",",
        ]);
      case "backend":
        return group([
          "backend ",
          node.name,
          " {",
          indent([line, join(line, path.map(print, "properties"))]),
          line,
          "}",
        ]);
      case "director":
        return group([
          "director ",
          node.name,
          " ",
          node.type,
          " {",
          indent([line, join(line, path.map(print, "properties"))]),
          line,
          indent([line, join(line, path.map(print, "directions"))]),
          line,
          "}",
        ]);

      // statements
      case "declare":
        return group([
          "declare ",
          path.call(print, "target"),
          " ",
          path.call(print, "type"),
          ";",
        ]);
      case "set":
        return group([
          "set ",
          path.call(print, "target"),
          " ",
          path.call(print, "operator"),
          " ",
          path.call(print, "value"),
          ";",
        ]);
      case "unset":
        return group(["unset ", path.call(print, "target"), ";"]);
      case "add":
        return group([
          "add ",
          path.call(print, "target"),
          " = ",
          path.call(print, "value"),
          ";",
        ]);
      case "call":
        return group(["call ", path.call(print, "target"), ";"]);
      case "if":
        return group([
          "if (",
          path.call(print, "condition"),
          ") {",
          indent([hardline, join(line, path.map(print, "body"))]),
          line,
          "}",
          node.else ? path.call(print, "else") : "",
        ]);
      case "error":
        return group([
          "error ",
          node.status?.toString() ?? "",
          path.call(print, "message"),
          ";",
        ]);
      case "esi":
        return "esi;";
      case "restart":
        return "restart;";
      case "return":
        return "return;";
      case "synthetic":
        return group([
          node.base64 ? "synthetic.base64" : "synthetic",
          path.call(print, "value"),
        ]);
      case "log":
        return group(["log ", path.call(print, "message")]);

      // expressions
      case "binary":
        return group([
          path.call(print, "lhs"),
          " ",
          path.call(print, "operator"),
          " ",
          path.call(print, "rhs"),
        ]);
      case "unary":
        return group([path.call(print, "operator"), path.call(print, "rhs")]);
      case "string_concat":
        return group(join(" + ", path.map(print, "tokens")));
      // literals
      case "object":
        return group([
          "{",
          indent([softline, join(softline, path.map(print, "properties"))]),
          softline,
          "}",
        ]);
      case "object-property":
        return group([".", node.key, " = ", path.call(print, "value"), ";"]);
      case "variable":
        return [
          node.name,
          node.properties.length > 0 ? [".", join(".", node.properties)] : [],
          node.subField ? [":", node.subField] : [],
        ];
      case "string":
        return join(
          " ",
          node.tokens.map((t) => `"${t}"`),
        );
      case "rtime":
        return [node.value.toString(), node.unit];
      case "integer":
        return node.value.toString();
      case "float":
        return node.value.toString();
      case "bool":
        return node.value ? "true" : "false";
      case "parcent":
        return node.value + "%";

      // types
      case "ACL":
      case "BACKEND":
      case "BOOL":
      case "FLOAT":
      case "ID":
      case "INTEGER":
      case "IP":
      case "RTIME":
      case "STRING":
      case "TIME":
      case "VOID":
        return node.kind;
      case "UNKNOWN":
        return node.value;

      // operators
      case "!":
      case "&&":
      case "||":
      case "==":
      case "!=":
      case "<":
      case "<=":
      case ">":
      case ">=":
      case "+":
      case "-":
      case "*":
      case "/":
      case "=":
      case "+=":
      case "-=":
      case "*=":
      case "/=":
      case "%=":
      case "&=":
      case "|=":
      case "^=":
      case "<<=":
      case ">>=":
      case "ror=":
      case "rol=":
      case "&&=":
      case "||=":
      case "~":
      case "!~":
        return node.kind;

      case "case":
        throw new Error(`${node.kind} is not supported yet.`);
      default:
        throw new Error(
          `Unknown node: ${JSON.stringify(node satisfies never)}`,
        );
    }
  },
};
