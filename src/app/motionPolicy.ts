export type MotionPolicy = {
  reduceMotionEnabled: boolean;
  durationMs: (normalDurationMs: number) => number;
};

export function createMotionPolicy(reduceMotionEnabled: boolean): MotionPolicy {
  return {
    reduceMotionEnabled,
    durationMs: (normalDurationMs: number) => {
      const safe = Math.max(0, normalDurationMs);
      return reduceMotionEnabled ? 0 : safe;
    },
  };
}

export function motionDurationMs(reduceMotionEnabled: boolean, normalDurationMs: number): number {
  const safe = Math.max(0, normalDurationMs);
  return reduceMotionEnabled ? 0 : safe;
}
