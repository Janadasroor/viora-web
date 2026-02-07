import { useMemo } from "react";

export function toBigInt(count: string | number | undefined | null): bigint {
    try {
        if (count === undefined || count === null) return BigInt(0);
        return BigInt(count);
    } catch {
        return BigInt(0);
    }
}

export function useBigCount(count: string | number | undefined | null) {
    return useMemo(() => toBigInt(count), [count]);
}
