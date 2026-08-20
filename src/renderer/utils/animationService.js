import { ref } from 'vue';
export const activeAnimations = ref([]);
let activeUserPlayerId = 0;
export function setAnimationUserPlayerId(id) {
    activeUserPlayerId = id;
}
export function getAnimationUserPlayerId() {
    return activeUserPlayerId;
}
export function toPlayerDomId(player) {
    if (player === 'user')
        return 'user';
    if (player === 'opponent' || player === 'ai')
        return 'ai';
    return player === activeUserPlayerId ? 'user' : 'ai';
}
/**
 * Resolves DOM bounding box for field zone slots.
 */
export function getZoneRect(player, zoneType, sequence = 0) {
    const pStr = toPlayerDomId(player);
    let zStr = 'monster';
    if (zoneType === 'spell-trap' || zoneType === 'szone' || zoneType === 8)
        zStr = 'spell-trap';
    else if (zoneType === 'field' || zoneType === 'fzone' || zoneType === 256)
        zStr = 'field';
    else if (zoneType === 'monster' || zoneType === 'mzone' || zoneType === 4)
        zStr = 'monster';
    const el = document.querySelector(`[data-zone-id="slot-${pStr}-${zStr}-${sequence}"]`);
    if (!el)
        return null;
    const r = el.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
}
/**
 * Resolves DOM bounding box for a card in hand.
 */
export function getHandCardRect(player, sequence = 0) {
    const pStr = toPlayerDomId(player);
    const el = document.querySelector(`[data-hand-card-id="hand-${pStr}-${sequence}"]`);
    if (!el)
        return getHandFanRect(pStr);
    const r = el.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
}
/**
 * Resolves DOM bounding box for the entire hand row.
 */
export function getHandFanRect(player) {
    const pStr = toPlayerDomId(player);
    const el = document.querySelector(`[data-hand-fan-id="hand-${pStr}-fan"]`);
    if (!el) {
        // Default fallback rect
        const w = window.innerWidth;
        const h = window.innerHeight;
        return pStr === 'user'
            ? { left: w / 2 - 100, top: h - 140, width: 90, height: 130 }
            : { left: w / 2 - 100, top: 20, width: 90, height: 130 };
    }
    const r = el.getBoundingClientRect();
    return { left: r.left + r.width / 2 - 45, top: r.top, width: 90, height: 130 };
}
/**
 * Resolves DOM bounding box for Deck, GY, Banished, and Extra Deck stacks.
 */
export function getStackRect(player, type) {
    const pStr = toPlayerDomId(player);
    let tStr = 'deck';
    if (type === 'graveyard' || type === 16)
        tStr = 'graveyard';
    else if (type === 'banished' || type === 32)
        tStr = 'banished';
    else if (type === 'extra' || type === 64)
        tStr = 'extra';
    else if (type === 'deck' || type === 1)
        tStr = 'deck';
    const el = document.querySelector(`[data-stack-id="stack-${pStr}-${tStr}"]`);
    if (!el)
        return null;
    const r = el.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
}
/**
 * Resolves DOM bounding box for player Life Points / avatar meter.
 */
export function getAvatarRect(player) {
    const pStr = toPlayerDomId(player);
    const el = document.querySelector(`.lp-meter--${pStr}`);
    if (!el)
        return null;
    const r = el.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
}
/**
 * Plays a spatial card flight / transition animation.
 * Returns a Promise that resolves when the flight and impact effects complete.
 */
export function playCardFlight(options) {
    return new Promise((resolve) => {
        const fromRect = options.fromRect || {
            left: window.innerWidth / 2 - 45,
            top: window.innerHeight / 2 - 65,
            width: 90,
            height: 130,
        };
        const toRect = options.toRect || fromRect;
        const durationMs = options.durationMs ?? 460;
        const animId = `flight-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const flyingCard = {
            id: animId,
            code: options.code,
            cardName: options.cardName || 'Card',
            fromRect,
            toRect,
            type: options.type,
            isFacedown: !!options.isFacedown,
            isDefense: !!options.isDefense,
            durationMs,
        };
        activeAnimations.value.push(flyingCard);
        setTimeout(() => {
            activeAnimations.value = activeAnimations.value.filter((a) => a.id !== animId);
            resolve();
        }, durationMs + 80);
    });
}
/**
 * Sequential Animation & Event Queue ensuring one animation completes
 * before the next action or engine step is executed.
 */
export class AnimationQueue {
    queue = [];
    isProcessing = false;
    async enqueue(task) {
        return new Promise((resolve, reject) => {
            this.queue.push(async () => {
                try {
                    await task();
                    resolve();
                }
                catch (err) {
                    reject(err);
                }
            });
            if (!this.isProcessing) {
                this.processNext();
            }
        });
    }
    async processNext() {
        if (this.queue.length === 0) {
            this.isProcessing = false;
            return;
        }
        this.isProcessing = true;
        const nextTask = this.queue.shift();
        if (nextTask) {
            try {
                await nextTask();
            }
            catch (err) {
                console.error('[AnimationQueue] Error in animation task:', err);
            }
        }
        this.processNext();
    }
    clear() {
        this.queue = [];
        this.isProcessing = false;
    }
}
export const duelAnimationQueue = new AnimationQueue();
