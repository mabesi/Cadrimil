// Generates identifiers that remain unique even when several items are
// created within the same millisecond.
export function createId(): string {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
