/**
 * KarnArchery - Game State Machine
 * Centralizes the active application state, navigation transitions, and subscriptions.
 */

export const STATES = {
  HOME: 'HOME',
  CHAPTERS: 'CHAPTERS',
  LEVELS: 'LEVELS',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  RESULT: 'RESULT',
  TRAINING: 'TRAINING'
};

class GameStateManager {
  constructor() {
    this.current = STATES.HOME;
    this.previous = STATES.HOME;
    this.selectedChapterId = 1;
    this.currentLevelId = 1;
    this.currentLevelConfig = null;
    this.isTrainingMode = false;
    this.listeners = [];
  }

  setState(newState, payload = {}) {
    if (this.current === newState && newState !== STATES.LEVELS && newState !== STATES.PLAYING) return;
    
    this.previous = this.current;
    this.current = newState;

    if (payload.chapterId !== undefined) {
      this.selectedChapterId = payload.chapterId;
    }
    if (payload.levelId !== undefined) {
      this.currentLevelId = payload.levelId;
    }
    if (payload.levelConfig !== undefined) {
      this.currentLevelConfig = payload.levelConfig;
    }
    if (payload.isTrainingMode !== undefined) {
      this.isTrainingMode = payload.isTrainingMode;
    }

    this.notify(newState, this.previous, payload);
  }

  onChange(callback) {
    if (typeof callback === 'function') {
      this.listeners.push(callback);
    }
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify(newState, oldState, payload) {
    this.listeners.forEach(cb => {
      try {
        cb(newState, oldState, payload);
      } catch (err) {
        console.error('Error in gameState listener:', err);
      }
    });
  }

  isPlaying() {
    return this.current === STATES.PLAYING;
  }

  isPaused() {
    return this.current === STATES.PAUSED;
  }
}

export const gameState = new GameStateManager();

