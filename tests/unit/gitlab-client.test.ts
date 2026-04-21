import { describe, it, expect, vi, beforeEach } from "vitest";
import { GitLabClient, GitLabApiError } from "../../src/gitlab-client.js";

describe("GitLabClient", () => {
  let client: GitLabClient;

  beforeEach(() => {
    client = new GitLabClient({
      baseUrl: "http://gitlab.test",
      token: "test-token",
    });
  });

  describe("GET requests", () => {
    it("sends correct headers and URL", async () => {
      const mockResponse = { id: 1, name: "test" };
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

      const result = await client.get("/projects");

      expect(fetch).toHaveBeenCalledWith(
        "http://gitlab.test/api/v4/projects",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            "PRIVATE-TOKEN": "test-token",
          }),
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("appends query parameters", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response("[]", { status: 200 }),
      );

      await client.get("/projects", { search: "test", page: 1, per_page: 20 });

      const calledUrl = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(calledUrl).toContain("search=test");
      expect(calledUrl).toContain("page=1");
      expect(calledUrl).toContain("per_page=20");
    });

    it("skips undefined params", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response("[]", { status: 200 }),
      );

      await client.get("/projects", { search: undefined, page: 1 });

      const calledUrl = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(calledUrl).not.toContain("search");
      expect(calledUrl).toContain("page=1");
    });
  });

  describe("POST requests", () => {
    it("sends JSON body", async () => {
      const mockResponse = { id: 1, title: "New Issue" };
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), { status: 201 }),
      );

      const result = await client.post("/projects/1/issues", { title: "New Issue" });

      expect(fetch).toHaveBeenCalledWith(
        "http://gitlab.test/api/v4/projects/1/issues",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ title: "New Issue" }),
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "PRIVATE-TOKEN": "test-token",
          }),
        }),
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("error handling", () => {
    it("throws GitLabApiError on non-OK response", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response('{"message":"401 Unauthorized"}', {
          status: 401,
          statusText: "Unauthorized",
        }),
      );

      try {
        await client.get("/projects");
        expect.unreachable("should have thrown");
      } catch (e) {
        expect(e).toBeInstanceOf(GitLabApiError);
        expect((e as GitLabApiError).status).toBe(401);
      }
    });

    it("handles 404", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response('{"message":"404 Not Found"}', {
          status: 404,
          statusText: "Not Found",
        }),
      );

      try {
        await client.get("/projects/999");
        expect.unreachable("should have thrown");
      } catch (e) {
        expect(e).toBeInstanceOf(GitLabApiError);
        expect((e as GitLabApiError).status).toBe(404);
      }
    });
  });

  describe("trailing slash handling", () => {
    it("strips trailing slash from baseUrl", async () => {
      const client2 = new GitLabClient({
        baseUrl: "http://gitlab.test/",
        token: "test-token",
      });

      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response("[]", { status: 200 }),
      );

      await client2.get("/projects");

      const calledUrl = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(calledUrl).toBe("http://gitlab.test/api/v4/projects");
    });
  });
});
