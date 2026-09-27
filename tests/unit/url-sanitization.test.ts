import { describe, it, expect } from "vitest";
import { sanitizeUrl, stripSensitiveQueryParams } from "@next-rsc-debug/core";

describe("URL sanitization", () => {
  it("strips query strings", () => {
    expect(
      sanitizeUrl("https://api.example.com/users?id=123&token=secret"),
    ).toBe("https://api.example.com/users");
  });

  it("strips credentials", () => {
    expect(sanitizeUrl("https://user:pass@api.example.com/data")).toBe(
      "https://api.example.com/data",
    );
  });
});

describe("query stripping", () => {
  it("removes sensitive params", () => {
    const result = stripSensitiveQueryParams(
      "https://api.example.com/users?id=123&token=secret",
    );
    expect(result).not.toContain("token=secret");
    expect(result).toContain("id=123");
  });
});

describe("credential stripping", () => {
  it("removes user:pass from URL", () => {
    expect(sanitizeUrl("https://admin:password@api.example.com/data")).toBe(
      "https://api.example.com/data",
    );
  });
});
