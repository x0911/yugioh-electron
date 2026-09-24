import type { DeckExecutor } from './types.js';
import type { EvaluatorContext } from '../types.js';
import type { DeckExecutorInfo } from '../../../shared/types/character.js';
import { DefaultExecutor } from './DefaultExecutor.js';
import { BlueEyesExecutor } from './archetypes/BlueEyesExecutor.js';
import { CyberDragonExecutor } from './archetypes/CyberDragonExecutor.js';
import { DarkMagicianExecutor } from './archetypes/DarkMagicianExecutor.js';
import { HeroFusionExecutor } from './archetypes/HeroFusionExecutor.js';
import { AntiMetaStunExecutor } from './archetypes/AntiMetaStunExecutor.js';
import { BurnOTKExecutor } from './archetypes/BurnOTKExecutor.js';
import { MonarchExecutor } from './archetypes/MonarchExecutor.js';
import { GladiatorBeastExecutor } from './archetypes/GladiatorBeastExecutor.js';
import { VolcanicExecutor } from './archetypes/VolcanicExecutor.js';
import { AncientGearExecutor } from './archetypes/AncientGearExecutor.js';
import { LightswornExecutor } from './archetypes/LightswornExecutor.js';
import { ChaosDadExecutor } from './archetypes/ChaosDadExecutor.js';
import { SynchronExecutor } from './archetypes/SynchronExecutor.js';
import { BlackwingExecutor } from './archetypes/BlackwingExecutor.js';
import { ToonExecutor } from './archetypes/ToonExecutor.js';
import { ResonatorExecutor } from './archetypes/ResonatorExecutor.js';
import { InfernityExecutor } from './archetypes/InfernityExecutor.js';
import { GravekeeperExecutor } from './archetypes/GravekeeperExecutor.js';
import { CrystalBeastExecutor } from './archetypes/CrystalBeastExecutor.js';
import { DinosaurExecutor } from './archetypes/DinosaurExecutor.js';
import { HarpieExecutor } from './archetypes/HarpieExecutor.js';
import { ZombieExecutor } from './archetypes/ZombieExecutor.js';
import { SixSamuraiExecutor } from './archetypes/SixSamuraiExecutor.js';
import { DarkWorldExecutor } from './archetypes/DarkWorldExecutor.js';
import { OjamaExecutor } from './archetypes/OjamaExecutor.js';
import { YubelSacredBeastExecutor } from './archetypes/YubelSacredBeastExecutor.js';
import { TrapMonsterExecutor } from './archetypes/TrapMonsterExecutor.js';
import { WaterOceanExecutor } from './archetypes/WaterOceanExecutor.js';
import { RelinquishedExecutor } from './archetypes/RelinquishedExecutor.js';
import { OldSchoolWarriorExecutor } from './archetypes/OldSchoolWarriorExecutor.js';
import { SynchroArchetypesExecutor } from './archetypes/SynchroArchetypesExecutor.js';
import { EgyptianGodExecutor } from './archetypes/EgyptianGodExecutor.js';
import { InsectSwarmExecutor } from './archetypes/InsectSwarmExecutor.js';
import { GuardianEquipExecutor } from './archetypes/GuardianEquipExecutor.js';
import { CloudianExecutor } from './archetypes/CloudianExecutor.js';
import { NordicGodsExecutor } from './archetypes/NordicGodsExecutor.js';
import { SecurityGoyoExecutor } from './archetypes/SecurityGoyoExecutor.js';
import { TimelordExecutor } from './archetypes/TimelordExecutor.js';
import { BatterymanExecutor } from './archetypes/BatterymanExecutor.js';
import { FairySanctuaryExecutor } from './archetypes/FairySanctuaryExecutor.js';

export class ExecutorRegistry {
  private static instance: ExecutorRegistry | null = null;
  private defaultExecutor: DeckExecutor;
  private registeredExecutors: DeckExecutor[] = [];

  private constructor() {
    this.defaultExecutor = new DefaultExecutor();
    this.registerExecutor(new InsectSwarmExecutor());
    this.registerExecutor(new GuardianEquipExecutor());
    this.registerExecutor(new CloudianExecutor());
    this.registerExecutor(new NordicGodsExecutor());
    this.registerExecutor(new SecurityGoyoExecutor());
    this.registerExecutor(new TimelordExecutor());
    this.registerExecutor(new BatterymanExecutor());
    this.registerExecutor(new FairySanctuaryExecutor());
    this.registerExecutor(new CrystalBeastExecutor());
    this.registerExecutor(new DinosaurExecutor());
    this.registerExecutor(new HarpieExecutor());
    this.registerExecutor(new ZombieExecutor());
    this.registerExecutor(new SixSamuraiExecutor());
    this.registerExecutor(new DarkWorldExecutor());
    this.registerExecutor(new OjamaExecutor());
    this.registerExecutor(new YubelSacredBeastExecutor());
    this.registerExecutor(new TrapMonsterExecutor());
    this.registerExecutor(new WaterOceanExecutor());
    this.registerExecutor(new RelinquishedExecutor());
    this.registerExecutor(new OldSchoolWarriorExecutor());
    this.registerExecutor(new SynchroArchetypesExecutor());
    this.registerExecutor(new EgyptianGodExecutor());
    this.registerExecutor(new SynchronExecutor());
    this.registerExecutor(new BlackwingExecutor());
    this.registerExecutor(new ToonExecutor());
    this.registerExecutor(new ResonatorExecutor());
    this.registerExecutor(new InfernityExecutor());
    this.registerExecutor(new GravekeeperExecutor());
    this.registerExecutor(new BlueEyesExecutor());
    this.registerExecutor(new CyberDragonExecutor());
    this.registerExecutor(new DarkMagicianExecutor());
    this.registerExecutor(new HeroFusionExecutor());
    this.registerExecutor(new AntiMetaStunExecutor());
    this.registerExecutor(new BurnOTKExecutor());
    this.registerExecutor(new MonarchExecutor());
    this.registerExecutor(new GladiatorBeastExecutor());
    this.registerExecutor(new VolcanicExecutor());
    this.registerExecutor(new AncientGearExecutor());
    this.registerExecutor(new LightswornExecutor());
    this.registerExecutor(new ChaosDadExecutor());
  }

  public static getInstance(): ExecutorRegistry {
    if (!ExecutorRegistry.instance) {
      ExecutorRegistry.instance = new ExecutorRegistry();
    }
    return ExecutorRegistry.instance;
  }

  /**
   * Registers a new custom deck executor into the registry.
   */
  public registerExecutor(executor: DeckExecutor): void {
    const existingIdx = this.registeredExecutors.findIndex((e) => e.id === executor.id);
    if (existingIdx >= 0) {
      this.registeredExecutors[existingIdx] = executor;
    } else {
      this.registeredExecutors.unshift(executor); // Higher priority for newly registered
    }
  }

  /**
   * Automatically resolves the best matching executor for the given deck and context.
   */
  public getExecutor(context: EvaluatorContext, deckCards: number[] = []): DeckExecutor {
    for (const executor of this.registeredExecutors) {
      if (executor.isApplicable(context, deckCards)) {
        return executor;
      }
    }
    return this.defaultExecutor;
  }

  /**
   * Resolves clean executor metadata for a deck (archetype + card IDs).
   */
  public resolveDeckExecutor(archetype: string, deckCards: number[] = []): DeckExecutorInfo {
    const mockContext = { deckArchetype: archetype } as EvaluatorContext;
    const exec = this.getExecutor(mockContext, deckCards);
    const hasCustomExecutor = exec.id !== 'default-universal';
    return {
      id: exec.id,
      name: exec.name,
      description: exec.description,
      hasCustomExecutor,
    };
  }

  public getAllExecutors(): DeckExecutor[] {
    return [this.defaultExecutor, ...this.registeredExecutors];
  }
}

export function getExecutorForDeck(context: EvaluatorContext, deckCards: number[] = []): DeckExecutor {
  return ExecutorRegistry.getInstance().getExecutor(context, deckCards);
}

export function resolveDeckExecutor(archetype: string, deckCards: number[] = []): DeckExecutorInfo {
  return ExecutorRegistry.getInstance().resolveDeckExecutor(archetype, deckCards);
}
