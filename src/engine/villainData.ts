/**
 * Villain Data Configuration
 * Defines combat parameters and messages for each villain
 */

import { VillainData } from './combat.js';

/**
 * Troll combat messages
 */
const TROLL_MESSAGES = {
  missed: [
    "The troll swings his axe, but misses.",
    "The troll's axe whistles past your ear."
  ],
  lightWound: [
    "The troll's axe grazes you.",
    "The troll nicks you with his axe."
  ],
  seriousWound: [
    "The troll's axe strikes you with a mighty blow!",
    "The troll wounds you seriously with his axe!"
  ],
  stagger: [
    "The troll's blow staggers you!"
  ],
  loseWeapon: [
    "The troll's axe knocks your {weapon} from your hand!"
  ],
  unconscious: [
    "The troll knocks you unconscious!"
  ],
  killed: [
    "The troll's axe cleaves you in twain!"
  ],
  hesitate: [
    "The troll hesitates, giving you a chance to recover."
  ]
};

/**
 * Thief combat messages
 */
const THIEF_MESSAGES = {
  missed: [
    "The thief's stiletto misses you by an inch.",
    "The thief lunges at you but misses."
  ],
  lightWound: [
    "The thief pricks you with his stiletto.",
    "The thief's blade scratches you."
  ],
  seriousWound: [
    "The thief stabs you with his stiletto!",
    "The thief's blade finds its mark!"
  ],
  stagger: [
    "The thief's attack staggers you!"
  ],
  loseWeapon: [
    "The thief deftly disarms you!"
  ],
  unconscious: [
    "The thief's blow renders you unconscious!"
  ],
  killed: [
    "The thief's stiletto finds your heart!"
  ],
  hesitate: [
    "The thief pauses, eyeing you warily."
  ]
};

/**
 * Cyclops combat messages
 */
const CYCLOPS_MESSAGES = {
  missed: [
    "The cyclops swings at you but misses.",
    "The cyclops's massive fist whooshes past you."
  ],
  lightWound: [
    "The cyclops clips you with his fist.",
    "The cyclops grazes you."
  ],
  seriousWound: [
    "The cyclops strikes you with tremendous force!",
    "The cyclops's blow sends you reeling!"
  ],
  stagger: [
    "The cyclops's attack staggers you!"
  ],
  loseWeapon: [
    "The cyclops knocks your {weapon} away!"
  ],
  unconscious: [
    "The cyclops knocks you senseless!"
  ],
  killed: [
    "The cyclops crushes you!"
  ],
  hesitate: [
    "The cyclops hesitates, confused."
  ]
};

/**
 * Villain data for all enemies
 */
export const VILLAIN_DATA: VillainData[] = [
  {
    villainId: 'TROLL',
    bestWeapon: 'SWORD',
    bestWeaponAdvantage: 1,
    probability: 0,
    messages: TROLL_MESSAGES
  },
  {
    villainId: 'THIEF',
    bestWeapon: 'KNIFE',
    bestWeaponAdvantage: 1,
    probability: 0,
    messages: THIEF_MESSAGES
  },
  {
    villainId: 'CYCLOPS',
    bestWeapon: 'SWORD',
    bestWeaponAdvantage: 0,
    probability: 0,
    messages: CYCLOPS_MESSAGES
  }
];

/**
 * Get villain data by ID
 */
export function getVillainData(villainId: string): VillainData | undefined {
  return VILLAIN_DATA.find(v => v.villainId === villainId);
}
