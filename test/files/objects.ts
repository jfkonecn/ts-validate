import { type SomeImport } from "./some-imports";

export type User = {
  name: string;
  age: number;
  occupation: string;
  bigInt: bigint;
  boolean: boolean;
  symbol: symbol;
  null: null;
  undefined: undefined;
};

export type SomethingWithImports = {
  imported: SomeImport;
};
