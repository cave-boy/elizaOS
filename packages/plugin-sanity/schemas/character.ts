export default {
    name: "character",
    title: "Character",
    type: "document",
    fields: [
      {
        name: "id",
        title: "ID",
        type: "string",
        validation: (Rule: any) => Rule.required(),
        description: "Unique identifier (e.g., 'eliza' or 'kaleem-character')",
      },
      {
        name: "name",
        title: "Name",
        type: "string",
        validation: (Rule: any) => Rule.required(),
        description: "Display name (e.g., 'Eliza')",
      },
      {
        name: "username",
        title: "Username",
        type: "string",
        description: "Optional username (e.g., 'eliza')",
      },
      {
        name: "system",
        title: "System Prompt",
        type: "text",
        description: "Prompt defining the character’s behavior",
      },
      {
        name: "bio",
        title: "Biography",
        type: "array",
        of: [{ type: "block" }], // Changed from string to block
        description: "List of bio statements",
      },
      
      {
        name: "lore",
        title: "Background Lore",
        type: "array",
        of: [{ type: "string" }],
        description: "List of backstory snippets",
      },
      {
        name: "messageExamples",
        title: "Message Examples",
        type: "array",
        of: [
          {
            type: "object",
            fields: [
              {
                name: "user",
                title: "User Messages",
                type: "array",
                of: [
                  {
                    type: "object",
                    fields: [
                      { name: "user", title: "User", type: "string" },
                      { name: "text", title: "Text", type: "string" },
                    ],
                  },
                ],
              },
              {
                name: "eliza",
                title: "Eliza Messages",
                type: "array",
                of: [
                  {
                    type: "object",
                    fields: [
                      { name: "user", title: "User", type: "string" },
                      { name: "text", title: "Text", type: "string" },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        description: "Example dialogues in user-Eliza pairs",
      },
      {
        name: "postExamples",
        title: "Post Examples",
        type: "array",
        of: [{ type: "string" }],
        description: "Sample posts",
      },
      {
        name: "topics",
        title: "Known Topics",
        type: "array",
        of: [{ type: "string" }],
        description: "Topics of expertise",
      },
      {
        name: "style",
        title: "Style",
        type: "object",
        fields: [
          {
            name: "all",
            title: "All Contexts",
            type: "array",
            of: [{ type: "string" }],
          },
          {
            name: "chat",
            title: "Chat",
            type: "array",
            of: [{ type: "string" }],
          },
          {
            name: "post",
            title: "Post",
            type: "array",
            of: [{ type: "string" }],
          },
        ],
        description: "Style guidelines for different contexts",
      },
      {
        name: "adjectives",
        title: "Character Traits",
        type: "array",
        of: [{ type: "string" }],
        description: "Traits describing the character",
      },
      {
        name: "modelProvider",
        title: "Model Provider",
        type: "string",
        options: { list: ["OPENAI", "OLLAMA", "CUSTOM"] },
        description: "AI model provider (optional, defaults to OPENAI)",
      },
      {
        name: "plugins",
        title: "Plugins",
        type: "array",
        of: [{ type: "string" }],
        description: "List of plugin identifiers (e.g., 'telegram', 'solana')",
      },
      {
        name: "settings",
        title: "Settings",
        type: "object",
        fields: [
          {
            name: "voice",
            title: "Voice",
            type: "object",
            fields: [
              { name: "model", title: "Voice Model", type: "string" },
            ],
          },
        ],
        description: "Optional runtime settings (e.g., voice config)",
      },
      {
        name: "enabled",
        title: "Enabled",
        type: "boolean",
        initialValue: true,
        description: "Whether this character should be loaded",
      },
    ],
  };