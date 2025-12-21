import { createMotionPolicy, motionDurationMs } from '../src/app/motionPolicy';

test('motionPolicy: duration is zero when Reduce Motion is enabled', () => {
  const policy = createMotionPolicy(true);
  expect(policy.durationMs(300)).toBe(0);
  expect(motionDurationMs(true, 300)).toBe(0);
});

test('motionPolicy: duration preserves normal timing when Reduce Motion is disabled', () => {
  const policy = createMotionPolicy(false);
  expect(policy.durationMs(300)).toBe(300);
  expect(motionDurationMs(false, 300)).toBe(300);
});

test('motionPolicy: durations are clamped to >= 0', () => {
  const policy = createMotionPolicy(false);
  expect(policy.durationMs(-10)).toBe(0);
  expect(motionDurationMs(false, -10)).toBe(0);
});
