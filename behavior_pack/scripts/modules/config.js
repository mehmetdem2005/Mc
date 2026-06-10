export const VERSION = "v2.0";
export const NS = "autonpcv20";
export const WORKER_ID = `${NS}:worker`;
export const GUIDE_ID = `${NS}:guide_book`;
export const GUIDE_NAME = "AutoNPC Yönetim Kitabı v2.0";
export const TAG_WORKER = `${NS}.worker`;
export const TAG_GOT_GUIDE = `${NS}.got_guide`;
export const TICK_INTERVAL = 2;
export const SCAN_RADIUS = 18;
export const SAFE_BREAK_TICKS = 12;
export const STEP_POWER = 0.11;
export const LOG_BLOCKS = [
  "minecraft:oak_log", "minecraft:birch_log", "minecraft:spruce_log", "minecraft:jungle_log",
  "minecraft:acacia_log", "minecraft:dark_oak_log", "minecraft:mangrove_log", "minecraft:cherry_log"
];
export const LEAF_BLOCKS = [
  "minecraft:oak_leaves", "minecraft:birch_leaves", "minecraft:spruce_leaves", "minecraft:jungle_leaves",
  "minecraft:acacia_leaves", "minecraft:dark_oak_leaves", "minecraft:mangrove_leaves", "minecraft:cherry_leaves",
  "minecraft:azalea_leaves", "minecraft:flowering_azalea_leaves"
];
export const APPLE_LEAVES = new Set(["minecraft:oak_leaves", "minecraft:dark_oak_leaves"]);
export const TREE_TYPES = {
  any: { label: "Her tür ağaç", logs: LOG_BLOCKS, leaves: LEAF_BLOCKS },
  oak: { label: "Meşe", logs: ["minecraft:oak_log"], leaves: ["minecraft:oak_leaves"] },
  birch: { label: "Huş", logs: ["minecraft:birch_log"], leaves: ["minecraft:birch_leaves"] },
  spruce: { label: "Ladin", logs: ["minecraft:spruce_log"], leaves: ["minecraft:spruce_leaves"] },
  jungle: { label: "Orman", logs: ["minecraft:jungle_log"], leaves: ["minecraft:jungle_leaves"] },
  acacia: { label: "Akasya", logs: ["minecraft:acacia_log"], leaves: ["minecraft:acacia_leaves"] },
  dark_oak: { label: "Koyu meşe", logs: ["minecraft:dark_oak_log"], leaves: ["minecraft:dark_oak_leaves"] },
  mangrove: { label: "Mangrov", logs: ["minecraft:mangrove_log"], leaves: ["minecraft:mangrove_leaves"] },
  cherry: { label: "Kiraz", logs: ["minecraft:cherry_log"], leaves: ["minecraft:cherry_leaves"] }
};
export const ORES = {
  coal: { label: "Kömür", ores: ["minecraft:coal_ore", "minecraft:deepslate_coal_ore"], drop: "minecraft:coal", tool: "wood" },
  copper: { label: "Bakır", ores: ["minecraft:copper_ore", "minecraft:deepslate_copper_ore"], drop: "minecraft:raw_copper", tool: "stone" },
  iron: { label: "Demir", ores: ["minecraft:iron_ore", "minecraft:deepslate_iron_ore"], drop: "minecraft:raw_iron", tool: "stone" },
  gold: { label: "Altın", ores: ["minecraft:gold_ore", "minecraft:deepslate_gold_ore"], drop: "minecraft:raw_gold", tool: "iron" },
  redstone: { label: "Redstone", ores: ["minecraft:redstone_ore", "minecraft:deepslate_redstone_ore"], drop: "minecraft:redstone", tool: "iron" },
  lapis: { label: "Lapis", ores: ["minecraft:lapis_ore", "minecraft:deepslate_lapis_ore"], drop: "minecraft:lapis_lazuli", tool: "iron" },
  diamond: { label: "Elmas", ores: ["minecraft:diamond_ore", "minecraft:deepslate_diamond_ore"], drop: "minecraft:diamond", tool: "iron" },
  emerald: { label: "Zümrüt", ores: ["minecraft:emerald_ore", "minecraft:deepslate_emerald_ore"], drop: "minecraft:emerald", tool: "iron" }
};
export const STONE_BLOCKS = ["minecraft:stone", "minecraft:deepslate", "minecraft:tuff", "minecraft:andesite", "minecraft:diorite", "minecraft:granite"];
export const FORBIDDEN_COLLECT = new Set(["minecraft:air", "minecraft:cave_air", "minecraft:void_air", "minecraft:bedrock", "minecraft:barrier", "minecraft:command_block", "minecraft:chain_command_block", "minecraft:repeating_command_block", "minecraft:structure_block", "minecraft:jigsaw"]);
export const COMMON_BLOCKS = [
  ["minecraft:dirt", "Toprak"], ["minecraft:grass_block", "Çimen bloğu"], ["minecraft:sand", "Kum"],
  ["minecraft:gravel", "Çakıl"], ["minecraft:stone", "Taş"], ["minecraft:deepslate", "Derin taş"],
  ["minecraft:oak_log", "Meşe odunu"], ["minecraft:oak_leaves", "Meşe yaprağı"]
];
