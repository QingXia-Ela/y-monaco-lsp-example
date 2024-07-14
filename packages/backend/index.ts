import Elysia from "elysia";

const app = new Elysia();

app
  .get("/", () => "Hello World!");