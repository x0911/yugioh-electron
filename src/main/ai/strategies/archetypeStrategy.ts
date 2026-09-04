import type { ArchetypeName } from '../types.js';

export interface ArchetypePlan {
  name: ArchetypeName;
  fusionWeight: number; // 0..2
  ritualWeight: number; // 0..2
  beatdownWeight: number; // 0..2
  defenseWeight: number; // 0..2
  burnWeight: number; // 0..2
  graveyardWeight: number; // 0..2
  swarmWeight: number; // 0..2
  preferredAttributes: number[];
  preferredRaces: number[];
}

export function resolveArchetypePlan(archetypeDescription: string = ''): ArchetypePlan {
  const desc = archetypeDescription.toLowerCase();

  if (desc.includes('blue-eyes') || desc.includes('dragon')) {
    return {
      name: 'DRAGON_POWER',
      fusionWeight: 1.2,
      ritualWeight: 0.5,
      beatdownWeight: 1.8,
      defenseWeight: 0.5,
      burnWeight: 0.3,
      graveyardWeight: 0.8,
      swarmWeight: 1.2,
      preferredAttributes: [0x20], // LIGHT
      preferredRaces: [0x2000], // DRAGON
    };
  }

  if (desc.includes('cyber dragon') || desc.includes('cyberdark') || desc.includes('machine')) {
    return {
      name: 'CYBER_OTK',
      fusionWeight: 1.8,
      ritualWeight: 0.0,
      beatdownWeight: 1.9,
      defenseWeight: 0.4,
      burnWeight: 0.4,
      graveyardWeight: 1.0,
      swarmWeight: 1.4,
      preferredAttributes: [0x20, 0x10], // LIGHT, DARK
      preferredRaces: [0x800], // MACHINE
    };
  }

  if (desc.includes('hero') || desc.includes('fusion') || desc.includes('neos')) {
    return {
      name: 'FUSION_HERO',
      fusionWeight: 2.0,
      ritualWeight: 0.2,
      beatdownWeight: 1.5,
      defenseWeight: 0.6,
      burnWeight: 0.3,
      graveyardWeight: 1.1,
      swarmWeight: 1.5,
      preferredAttributes: [0x20, 0x01], // LIGHT, EARTH
      preferredRaces: [0x01], // WARRIOR
    };
  }

  if (desc.includes('dark magician') || desc.includes('spellcaster')) {
    return {
      name: 'SPELLCASTER_DARK_MAGIC',
      fusionWeight: 1.2,
      ritualWeight: 1.2,
      beatdownWeight: 1.3,
      defenseWeight: 0.9,
      burnWeight: 0.8,
      graveyardWeight: 1.2,
      swarmWeight: 1.1,
      preferredAttributes: [0x10], // DARK
      preferredRaces: [0x02], // SPELLCASTER
    };
  }

  if (desc.includes('exodia') || desc.includes('stall') || desc.includes('fairy')) {
    return {
      name: 'EXODIA',
      fusionWeight: 0.1,
      ritualWeight: 0.1,
      beatdownWeight: 0.3,
      defenseWeight: 2.0,
      burnWeight: 1.5,
      graveyardWeight: 1.2,
      swarmWeight: 0.8,
      preferredAttributes: [0x10, 0x20], // DARK, LIGHT
      preferredRaces: [0x02, 0x04], // SPELLCASTER, FAIRY
    };
  }

  if (desc.includes('zombie') || desc.includes('destiny board') || desc.includes('shadow')) {
    return {
      name: 'ZOMBIE_GRAVE',
      fusionWeight: 0.5,
      ritualWeight: 0.5,
      beatdownWeight: 1.2,
      defenseWeight: 1.3,
      burnWeight: 1.0,
      graveyardWeight: 2.0,
      swarmWeight: 1.6,
      preferredAttributes: [0x10], // DARK
      preferredRaces: [0x10], // ZOMBIE
    };
  }

  if (desc.includes('ancient gear') || desc.includes('siege')) {
    return {
      name: 'ANCIENT_GEAR',
      fusionWeight: 1.5,
      ritualWeight: 0.0,
      beatdownWeight: 1.9,
      defenseWeight: 0.3,
      burnWeight: 0.5,
      graveyardWeight: 0.7,
      swarmWeight: 1.1,
      preferredAttributes: [0x01], // EARTH
      preferredRaces: [0x800], // MACHINE
    };
  }

  if (desc.includes('crystal beast') || desc.includes('rainbow dragon')) {
    return {
      name: 'CRYSTAL_BEAST',
      fusionWeight: 1.4,
      ritualWeight: 0.0,
      beatdownWeight: 1.4,
      defenseWeight: 0.8,
      burnWeight: 0.4,
      graveyardWeight: 1.3,
      swarmWeight: 1.8,
      preferredAttributes: [0x20], // LIGHT
      preferredRaces: [0x80, 0x100], // BEAST, BEAST_WARRIOR
    };
  }

  if (desc.includes('ritual') || desc.includes('cyber angel') || desc.includes('black luster')) {
    return {
      name: 'RITUAL',
      fusionWeight: 0.8,
      ritualWeight: 2.0,
      beatdownWeight: 1.5,
      defenseWeight: 0.7,
      burnWeight: 0.3,
      graveyardWeight: 1.0,
      swarmWeight: 1.2,
      preferredAttributes: [0x20, 0x01], // LIGHT, EARTH
      preferredRaces: [0x01, 0x04], // WARRIOR, FAIRY
    };
  }

  if (desc.includes('monarch') || desc.includes('soul control') || desc.includes('tribute')) {
    return {
      name: 'MONARCH',
      fusionWeight: 0.2,
      ritualWeight: 0.1,
      beatdownWeight: 1.8,
      defenseWeight: 0.9,
      burnWeight: 0.8,
      graveyardWeight: 1.6,
      swarmWeight: 1.2,
      preferredAttributes: [0x10, 0x08, 0x04, 0x02], // DARK, WIND, WATER, FIRE
      preferredRaces: [0x4000, 0x08], // FIEND, AQUA
    };
  }

  if (desc.includes('gladiator') || desc.includes('gladiator beast')) {
    return {
      name: 'GLADIATOR_BEAST',
      fusionWeight: 1.8,
      ritualWeight: 0.0,
      beatdownWeight: 1.7,
      defenseWeight: 0.8,
      burnWeight: 0.3,
      graveyardWeight: 1.4,
      swarmWeight: 1.9,
      preferredAttributes: [0x01, 0x20, 0x08], // EARTH, LIGHT, WIND
      preferredRaces: [0x100, 0x40], // BEAST_WARRIOR, WINGED_BEAST
    };
  }

  if (desc.includes('volcanic') || desc.includes('blaze')) {
    return {
      name: 'VOLCANIC',
      fusionWeight: 0.2,
      ritualWeight: 0.0,
      beatdownWeight: 1.4,
      defenseWeight: 1.2,
      burnWeight: 2.0,
      graveyardWeight: 1.5,
      swarmWeight: 1.3,
      preferredAttributes: [0x02], // FIRE
      preferredRaces: [0x1000], // PYRO
    };
  }

  if (desc.includes('lightsworn')) {
    return {
      name: 'LIGHTSWORN',
      fusionWeight: 0.3,
      ritualWeight: 0.2,
      beatdownWeight: 1.9,
      defenseWeight: 0.4,
      burnWeight: 0.2,
      graveyardWeight: 2.0,
      swarmWeight: 1.8,
      preferredAttributes: [0x20], // LIGHT
      preferredRaces: [0x01, 0x02, 0x2000], // WARRIOR, SPELLCASTER, DRAGON
    };
  }

  if (desc.includes('dad') || desc.includes('chaos') || desc.includes('dark armed')) {
    return {
      name: 'CHAOS_DAD',
      fusionWeight: 0.5,
      ritualWeight: 0.2,
      beatdownWeight: 1.9,
      defenseWeight: 0.5,
      burnWeight: 0.4,
      graveyardWeight: 1.9,
      swarmWeight: 1.7,
      preferredAttributes: [0x10, 0x20], // DARK, LIGHT
      preferredRaces: [0x2000, 0x01, 0x02], // DRAGON, WARRIOR, SPELLCASTER
    };
  }

  // Generic Beatdown / Aggro fallback
  return {
    name: 'BEATDOWN',
    fusionWeight: 1.0,
    ritualWeight: 1.0,
    beatdownWeight: 1.5,
    defenseWeight: 0.8,
    burnWeight: 0.6,
    graveyardWeight: 1.0,
    swarmWeight: 1.2,
    preferredAttributes: [0x10, 0x20, 0x01],
    preferredRaces: [0x01, 0x02, 0x2000],
  };
}
