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
      modelProvider,
      "plugins": plugins[]->name,
      bio,
      "lore": lore[]->text,
      "messageExamples": messageExamples[]->{ user, content { text, action } },
      postExamples,
      topics,
      adjectives,
      "settings": settings { secrets }
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

      // Generate UUID from Sanity character ID or name
      const characterId = stringToUuid(sanityChar.id || sanityChar.name);
      
      // Log both IDs for debugging
      elizaLogger.debug(`Character mapping: Sanity ID ${sanityChar._id} → elizaOS UUID ${characterId}`);
      
      return {
        id: characterId, // Use the generated UUID
        sanityId: sanityChar._id, // Store the original Sanity ID
        name: sanityChar.name,
        modelProvider: sanityChar.modelProvider as ModelProviderName,
        plugins: mappedPlugins,
        bio: sanityChar.bio || "",
        lore: sanityChar.lore || [],
        messageExamples: sanityChar.messageExamples
          ? sanityChar.messageExamples.map((ex: any) => ({
              user: ex.user,
              content: { text: ex.content.text, action: ex.content.action },
            }))
          : [],
        postExamples: sanityChar.postExamples || [],
        topics: sanityChar.topics || [],
        adjectives: sanityChar.adjectives || [],
        settings: sanityChar.settings || {},
        style: { all: [], chat: [], post: [] },
        username: undefined,
        email: undefined,
        system: undefined,
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
        extends: undefined,
        twitterSpaces: undefined,
      };
    });

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
