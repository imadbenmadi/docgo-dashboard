export const formatMoneyDZD = (value) => {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return "DZD 0.00";

    try {
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: "DZD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    } catch {
        return `DZD ${amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    }
};
