<template>
  <Tooltip
    v-if="showTooltip"
    :text="computedTooltipText"
    position="top"
  >
    <div
      class="icon-indicator"
      :class="[
        `icon-indicator--${type}`,
        type === 'location' && `icon-indicator--${owner}`,
        type === 'status' && `icon-indicator--status-${status}`,
        typeof size === 'string' && `icon-indicator--${size}`,
        pulsing && 'icon-indicator--pulsing',
      ]"
      :style="customSizeStyle"
      :aria-label="computedTooltipText"
      role="img"
    >
      <slot>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <!-- Location Glyphs -->
          <template v-if="type === 'location'">
            <!-- Hand: Stylized hand holding card -->
            <template v-if="location === 'hand'">
              <rect x="7" y="2" width="10" height="14" rx="2" stroke="currentColor" fill="currentColor" fill-opacity="0.15" />
              <path d="M4 17a4 4 0 0 0 4 4h7a4 4 0 0 0 4-4v-2H4v2z" />
              <path d="M10 13v-3" stroke-width="1.5" />
            </template>

            <!-- Field: Hexagon/Octagon arena tile motif -->
            <template v-else-if="location === 'field'">
              <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" stroke="currentColor" fill="currentColor" fill-opacity="0.15" />
              <circle cx="12" cy="12" r="3" fill="currentColor" />
            </template>

            <!-- Deck: Stacked card deck -->
            <template v-else-if="location === 'deck'">
              <rect x="4" y="8" width="12" height="14" rx="2" stroke="currentColor" fill="currentColor" fill-opacity="0.15" />
              <path d="M7 5h11a2 2 0 0 1 2 2v11" />
              <path d="M10 2h10a2 2 0 0 1 2 2v11" stroke-dasharray="2 2" />
            </template>

            <!-- Extra Deck: Stacked deck with star sparkle -->
            <template v-else-if="location === 'extra-deck'">
              <rect x="3" y="8" width="11" height="14" rx="2" stroke="currentColor" fill="currentColor" fill-opacity="0.15" />
              <path d="M6 5h10a2 2 0 0 1 2 2v10" />
              <!-- Star accent -->
              <polygon points="18,3 19,6 22,7 19,8 18,11 17,8 14,7 17,6" fill="currentColor" stroke="none" />
            </template>

            <!-- Graveyard: Stylized tombstone arch silhouette -->
            <template v-else-if="location === 'graveyard'">
              <path d="M6 21V10a6 6 0 0 1 12 0v11" stroke="currentColor" fill="currentColor" fill-opacity="0.15" />
              <line x1="3" y1="21" x2="21" y2="21" stroke-width="2.5" />
              <line x1="12" y1="7" x2="12" y2="15" stroke-width="1.5" />
              <line x1="9" y1="10" x2="15" y2="10" stroke-width="1.5" />
            </template>

            <!-- Banished: Swirling void / portal vortex -->
            <template v-else-if="location === 'banished'">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-dasharray="8 4" />
              <path d="M12 7a5 5 0 0 1 5 5c0 2.76-2.24 5-5 5s-5-2.24-5-5a3 3 0 0 1 3-3c1.66 0 3 1.34 3 3a1 1 0 0 1-1 1" />
            </template>
          </template>

          <!-- Status Glyphs -->
          <template v-else-if="type === 'status'">
            <!-- Effect Negated: Shield with diagonal slash -->
            <template v-if="status === 'negated'">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" fill="currentColor" fill-opacity="0.15" />
              <line x1="4" y1="4" x2="20" y2="20" stroke-width="2.5" stroke="currentColor" />
            </template>

            <!-- Cannot Special Summon: Rising star with slash -->
            <template v-else-if="status === 'no-special-summon'">
              <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" stroke="currentColor" fill="currentColor" fill-opacity="0.15" />
              <line x1="3" y1="3" x2="21" y2="21" stroke-width="2.5" stroke="currentColor" />
            </template>

            <!-- Temporarily Banished: Portal with hourglass -->
            <template v-else-if="status === 'temp-banished'">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-dasharray="6 3" />
              <path d="M9 7h6l-3 4-3-4zM9 17h6l-3-4-3 4z" fill="currentColor" />
            </template>

            <!-- Fusion Material: 2 overlapping cards merging into swirl -->
            <template v-else-if="status === 'fusion-material'">
              <rect x="4" y="5" width="8" height="11" rx="1.5" stroke="currentColor" fill="currentColor" fill-opacity="0.2" />
              <rect x="11" y="8" width="8" height="11" rx="1.5" stroke="currentColor" fill="currentColor" fill-opacity="0.2" />
              <path d="M9 10a3 3 0 0 1 4 2" stroke-width="1.8" />
            </template>

            <!-- Synchro Material: Card with rising sparkles -->
            <template v-else-if="status === 'synchro-material'">
              <rect x="6" y="7" width="12" height="14" rx="2" stroke="currentColor" fill="currentColor" fill-opacity="0.2" />
              <circle cx="9" cy="4" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="15" cy="3" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="12" cy="12" r="3" stroke-dasharray="2 2" />
            </template>

            <!-- Destroyed by Battle: Crossed swords with shatter crack -->
            <template v-else-if="status === 'destroyed-battle'">
              <line x1="5" y1="5" x2="19" y2="19" stroke-width="2" />
              <line x1="19" y1="5" x2="5" y2="19" stroke-width="2" />
              <polyline points="10,6 12,12 14,10 13,16" stroke-width="1.5" stroke-dasharray="1 1" />
            </template>

            <!-- Cannot Attack: Sword with slash -->
            <template v-else-if="status === 'no-attack'">
              <line x1="7" y1="17" x2="17" y2="7" stroke-width="2" />
              <polyline points="14,4 20,4 20,10" />
              <line x1="4" y1="4" x2="20" y2="20" stroke-width="2.5" stroke="currentColor" />
            </template>
          </template>
        </svg>
      </slot>
    </div>
  </Tooltip>

  <div
    v-else
    class="icon-indicator"
    :class="[
      `icon-indicator--${type}`,
      type === 'location' && `icon-indicator--${owner}`,
      type === 'status' && `icon-indicator--status-${status}`,
      typeof size === 'string' && `icon-indicator--${size}`,
      pulsing && 'icon-indicator--pulsing',
    ]"
    :style="customSizeStyle"
    role="img"
  >
    <slot>
      <!-- Render same SVG structure -->
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <template v-if="type === 'location'">
          <template v-if="location === 'hand'">
            <rect x="7" y="2" width="10" height="14" rx="2" stroke="currentColor" fill="currentColor" fill-opacity="0.15" />
            <path d="M4 17a4 4 0 0 0 4 4h7a4 4 0 0 0 4-4v-2H4v2z" />
            <path d="M10 13v-3" stroke-width="1.5" />
          </template>
          <template v-else-if="location === 'field'">
            <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" stroke="currentColor" fill="currentColor" fill-opacity="0.15" />
            <circle cx="12" cy="12" r="3" fill="currentColor" />
          </template>
          <template v-else-if="location === 'deck'">
            <rect x="4" y="8" width="12" height="14" rx="2" stroke="currentColor" fill="currentColor" fill-opacity="0.15" />
            <path d="M7 5h11a2 2 0 0 1 2 2v11" />
            <path d="M10 2h10a2 2 0 0 1 2 2v11" stroke-dasharray="2 2" />
          </template>
          <template v-else-if="location === 'extra-deck'">
            <rect x="3" y="8" width="11" height="14" rx="2" stroke="currentColor" fill="currentColor" fill-opacity="0.15" />
            <path d="M6 5h10a2 2 0 0 1 2 2v10" />
            <polygon points="18,3 19,6 22,7 19,8 18,11 17,8 14,7 17,6" fill="currentColor" stroke="none" />
          </template>
          <template v-else-if="location === 'graveyard'">
            <path d="M6 21V10a6 6 0 0 1 12 0v11" stroke="currentColor" fill="currentColor" fill-opacity="0.15" />
            <line x1="3" y1="21" x2="21" y2="21" stroke-width="2.5" />
            <line x1="12" y1="7" x2="12" y2="15" stroke-width="1.5" />
            <line x1="9" y1="10" x2="15" y2="10" stroke-width="1.5" />
          </template>
          <template v-else-if="location === 'banished'">
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-dasharray="8 4" />
            <path d="M12 7a5 5 0 0 1 5 5c0 2.76-2.24 5-5 5s-5-2.24-5-5a3 3 0 0 1 3-3c1.66 0 3 1.34 3 3a1 1 0 0 1-1 1" />
          </template>
        </template>
        <template v-else-if="type === 'status'">
          <template v-if="status === 'negated'">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" fill="currentColor" fill-opacity="0.15" />
            <line x1="4" y1="4" x2="20" y2="20" stroke-width="2.5" stroke="currentColor" />
          </template>
          <template v-else-if="status === 'no-special-summon'">
            <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" stroke="currentColor" fill="currentColor" fill-opacity="0.15" />
            <line x1="3" y1="3" x2="21" y2="21" stroke-width="2.5" stroke="currentColor" />
          </template>
          <template v-else-if="status === 'temp-banished'">
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-dasharray="6 3" />
            <path d="M9 7h6l-3 4-3-4zM9 17h6l-3-4-3 4z" fill="currentColor" />
          </template>
          <template v-else-if="status === 'fusion-material'">
            <rect x="4" y="5" width="8" height="11" rx="1.5" stroke="currentColor" fill="currentColor" fill-opacity="0.2" />
            <rect x="11" y="8" width="8" height="11" rx="1.5" stroke="currentColor" fill="currentColor" fill-opacity="0.2" />
            <path d="M9 10a3 3 0 0 1 4 2" stroke-width="1.8" />
          </template>
          <template v-else-if="status === 'synchro-material'">
            <rect x="6" y="7" width="12" height="14" rx="2" stroke="currentColor" fill="currentColor" fill-opacity="0.2" />
            <circle cx="9" cy="4" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="15" cy="3" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="12" cy="12" r="3" stroke-dasharray="2 2" />
          </template>
          <template v-else-if="status === 'destroyed-battle'">
            <line x1="5" y1="5" x2="19" y2="19" stroke-width="2" />
            <line x1="19" y1="5" x2="5" y2="19" stroke-width="2" />
            <polyline points="10,6 12,12 14,10 13,16" stroke-width="1.5" stroke-dasharray="1 1" />
          </template>
          <template v-else-if="status === 'no-attack'">
            <line x1="7" y1="17" x2="17" y2="7" stroke-width="2" />
            <polyline points="14,4 20,4 20,10" />
            <line x1="4" y1="4" x2="20" y2="20" stroke-width="2.5" stroke="currentColor" />
          </template>
        </template>
      </svg>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Tooltip from './Tooltip.vue';

export type LocationType = 'hand' | 'field' | 'deck' | 'extra-deck' | 'graveyard' | 'banished';
export type StatusType =
  | 'negated'
  | 'no-special-summon'
  | 'temp-banished'
  | 'fusion-material'
  | 'synchro-material'
  | 'destroyed-battle'
  | 'no-attack';

interface Props {
  type?: 'location' | 'status';
  location?: LocationType;
  owner?: 'user' | 'ai';
  status?: StatusType;
  size?: 'sm' | 'md' | 'lg' | number;
  pulsing?: boolean;
  showTooltip?: boolean;
  tooltipText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'location',
  location: 'field',
  owner: 'user',
  status: 'negated',
  size: 'md',
  pulsing: false,
  showTooltip: true,
  tooltipText: '',
});

const defaultLocationLabels: Record<LocationType, { user: string; ai: string }> = {
  hand: { user: "Player's Hand", ai: "Opponent's Hand" },
  field: { user: "Player's Field Zone", ai: "Opponent's Field Zone" },
  deck: { user: "Player's Main Deck", ai: "Opponent's Main Deck" },
  'extra-deck': { user: "Player's Extra Deck", ai: "Opponent's Extra Deck" },
  graveyard: { user: "Player's Graveyard", ai: "Opponent's Graveyard" },
  banished: { user: "Player's Banished Zone", ai: "Opponent's Banished Zone" },
};

const defaultStatusLabels: Record<StatusType, string> = {
  negated: 'Effect Negated',
  'no-special-summon': 'Cannot Be Special Summoned',
  'temp-banished': 'Temporarily Banished',
  'fusion-material': 'Used as Fusion Material',
  'synchro-material': 'Used as Synchro Material',
  'destroyed-battle': 'Destroyed by Battle',
  'no-attack': 'Cannot Attack',
};

const computedTooltipText = computed(() => {
  if (props.tooltipText) return props.tooltipText;
  if (props.type === 'location') {
    return defaultLocationLabels[props.location][props.owner];
  }
  return defaultStatusLabels[props.status];
});

const customSizeStyle = computed(() => {
  if (typeof props.size === 'number') {
    return {
      width: `${props.size}px`,
      height: `${props.size}px`,
    };
  }
  return {};
});
</script>
