export function formatIPLAmount(amountTK: number): string {
  if (amountTK === undefined || amountTK === null) return '৳0';
  return `৳${amountTK.toLocaleString('en-US')}`;
}

export function formatIPLAmountFull(amountTK: number): string {
  if (amountTK === undefined || amountTK === null) return '৳0';
  return `৳${amountTK.toLocaleString('en-US')}`;
}

/**
 * Standard bid increment: minimum 10 TK, or 20 TK / 50 TK
 */
export function getStandardIncrement(currentBidTK: number): number {
  if (currentBidTK < 100) {
    return 10;
  } else if (currentBidTK < 300) {
    return 20;
  } else if (currentBidTK < 600) {
    return 50;
  } else {
    return 100;
  }
}

export function getAvailableIncrements(currentBidTK: number): number[] {
  if (currentBidTK < 100) {
    return [10, 20, 50];
  } else if (currentBidTK < 300) {
    return [10, 20, 50, 100];
  } else {
    return [10, 50, 100, 200];
  }
}

export const MIN_SQUAD_SIZE = 8;
export const MAX_SQUAD_SIZE = 12;
export const MIN_PLAYER_BASE_PRICE = 10;

/**
 * Calculates the maximum permissible bid a team can make.
 * Rule: If a team has fewer than minSquad (8) players, they must reserve enough
 * budget so they can acquire the remaining players at minimum base price (10 TK).
 */
export function getMaxPermissibleBid(
  purse: number,
  currentSquadCount: number,
  minSquad: number = MIN_SQUAD_SIZE,
  minBasePrice: number = MIN_PLAYER_BASE_PRICE
): number {
  // If team has fewer players than minSquad, after winning this player at bidAmount,
  // they will have (currentSquadCount + 1) players.
  // The remaining required slots to reach minSquad is Math.max(0, minSquad - (currentSquadCount + 1)).
  const remainingSlotsToMin = Math.max(0, minSquad - (currentSquadCount + 1));
  const reservedBudget = remainingSlotsToMin * minBasePrice;
  return Math.max(0, purse - reservedBudget);
}

/**
 * Validates if a team can bid under JPL Rules:
 * 1. Maximum squad size: 12 players
 * 2. Minimum squad size: 8 players (reserve purse required)
 * 3. Purse availability
 */
export function canTeamBid(
  team: { purse: number; squad: unknown[]; minSquad?: number; maxSquad?: number },
  bidAmountTK: number,
  minBasePrice: number = MIN_PLAYER_BASE_PRICE
): { canBid: boolean; reason?: string; maxPermissible?: number } {
  const maxSquad = team.maxSquad || MAX_SQUAD_SIZE;
  const minSquad = team.minSquad || MIN_SQUAD_SIZE;
  const currentCount = team.squad?.length || 0;

  // Check 1: Maximum squad reached
  if (currentCount >= maxSquad) {
    return {
      canBid: false,
      reason: `সর্বোচ্চ স্কোয়াড কোটা পূরণ হয়েছে (${maxSquad}/${maxSquad} জন পূর্ণ)`
    };
  }

  // Check 2: Basic purse check
  if (team.purse < bidAmountTK) {
    return {
      canBid: false,
      reason: `অপর্যাপ্ত বাজেট (বাকি আছে ${formatIPLAmount(team.purse)})`
    };
  }

  // Check 3: Minimum 8-player squad reserve budget rule
  const maxPermissible = getMaxPermissibleBid(team.purse, currentCount, minSquad, minBasePrice);
  if (bidAmountTK > maxPermissible) {
    const slotsNeeded = Math.max(0, minSquad - (currentCount + 1));
    return {
      canBid: false,
      maxPermissible,
      reason: `ন্যূনতম ${minSquad} জন খেলোয়াড় সম্পূর্ণ করার জন্য বাকি ${slotsNeeded} জনের বাজেট রিজার্ভ রাখতে হবে (সর্বোচ্চ অনুমোদিত বিড: ${formatIPLAmount(maxPermissible)})`
    };
  }

  return { canBid: true, maxPermissible };
}

/**
 * Web Audio Synthesizer for high-impact gavel, bid, and sold sounds
 */
class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playGavel() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.18);
    
    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(t);
    osc.stop(t + 0.25);

    const snapOsc = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snapOsc.type = 'sawtooth';
    snapOsc.frequency.setValueAtTime(600, t);
    snapOsc.frequency.exponentialRampToValueAtTime(80, t + 0.08);
    snapGain.gain.setValueAtTime(0.4, t);
    snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    snapOsc.connect(snapGain);
    snapGain.connect(this.ctx.destination);
    snapOsc.start(t);
    snapOsc.stop(t + 0.1);
  }

  playBidChime() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, t);
    osc.frequency.setValueAtTime(880, t + 0.07);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.45);
  }

  playSoldFanfare() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const t = this.ctx!.currentTime + idx * 0.08;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t);
      osc.stop(t + 0.7);
    });
  }

  playUnsold() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.linearRampToValueAtTime(140, t + 0.4);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.5);
  }

  playTick() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, t);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.06);
  }
}

export const sounds = new SoundManager();
