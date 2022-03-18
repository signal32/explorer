export function toRadians(degrees: number): number {
    return degrees * 0.017453292519943295;
}

export function toDegrees(radians: number): number {
    return radians * 57.29577951308232;
}

export function clamp(n: number, min: number, max: number): number {
    return Math.min(Math.max(n, min), max);
}
