import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
app.use(bodyParser.json());

// POST endpoint to generate a story
app.post("/story", async (req, res) => {
  const { character, keywords, style, mode } = req.body;

  // Validate input
  if (!character || !keywords || !Array.isArray(keywords) || !style) {
    return res.status(400).json({ error: "Missing or invalid input fields" });
  }

  // Construct the prompt based on mode
  let prompt = "";

  if (mode === "one-shot") {
    // One-shot prompting: include one example story
    const exampleStory = `
Example:
Character: Alice
Keywords: magic, rabbit, clock
Style: whimsical
Story: Alice followed the white rabbit through the enchanted forest, discovering a magical clock that ticked backward, revealing hidden wonders.
    `;
    prompt = `
You are Story Buddy, a creative short story generator.
${exampleStory}

Now write a story using:
- Character: ${character}
- Keywords: ${keywords.join(", ")}
- Style: ${style}
Story should be engaging, use all keywords, and be under 150 words.
`;
  } else if (mode === "multi-shot") {
    // Multi-shot prompting: include multiple example stories
    const examples = `
Example 1:
Character: Luna the mage
Keywords: castle, magic, friendship
Style: whimsical
Story: Luna the mage wandered through the enchanted castle, her wand glowing as she discovered new friends in every corner. Magic swirled around them, and laughter echoed through the halls.

Example 2:
Character: Arlo the knight
Keywords: dragon, forest, bravery
Style: adventurous
Story: Arlo ventured into the dark forest, sword in hand, ready to face the dragon. His courage never wavered, and he formed a bond with the dragon along the way.
    `;
    prompt = `
You are Story Buddy, a creative short story generator.
${examples}

Now write a story using:
- Character: ${character}
- Keywords: ${keywords.join(", ")}
- Style: ${style}
Story should be engaging, use all keywords, and be under 150 words.
`;
  } else {
    // Default zero-shot prompting
    prompt = `
You are Story Buddy, a creative short story generator.
Write a short story using:
- Character: ${character}
- Keywords: ${keywords.join(", ")}
- Style: ${style}
Story should be engaging, use all keywords, and be under 150 words.
`;
  }

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "llama3", prompt, stream: false })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Ollama API error: ${text}`);
    }

    const data = await response.json();

    res.json({ story: data.response });
  } catch (error) {
    console.error("Error generating story:", error.message);
    res.status(500).json({ error: "Failed to generate story" });
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Story Buddy running on http://localhost:${PORT}`);
});