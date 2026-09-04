import type { DeckExecutor } from './types.js';
import type { EvaluatorContext } from '../types.js';
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

export class ExecutorRegistry {
  private static instance: ExecutorRegistry | null = null;
  private defaultExecutor: DeckExecutor;
  private registeredExecutors: DeckExecutor[] = [];

  private constructor() {
    this.defaultExecutor = new DefaultExecutor();
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

  public getAllExecutors(): DeckExecutor[] {
    return [this.defaultExecutor, ...this.registeredExecutors];
  }
}

export function getExecutorForDeck(context: EvaluatorContext, deckCards: number[] = []): DeckExecutor {
  return ExecutorRegistry.getInstance().getExecutor(context, deckCards);
}
