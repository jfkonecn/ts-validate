export function validateUser(arg: unknown): arg is {
    name: string;
    age: number;
    occupation: string;
    bigInt: bigint;
    boolean: boolean;
    symbol: symbol;
    null: null;
    undefined: undefined;
} {
    const var582e46d6c0cf41bd869b70a5c27daaa1 = arg;
    if (typeof var582e46d6c0cf41bd869b70a5c27daaa1.name !== "string") {
        return false;
    }
    if (typeof var582e46d6c0cf41bd869b70a5c27daaa1.age !== "number") {
        return false;
    }
    if (typeof var582e46d6c0cf41bd869b70a5c27daaa1.occupation !== "string") {
        return false;
    }
    if (typeof var582e46d6c0cf41bd869b70a5c27daaa1.bigInt !== "bigint") {
        return false;
    }
    if (typeof var582e46d6c0cf41bd869b70a5c27daaa1.boolean !== "boolean") {
        return false;
    }
    if (typeof var582e46d6c0cf41bd869b70a5c27daaa1.symbol !== "symbol") {
        return false;
    }
    if (var582e46d6c0cf41bd869b70a5c27daaa1.null !== null) {
        return false;
    }
    if (typeof var582e46d6c0cf41bd869b70a5c27daaa1.undefined !== "undefined") {
        return false;
    }
    return true;
}

