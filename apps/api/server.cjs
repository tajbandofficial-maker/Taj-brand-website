// CommonJS entry for hosts that start the app with require() (Hostinger / LiteSpeed, Passenger).
// dist/main.js is an ES module with top-level await, which require() cannot load, so load it
// with import() instead. Locally and in Docker, `node dist/main.js` still works as before.
import("./dist/main.js").catch((error) => {
  console.error(error);
  process.exit(1);
});
