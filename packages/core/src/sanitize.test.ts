import { describe, it, expect } from "vitest";
import {
  sanitizeUrl,
  stripSensitiveQueryParams,
  isSafeKey,
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
