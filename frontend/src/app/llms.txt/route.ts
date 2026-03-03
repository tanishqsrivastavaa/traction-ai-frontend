export function GET() {
  const baseUrl = "https://traction-ai.me";

  const content = `# Traction

> AI-powered pitch deck generator. Create investor-ready pitch decks from a single prompt.

Traction helps founders, startups, and businesses generate professional pitch decks with supporting documents including executive summaries, financial projections, market research, SWOT analysis, competitive analysis, and more.

## How It Works

1. Create a project and chat with the Traction Agent about your startup
2. The agent extracts structured data across 9 document categories
3. Switch to design mode to generate a full pitch deck + documents
4. Share your pitch at traction-ai.me/{username}/{project-name}

## Links

- Homepage: ${baseUrl}
- Services: ${baseUrl}/services
- Portfolio: ${baseUrl}/work
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
