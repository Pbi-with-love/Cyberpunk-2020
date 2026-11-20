import { createRng } from "../src/dice";
import { randomizeCharacter } from "../src/rules";
import { rolesData } from "../src/data";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROLE_CUSTOM_HANDLES: Record<string, string> = {
  solo: "Razor",
  rocker: "Johnny Chrome",
  netrunner: "Ghost_0x",
  media: "Vera Truth",
  nomad: "Dust",
  fixer: "Slick",
  cop: "Kowalski",
  corporate: "Vance Sterling",
  techie: "Ratchet",
  medtechie: "Doc Trauma",
};

const samples = rolesData.roles.map((role, index) => {
  const seed = (index + 1) * 1337;
  const char = randomizeCharacter(createRng(seed), role.id);
  char.identity.handle = ROLE_CUSTOM_HANDLES[role.id] ?? char.identity.handle;
  return char;
});

const outPath = resolve(process.cwd(), "src/data/sample-characters.json");
writeFileSync(outPath, JSON.stringify(samples, null, 2) + "\n", "utf-8");
console.log(`Generated ${samples.length} sample characters at ${outPath}`);
