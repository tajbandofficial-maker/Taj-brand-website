/** Runs once when the server boots: refuse to start with an invalid env. */
export async function register() {
  // `next build` runs in CI without runtime secrets; validate only when serving.
  if (
    process.env.NEXT_RUNTIME === "nodejs" &&
    process.env.NEXT_PHASE !== "phase-production-build"
  ) {
    await import("./lib/env");
  }
}
