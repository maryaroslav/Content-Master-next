export const formatMembersCount = (count: number) => {
    if (count >= 1_000_000) {
        return `${(count / 1_000_000).toFixed(count % 1_000_000 === 0 ? 0 : 1)}kk`;
    }
    if (count >= 1_000) {
        return `${(count / 1_000).toFixed(count % 1_000 === 0 ? 0 : 1)}k`;
    }
    return count;
};