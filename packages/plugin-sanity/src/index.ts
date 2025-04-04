// /home/cave/projects/bots/venv/elizaOS_env/elizaOS/packages/plugin-sanity/src/index.ts
import { createClient } from "@sanity/client";
import { Character, ModelProviderName, Plugin, elizaLogger, stringToUuid } from "@elizaos/core";
import telegram from "@elizaos-plugins/client-telegram";
import solana from "@elizaos-plugins/plugin-solana";
import "dotenv/config";

console.log("Env vars:", {
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: process.env.SANITY_API_VERSION,
});

export const sanityClient = createClient({
  projectId: process.env.SANITY_PROJECT_ID || "xyz789abc",
  dataset: process.env.SANITY_DATASET || "production",
  apiVersion: process.env.SANITY_API_VERSION || "2023-05-03",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

export async function loadEnabledSanityCharacters(): Promise<Character[]> {
  try {
    const query = `*[_type == "character" && enabled == true] {
      _id,
      id,
      name,
      username,
      system,
      modelProvider,
      plugins,
      bio,
      lore,
      messageExamples[] {
        conversation[] {
          user,
          content { text, action }
        }
      },
      postExamples,
      topics,
      adjectives,
      style {
        all,
        chat,
        post
      },
      settings {
        secrets {
          dynamic[] { key, value }
        },
        voice { model }
      }
    }`;
    const sanityCharacters = await sanityClient.fetch(query);

    const characters: Character[] = sanityCharacters.map((sanityChar: any) => {
      const mappedPlugins: Plugin[] = (sanityChar.plugins || [])
        .map((pluginName: string): Plugin | undefined => {
          switch (pluginName) {
            case "telegram":
              return {
                name: "telegram",
                description: "Telegram client plugin",
                clients: (telegram as any).clients || [],
              };
            case "solana":
              return {
                name: "solana",
                description: "Solana plugin",
                actions: (solana as any).actions || [],
              };
            default:
              elizaLogger.warn(`Unknown plugin: ${pluginName}`);
              return undefined;
          }
        })
        .filter((plugin): plugin is Plugin => plugin !== undefined);

      const characterId = stringToUuid(sanityChar.id); // Use id only, no fallback
      elizaLogger.debug(`Character mapping: Sanity ID ${sanityChar._id} → elizaOS UUID ${characterId}`);

      const secrets = (sanityChar.settings?.secrets?.dynamic || []).reduce(
        (acc: { [key: string]: string }, item: { key: string; value: string }) => {
          acc[item.key] = item.value;
          return acc;
        },
        {}
      );

      const validModelProviders = ["OPENAI", "OLLAMA", "CUSTOM"];
      const modelProvider = validModelProviders.includes(sanityChar.modelProvider)
        ? sanityChar.modelProvider.toLowerCase()
        : ModelProviderName.OPENAI;

      const character = {
        id: characterId,
        sanityId: sanityChar._id,
        name: sanityChar.name,
        username: sanityChar.username,
        system: sanityChar.system,
        modelProvider: modelProvider as ModelProviderName,
        plugins: mappedPlugins,
        bio: sanityChar.bio || [],
        lore: sanityChar.lore || [],
        messageExamples: (sanityChar.messageExamples || []).map((ex: any) =>
          ex.conversation.map((msg: any) => ({
            user: msg.user,
            content: { text: msg.content.text, action: msg.content.action },
          }))
        ),
        postExamples: sanityChar.postExamples || [],
        topics: sanityChar.topics || [],
        adjectives: sanityChar.adjectives || [],
        style: {
          all: sanityChar.style?.all || [],
          chat: sanityChar.style?.chat || [],
          post: sanityChar.style?.post || [],
        },
        settings: {
          secrets,
          voice: sanityChar.settings?.voice ? { model: sanityChar.settings.voice.model } : undefined,
        },
        email: undefined,
        imageModelProvider: undefined,
        imageVisionModelProvider: undefined,
        modelEndpointOverride: undefined,
        templates: undefined,
        knowledge: [],
        clientConfig: undefined,
        twitterProfile: undefined,
        instagramProfile: undefined,
        simsaiProfile: undefined,
        nft: undefined,
        extends: [],
        twitterSpaces: undefined,
      };

      return character;
    });

    console.log("Fetched characters from Sanity:", JSON.stringify(characters, null, 2));
    return characters;
  } catch (error) {
    elizaLogger.error("Failed to fetch characters from Sanity:", error);
    return [];
  }
}

export default {
  name: "sanity",
  description: "Sanity plugin for fetching character data",
  providers: [
    {
      name: "sanityCharacters",
      description: "Provides enabled characters from Sanity",
      handler: loadEnabledSanityCharacters,
    },
  ],
};