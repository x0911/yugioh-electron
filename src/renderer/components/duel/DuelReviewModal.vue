<template>
  <div v-if="isOpen" class="modal-backdrop" @click.self="emit('close')">
    <div class="modal-card glass-panel animate-fade-in">
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="header-badge">
          <span class="badge-icon">🧠</span>
          <span class="badge-title">AI TACTICAL POST-MATCH REVIEW</span>
        </div>
        <button type="button" class="close-btn" @click="emit('close')">✕</button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="review-loading">
        <div class="spinner"></div>
        <p class="loading-text">Analyzing turn decisions, combat clashes & resource efficiency...</p>
      </div>

      <!-- Review Content -->
      <div v-else-if="review" class="review-content">
        <!-- Top Score Banner -->
        <div class="score-banner" :class="`score-banner--${review.tacticalGrade.toLowerCase().replace('+', '-plus')}`">
          <div class="grade-badge">
            <span class="grade-letter">{{ review.tacticalGrade }}</span>
            <span class="grade-score">{{ review.gradeScore }} / 100</span>
          </div>
          <div class="grade-summary">
            <h3 class="grade-headline">
              {{ getGradeHeadline(review.tacticalGrade) }}
            </h3>
            <p class="grade-desc">{{ review.summary }}</p>
          </div>
        </div>

        <!-- Coach Commentary Box -->
        <div class="coach-box">
          <div class="coach-box__header">
            <span class="coach-icon">🎙️</span>
            <span class="coach-title">Grandmaster Duel Coach Retrospective</span>
          </div>
          <p class="coach-text">"{{ review.coachCommentary }}"</p>
        </div>

        <!-- Two Columns: Blunders vs Best Moves -->
        <div class="review-grid">
          <!-- Detected Blunders Section -->
          <div class="review-col">
            <div class="col-header col-header--blunders">
              <span class="col-icon">🚨</span>
              <span class="col-title">Detected Tactical Mistakes ({{ review.blunders.length }})</span>
            </div>
            <div v-if="review.blunders.length === 0" class="col-empty">
              <span>✨ No critical tactical blunders detected! Flawless decision-making.</span>
            </div>
            <div v-else class="blunder-list">
              <div
                v-for="(blunder, bIdx) in review.blunders"
                :key="`blunder-${bIdx}`"
                class="blunder-item"
              >
                <div class="blunder-top">
                  <span class="blunder-tag">{{ blunder.type.replace(/_/g, ' ') }}</span>
                  <span class="blunder-turn">Turn {{ blunder.turn }}</span>
                </div>
                <p class="blunder-desc">{{ blunder.description }}</p>
                <div class="blunder-remedy">
                  <span class="remedy-label">💡 Self-Correction:</span>
                  <span class="remedy-text">{{ blunder.remedy }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Best Moves & Learned Lessons Section -->
          <div class="review-col">
            <div class="col-header col-header--lessons">
              <span class="col-icon">📖</span>
              <span class="col-title">Active AI Memory & Learned Rules</span>
            </div>
            <div class="lessons-list">
              <div
                v-for="(lesson, lIdx) in review.learnedLessons"
                :key="`lesson-${lIdx}`"
                class="lesson-item"
              >
                <span class="lesson-check">✓</span>
                <span class="lesson-text">{{ lesson }}</span>
              </div>
            </div>

            <!-- Best Moves Sub-section -->
            <div v-if="review.bestMoves.length > 0" class="best-moves-block">
              <div class="sub-header">
                <span>⭐ Key High-Impact Plays</span>
              </div>
              <ul class="moves-list">
                <li v-for="(move, mIdx) in review.bestMoves" :key="`move-${mIdx}`">
                  {{ move }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty / Error State -->
      <div v-else class="review-empty">
        <span class="empty-icon">⚠️</span>
        <h4 class="empty-title">Tactical Review Unavailable</h4>
        <p class="empty-text">No match diagnostic data or events found for retrospective tactical analysis.</p>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <button type="button" class="btn btn--secondary" @click="emit('close')">
          Close Review
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  isOpen: boolean;
  loading?: boolean;
  review?: any;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

function getGradeHeadline(grade: string): string {
  switch (grade) {
    case 'A+':
    case 'A':
      return 'Masterclass Duel Execution';
    case 'B':
      return 'Solid Match with Minor Inefficiencies';
    case 'C':
      return 'Inconsistent Decision-Making';
    case 'D':
      return 'High Resource Waste & Tactical Errors';
    case 'F':
      return 'Critical Strategic Failure & Blunders';
    default:
      return 'Tactical Evaluation';
  }
}
</script>

<style scoped lang="scss">
@use '../../assets/styles/abstracts' as *;

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(4, 6, 10, 0.85);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  box-sizing: border-box;
}

.modal-card {
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  background: rgba(14, 18, 26, 0.95);
  border: 1px solid rgba(201, 162, 39, 0.4);
  border-radius: 12px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.9), 0 0 30px rgba(201, 162, 39, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(10, 12, 18, 0.8);

  .header-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'Oxanium', monospace, sans-serif;
    font-weight: 700;
    color: $color-gold-300;
    letter-spacing: 0.05em;
    font-size: 0.9rem;
  }

  .close-btn {
    background: transparent;
    border: none;
    color: #a0aec0;
    font-size: 1.2rem;
    cursor: pointer;
    &:hover {
      color: #fff;
    }
  }
}

.review-loading {
  padding: 60px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(201, 162, 39, 0.2);
    border-top-color: $color-gold-300;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .loading-text {
    font-family: 'Barlow Semi Condensed', sans-serif;
    color: #cbd5e0;
    font-size: 1rem;
  }
}

.review-content {
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.score-banner {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px 20px;
  border-radius: 8px;
  background: rgba(20, 26, 38, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);

  .grade-badge {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 80px;
    padding: 8px 12px;
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.6);
    border: 2px solid $color-gold-500;

    .grade-letter {
      font-family: 'Oxanium', monospace, sans-serif;
      font-size: 2.2rem;
      font-weight: 900;
      color: $color-gold-300;
      line-height: 1;
    }

    .grade-score {
      font-family: 'Oxanium', monospace, sans-serif;
      font-size: 0.75rem;
      color: #a0aec0;
      margin-top: 4px;
    }
  }

  .grade-headline {
    font-family: 'Oxanium', monospace, sans-serif;
    font-size: 1.15rem;
    color: #fff;
    margin: 0 0 4px 0;
  }

  .grade-desc {
    font-family: 'Barlow Semi Condensed', sans-serif;
    font-size: 0.9rem;
    color: #a0aec0;
    margin: 0;
  }

  &--f, &--d {
    border-color: rgba(235, 87, 87, 0.4);
    .grade-badge {
      border-color: #eb5757;
      .grade-letter { color: #eb5757; }
    }
  }
}

.coach-box {
  background: rgba(201, 162, 39, 0.08);
  border: 1px solid rgba(201, 162, 39, 0.3);
  border-radius: 8px;
  padding: 14px 18px;

  &__header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
    font-family: 'Oxanium', monospace, sans-serif;
    font-size: 0.8rem;
    font-weight: 700;
    color: $color-gold-300;
  }

  .coach-text {
    font-family: 'Barlow Semi Condensed', sans-serif;
    font-style: italic;
    font-size: 0.95rem;
    color: #f7fafc;
    line-height: 1.4;
    margin: 0;
  }
}

.review-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.review-col {
  background: rgba(10, 14, 20, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  .col-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'Oxanium', monospace, sans-serif;
    font-size: 0.85rem;
    font-weight: 700;
    color: #fff;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .col-empty {
    font-family: 'Barlow Semi Condensed', sans-serif;
    font-size: 0.85rem;
    color: #68d391;
    padding: 12px;
    text-align: center;
  }
}

.blunder-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.blunder-item {
  background: rgba(235, 87, 87, 0.08);
  border: 1px solid rgba(235, 87, 87, 0.25);
  border-radius: 6px;
  padding: 10px 12px;

  .blunder-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;

    .blunder-tag {
      font-family: 'Oxanium', monospace, sans-serif;
      font-size: 0.7rem;
      font-weight: 800;
      color: #feb2b2;
      letter-spacing: 0.05em;
    }

    .blunder-turn {
      font-family: 'Oxanium', monospace, sans-serif;
      font-size: 0.7rem;
      color: #a0aec0;
    }
  }

  .blunder-desc {
    font-family: 'Barlow Semi Condensed', sans-serif;
    font-size: 0.85rem;
    color: #e2e8f0;
    margin: 0 0 6px 0;
    line-height: 1.3;
  }

  .blunder-remedy {
    font-family: 'Barlow Semi Condensed', sans-serif;
    font-size: 0.8rem;
    color: $color-gold-300;
    display: flex;
    gap: 4px;
    line-height: 1.25;
  }
}

.lessons-list {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .lesson-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-family: 'Barlow Semi Condensed', sans-serif;
    font-size: 0.85rem;
    color: #cbd5e0;
    line-height: 1.3;

    .lesson-check {
      color: #48bb78;
      font-weight: 900;
    }
  }
}

.best-moves-block {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);

  .sub-header {
    font-family: 'Oxanium', monospace, sans-serif;
    font-size: 0.75rem;
    font-weight: 700;
    color: $color-gold-300;
    margin-bottom: 6px;
  }

  .moves-list {
    margin: 0;
    padding-left: 16px;
    font-family: 'Barlow Semi Condensed', sans-serif;
    font-size: 0.8rem;
    color: #a0aec0;
    line-height: 1.35;
  }
}

.review-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;

  .empty-icon {
    font-size: 2.5rem;
    margin-bottom: 12px;
  }

  .empty-title {
    margin: 0 0 8px 0;
    font-family: 'Oxanium', monospace, sans-serif;
    font-size: 1.1rem;
    font-weight: 700;
    color: #f6ad55;
  }

  .empty-text {
    margin: 0;
    font-family: 'Barlow Semi Condensed', sans-serif;
    font-size: 0.9rem;
    color: #a0aec0;
    max-width: 400px;
  }
}

.modal-footer {
  padding: 12px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: flex-end;

  .btn {
    padding: 8px 18px;
    border-radius: 6px;
    font-family: 'Oxanium', monospace, sans-serif;
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
    border: none;

    &--secondary {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
      &:hover {
        background: rgba(255, 255, 255, 0.2);
      }
    }
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
