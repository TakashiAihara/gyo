const PORT = Number(process.env.PORT ?? 8080);

Bun.serve({
  port: PORT,
  fetch(req) {
    const url = new URL(req.url);
    return new Response(`gyo server: ${url.pathname}`, { status: 404 });
  },
});

console.log(`gyo server listening on :${PORT}`);
