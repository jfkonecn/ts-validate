import { validateUser } from "./generated/validateObjects";

const userTestCases: Array<[unknown, boolean]> = [
  [
    {
      name: "John",
      age: 42,
      occupation: "Software Engineer",
      bigInt: BigInt(42),
      boolean: true,
      symbol: Symbol("foo"),
      null: null,
      undefined,
    },
    true,
  ],
  [
    {
      name: "John",
      age: undefined,
    },
    false,
  ],
];

describe("objects", () => {
  userTestCases.forEach(([obj, expectedToBeTrue], idx) => {
    it(`${idx} should pass files through stdin to index.js`, () => {
      expect(validateUser(obj)).toBe(expectedToBeTrue);
    });
  });
});
