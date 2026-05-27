import { devLog } from '../../config/devLog';

const marks = new Map<string, number>();

export function startupMark(name: string): void {
  marks.set(name, Date.now());
}

export function startupMeasure(
  name: string,
  from: string,
  to?: string
): number | null {
  const start = marks.get(from);
  const end = to ? marks.get(to) : Date.now();
  if (typeof start !== 'number' || typeof end !== 'number') {
    return null;
  }
  const duration = end - start;
  devLog('Startup', `${name}: ${duration}ms`);
  return duration;
}
