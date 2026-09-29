import { describe, it, expect } from "vitest";
import {
  sanitizeUrl,
  stripSensitiveQueryParams,
  isSafeKey,
  sanitizeKey,
  sanitizeMetadata,
} from "../src/sanitize";

describe("sanitizeUrl", () => {
  it("strips query strings", () => {
    expect(
      sanitizeUrl("https://api.example.com/users?id=123&token=secret"),
    ).toBe("https://api.example.com/users");
  });

  it("strips hash fragments", () => {
    expect(sanitizeUrl("https://api.example.com/users#section")).toBe(
      "https://api.example.com/users",
    );
  });

  it("strips credentials embedded in URL", () => {
    expect(sanitizeUrl("https://user:password@api.example.com/data")).toBe(
      "https://api.example.com/data",
    );
  });

  it("handles relative URLs", () => {
    const result = sanitizeUrl("/api/foo?token=abc");
    expect(result).toBe("/api/foo");
  });

  it("handles empty string", () => {
    expect(sanitizeUrl("")).toBe("");
  });

  it("handles non-string gracefully", () => {
    expect(sanitizeUrl(undefined as unknown as string)).toBe("");
  });
});

describe("stripSensitiveQueryParams", () => {
  it("removes sensitive params", () => {
    const result = stripSensitiveQueryParams(
      "https://api.example.com/users?id=123&token=secret&name=bob",
    );
    expect(result).toContain("id=123");
    expect(result).toContain("name=bob");
    expect(result).not.toContain("token=secret");
  });

  it("returns URL without hash", () => {
    const result = stripSensitiveQueryParams(
      "https://api.example.com/users#section",
    );
    expect(result).not.toContain("#section");
  });
});

describe("isSafeKey", () => {
  it("returns true for safe keys", () => {
    expect(isSafeKey("id")).toBe(true);
    expect(isSafeKey("page")).toBe(true);
  });

  it("returns false for sensitive keys", () => {
    expect(isSafeKey("token")).toBe(false);
    expect(isSafeKey("password")).toBe(false);
    expect(isSafeKey("api_key")).toBe(false);
    expect(isSafeKey("Authorization")).toBe(false);
  });
});

describe("sanitizeMetadata", () => {
  it("keeps ordinary metadata untouched", () => {
    const input = {
      url: "https://example.com/api",
      method: "GET",
      status: 200,
    };
    expect(sanitizeMetadata(input)).toEqual(input);
  });

  it("returns undefined for absent metadata", () => {
    expect(sanitizeMetadata(undefined)).toBeUndefined();
    expect(
      sanitizeMetadata(null as unknown as Record<string, unknown>),
    ).toBeUndefined();
  });

  it("drops sensitive keys", () => {
    const out = sanitizeMetadata({
      url: "https://example.com",
      token: "abc123",
      password: "hunter2",
      authorization: "Bearer xyz",
      cookie: "session=1",
    });
    expect(out).toEqual({ url: "https://example.com" });
  });

  it("drops sensitive keys case-insensitively", () => {
    const out = sanitizeMetadata({ Token: "x", API_KEY: "y", url: "/a" });
    expect(out).toEqual({ url: "/a" });
  });

  it("strips sensitive keys at every nesting level", () => {
    const out = sanitizeMetadata({
      user: { id: 7, password: "hunter2" },
      list: [{ session: "s1", ok: true }],
    });
    expect(out).toEqual({ user: { id: 7 }, list: [{ ok: true }] });
  });

  it("converts Date to an ISO string", () => {
    expect(sanitizeMetadata({ at: new Date(0) })).toEqual({
      at: "1970-01-01T00:00:00.000Z",
    });
  });

  it("converts an invalid Date to null", () => {
    expect(sanitizeMetadata({ at: new Date("nope") })).toEqual({ at: null });
  });

  it("converts BigInt to a string instead of throwing", () => {
    expect(sanitizeMetadata({ count: 9007199254740993n })).toEqual({
      count: "9007199254740993",
    });
  });

  it("replaces circular references with a marker", () => {
    const input: Record<string, unknown> = { url: "/a" };
    input.self = input;
    expect(sanitizeMetadata(input)).toEqual({
      url: "/a",
      self: "[Circular]",
    });
  });

  it("handles a cycle that does not include the root", () => {
    const child: Record<string, unknown> = { name: "c" };
    child.parent = child;
    expect(sanitizeMetadata({ child })).toEqual({
      child: { name: "c", parent: "[Circular]" },
    });
  });

  it("allows the same object to appear twice when it is not a cycle", () => {
    const shared = { id: 1 };
    expect(sanitizeMetadata({ a: shared, b: shared })).toEqual({
      a: { id: 1 },
      b: { id: 1 },
    });
  });

  it("converts Map and Set to plain structures", () => {
    expect(
      sanitizeMetadata({ m: new Map([["k", 1]]), s: new Set([1, 2]) }),
    ).toEqual({ m: { k: 1 }, s: [1, 2] });
  });

  it("reduces Error to name and message", () => {
    expect(sanitizeMetadata({ err: new Error("boom") })).toEqual({
      err: { name: "Error", message: "boom" },
    });
  });

  it("drops functions, symbols and undefined values", () => {
    const out = sanitizeMetadata({
      keep: 1,
      fn: () => undefined,
      sym: Symbol("s"),
      gone: undefined,
    });
    expect(out).toEqual({ keep: 1 });
  });

  it("keeps non-finite numbers readable", () => {
    const out = sanitizeMetadata({
      nan: Number.NaN,
      inf: Number.POSITIVE_INFINITY,
    });
    expect(out).toEqual({ nan: "NaN", inf: "Infinity" });
  });

  it("caps depth", () => {
    const deep = { a: { b: { c: { d: { e: { f: 1 } } } } } };
    const out = sanitizeMetadata(deep, { maxDepth: 2 });
    expect(JSON.stringify(out)).toContain("Max depth reached");
  });

  it("caps long arrays", () => {
    const out = sanitizeMetadata(
      { list: Array.from({ length: 10 }, (_, i) => i) },
      { maxArrayItems: 3 },
    );
    expect(out).toEqual({ list: [0, 1, 2, "[7 more items]"] });
  });

  it("caps long strings", () => {
    const out = sanitizeMetadata(
      { note: "x".repeat(50) },
      { maxStringLength: 10 },
    );
    expect(String(out?.note)).toContain("truncated 40 chars");
  });

  it("always yields something JSON.stringify accepts", () => {
    const nasty: Record<string, unknown> = { big: 1n, when: new Date(0) };
    nasty.loop = nasty;
    const out = sanitizeMetadata(nasty);
    expect(() => JSON.stringify(out)).not.toThrow();
  });
});

describe("sanitizeKey", () => {
  it("redacts the local part of an email, keeping the domain", () => {
    expect(sanitizeKey("user:alice@example.com")).toBe("user:a***@example.com");
  });

  it("redacts emails embedded in a longer key", () => {
    expect(sanitizeKey("cart:bob.smith@shop.co.uk:v2")).toBe(
      "cart:b***@shop.co.uk:v2",
    );
  });

  it("redacts every occurrence", () => {
    expect(sanitizeKey("a@x.com|b@y.com")).toBe("a***@x.com|b***@y.com");
  });

  it("leaves keys with no email untouched", () => {
    expect(sanitizeKey("posts:42:published")).toBe("posts:42:published");
    expect(sanitizeKey("tag:@mention")).toBe("tag:@mention");
  });

  it("does not mangle non-email identifiers", () => {
    expect(sanitizeKey("user:550e8400-e29b-41d4-a716-446655440000")).toBe(
      "user:550e8400-e29b-41d4-a716-446655440000",
    );
  });

  it("handles an empty key", () => {
    expect(sanitizeKey("")).toBe("");
  });
});

describe("sanitizeUrl preserveQuery", () => {
  it("strips the whole query by default", () => {
    expect(sanitizeUrl("https://x.com/a?page=1")).toBe("https://x.com/a");
  });

  it("keeps non-sensitive params when asked", () => {
    expect(
      sanitizeUrl("https://x.com/a?page=1&sort=asc", { preserveQuery: true }),
    ).toBe("https://x.com/a?page=1&sort=asc");
  });

  it("still drops sensitive params when preserving the query", () => {
    const out = sanitizeUrl("https://x.com/a?token=secret&page=1", {
      preserveQuery: true,
    });
    expect(out).toContain("page=1");
    expect(out).not.toContain("secret");
  });

  it("strips credentials even when preserving the query", () => {
    const out = sanitizeUrl("https://u:p@x.com/a?page=1", {
      preserveQuery: true,
    });
    expect(out).not.toContain("u:p");
    expect(out).toContain("page=1");
  });

  it("strips the hash when preserving the query", () => {
    expect(
      sanitizeUrl("https://x.com/a?page=1#frag", { preserveQuery: true }),
    ).not.toContain("frag");
  });
});
