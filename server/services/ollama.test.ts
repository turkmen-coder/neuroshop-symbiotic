import { describe, expect, it } from "vitest";
import { ollamaService } from "./ollama";

describe("Ollama Service", () => {
  it("should check Ollama availability", async () => {
    const result = await ollamaService.checkAvailability();
    
    expect(result).toHaveProperty("available");
    expect(result).toHaveProperty("models");
    expect(typeof result.available).toBe("boolean");
    expect(Array.isArray(result.models)).toBe(true);
    
    console.log("[Ollama Test] Availability:", result.available);
    console.log("[Ollama Test] Models:", result.models);
  }, 30000); // 30 second timeout for API call
});
