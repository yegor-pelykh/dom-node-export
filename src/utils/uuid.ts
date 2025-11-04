let counter = 0;
const rand = () =>
    `0000${((Math.random() * 36 ** 4) << 0).toString(36)}`.slice(-4);

/**
 * Generates a unique identifier.
 */
export function uuid(): string {
    counter += 1;
    return `u${rand()}${counter}`;
}