/**
 * Atlantic Links B&B — Enquiry Handler Agent
 *
 * This agent takes a guest enquiry and drafts a personalised reply email.
 * It demonstrates the core agent pattern: LLM + tools + loop.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=your_key node agents/enquiry-agent.js
 *
 * Install dependency first:
 *   npm install @anthropic-ai/sdk
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// ── Package data (in a real app this would come from a database) ──────────
const PACKAGES = {
  'weekend getaway': {
    nights: 2,
    rounds: 1,
    price: 399,
    includes: [
      '2 nights B&B accommodation',
      '1 round at Narin & Portnoo',
      'Full Irish breakfast daily',
      'Airport transfer (Donegal/Sligo)',
      'Local course guide & tips',
    ],
  },
  'classic links': {
    nights: 4,
    rounds: 3,
    price: 799,
    includes: [
      '4 nights B&B accommodation',
      '3 rounds at Narin & Portnoo',
      'Full Irish breakfast daily',
      'Airport transfers included',
      'Golf club storage & drying room',
      'Optional: Slieve League tour',
    ],
  },
  'ultimate donegal': {
    nights: 7,
    rounds: 6,
    price: 1549,
    includes: [
      '7 nights B&B accommodation',
      '6 rounds at Narin & Portnoo',
      'Full Irish breakfast daily',
      'All airport transfers',
      'Wild Atlantic Way driving tour',
      'Welcome dinner & farewell drinks',
      'Caddie available (extra)',
    ],
  },
};

// ── Tool definitions (what the agent can "do") ────────────────────────────
const tools = [
  {
    name: 'get_package_details',
    description: 'Look up the details of a golf package by name.',
    input_schema: {
      type: 'object',
      properties: {
        package_name: {
          type: 'string',
          description: 'Name of the package: "weekend getaway", "classic links", or "ultimate donegal"',
        },
      },
      required: ['package_name'],
    },
  },
  {
    name: 'draft_email',
    description: 'Compose and return a draft reply email to the guest enquiry.',
    input_schema: {
      type: 'object',
      properties: {
        subject: { type: 'string', description: 'Email subject line' },
        body:    { type: 'string', description: 'Full email body text' },
      },
      required: ['subject', 'body'],
    },
  },
];

// ── Tool execution (maps tool calls → real results) ───────────────────────
function executeTool(name, input) {
  if (name === 'get_package_details') {
    const key = input.package_name.toLowerCase();
    const pkg = PACKAGES[key];
    if (!pkg) return { error: `Package "${input.package_name}" not found.` };
    return {
      package: input.package_name,
      price_usd_per_person: pkg.price,
      nights: pkg.nights,
      rounds: pkg.rounds,
      includes: pkg.includes,
    };
  }

  if (name === 'draft_email') {
    return {
      status: 'draft_ready',
      subject: input.subject,
      body: input.body,
    };
  }

  return { error: `Unknown tool: ${name}` };
}

// ── Agent loop ────────────────────────────────────────────────────────────
async function handleEnquiry(enquiry) {
  console.log('\n── Enquiry received ──────────────────────────────────');
  console.log(JSON.stringify(enquiry, null, 2));
  console.log('─────────────────────────────────────────────────────\n');

  const systemPrompt = `You are a helpful assistant for Atlantic Links B&B, a golfer-focused
bed and breakfast in Portnoo, Co. Donegal, Ireland. Your job is to respond warmly and
professionally to guest enquiries, personalise replies with the guest's name and details,
and draft a reply email using the tools available to you.

Always:
- Use get_package_details before drafting the email so you have accurate pricing
- Address the guest by their first name
- Mention their specific travel dates and group size
- Sign off as "The Atlantic Links Team"`;

  const userMessage = `Please handle this guest enquiry and draft a reply email:

Name: ${enquiry.name}
Email: ${enquiry.email}
Travel dates: ${enquiry.dates}
Number of golfers: ${enquiry.golfers}
Package interest: ${enquiry.package}
Notes: ${enquiry.notes || 'None'}`;

  const messages = [{ role: 'user', content: userMessage }];
  let draft = null;

  // Agent loop — runs until the model stops calling tools
  while (true) {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      tools,
      messages,
    });

    messages.push({ role: 'assistant', content: response.content });

    if (response.stop_reason === 'end_turn') break;

    if (response.stop_reason === 'tool_use') {
      const toolResults = [];

      for (const block of response.content) {
        if (block.type !== 'tool_use') continue;

        console.log(`🔧 Tool called: ${block.name}`);
        console.log('   Input:', JSON.stringify(block.input, null, 2));

        const result = executeTool(block.name, block.input);
        console.log('   Result:', JSON.stringify(result, null, 2));

        if (block.name === 'draft_email') draft = result;

        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: JSON.stringify(result),
        });
      }

      messages.push({ role: 'user', content: toolResults });
    }
  }

  // Print the final draft
  if (draft) {
    console.log('\n── Draft Email ───────────────────────────────────────');
    console.log(`To:      ${enquiry.email}`);
    console.log(`Subject: ${draft.subject}`);
    console.log('─────────────────────────────────────────────────────');
    console.log(draft.body);
    console.log('─────────────────────────────────────────────────────\n');
  }
}

// ── Sample enquiry — edit this to test different scenarios ────────────────
const sampleEnquiry = {
  name: 'Mike Patterson',
  email: 'mike.patterson@email.com',
  dates: 'September 8–12, 2026',
  golfers: 4,
  package: 'Classic Links',
  notes: 'Two of us are single handicap, two are around 18. Any chance of a caddie?',
};

handleEnquiry(sampleEnquiry).catch(console.error);
