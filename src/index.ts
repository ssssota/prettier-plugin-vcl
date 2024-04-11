import { parse } from "@vcltk/parser";
import type { AstPath, Plugin } from "prettier";
import { doc } from "prettier";

const { group, indent, join, line, hardline } = doc.builders;

export const plugin: Plugin = {
  languages: [
    {
      name: "Fastly VCL",
      extensions: [".vcl"],
      parsers: ["fastly-vcl"],
    },
  ],
  parsers: {
    "fastly-vcl": {
      parse(text, _options) {
        return parse(text);
      },
      astFormat: "fastly-vcl-ast",
      locEnd(_node) {
        return 0;
      },
      locStart(_node) {
        return 0;
      },
    },
  },
  printers: {
    "fastly-vcl-ast": {
      print(path: AstPath, _options, print) {
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
              node.type ? node.type : "",
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

          // statements
          case "set":
            return group([
              "set ",
              path.call(print, "target"),
              " = ",
              path.call(print, "value"),
              ";",
            ]);

          // literals/expressions
          case "object-property":
            return group([
              ".",
              node.key,
              " = ",
              path.call(print, "value"),
              ";",
            ]);
          case "variable":
            return [
              node.name,
              node.properties.length > 0
                ? [".", join(".", node.properties)]
                : [],
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
          case "bool":
            return node.value ? "true" : "false";
          default:
            throw new Error("Unknown node kind: " + node.kind);
        }
      },
    },
  },
};
