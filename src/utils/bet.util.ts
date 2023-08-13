export const amountToWin = (amount: number, combination: string, rambled: boolean): number => {
    if (combination.length !== 3) {
        throw new Error("Combination should have exactly 3 digits.");
    }

    if (rambled) {
        const uniqueDigits = new Set([...combination]);
        if (uniqueDigits.size === 1) {
            // All digits are the same
            return amount * 450;
        } else if (uniqueDigits.size === 3) {
            // All digits are unique
            return Math.floor((amount / 6) * 650);
        } else {
            // Some digits are repeated (double)
            return Math.floor((amount / 3) * 650);
        }
    } else {
        if (
            combination[0] === combination[1] &&
            combination[1] === combination[2]
            ) {
            // All digits are the same
            return amount * 450;
        } else {
            // All digits are not the same (not tripled)
            return amount * 650;
        }
    }
};