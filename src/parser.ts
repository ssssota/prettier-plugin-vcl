import { parse } from "@vcltk/parser";
import { Parser } from "prettier";
import { FastlyVclNode } from "./types.js";

export const parser: Parser<FastlyVclNode> = {
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
};
