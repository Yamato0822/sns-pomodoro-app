import { describe, it, expect } from "vitest";

describe("Authentication Secrets Validation", () => {
  it("should have Clerk publishable key", () => {
    const clerkKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
    expect(clerkKey).toBeDefined();
    expect(clerkKey).toMatch(/^pk_/);
  });

  it("should have Clerk secret key", () => {
    const clerkSecret = process.env.CLERK_SECRET_KEY;
    expect(clerkSecret).toBeDefined();
    expect(clerkSecret).toMatch(/^sk_/);
  });

  it("should have Supabase URL", () => {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    expect(supabaseUrl).toBeDefined();
    expect(supabaseUrl).toMatch(/^https:\/\/.*\.supabase\.co$/);
  });

  it("should have Supabase anon key", () => {
    const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    expect(anonKey).toBeDefined();
    expect(anonKey?.length).toBeGreaterThan(20);
  });

  it("should have Supabase service role key", () => {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    expect(serviceRoleKey).toBeDefined();
    expect(serviceRoleKey?.length).toBeGreaterThan(20);
  });

  it("should validate Supabase connection", async () => {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      throw new Error("Supabase credentials not set");
    }

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
      });
      expect(response.status).toBeLessThan(500);
    } catch (error) {
      expect(error).toBeUndefined();
    }
  });

  it("should validate Clerk configuration", async () => {
    const clerkKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

    if (!clerkKey) {
      throw new Error("Clerk publishable key not set");
    }

    expect(clerkKey).toMatch(/^pk_/);
  });
});
