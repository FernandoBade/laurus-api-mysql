import { TransactionSource, TransactionType } from '../../../shared/enums/transaction.enums';
import type { MonetaryString } from '../../../shared/types/format.types';

/**
 * Normalizes a monetary input into an unsigned decimal string.
 *
 * @summary Converts monetary input to canonical unsigned string format.
 * @param value - Monetary input value.
 * @returns Unsigned monetary string.
 */
export function toUnsignedMonetary(value: string | number | null | undefined): MonetaryString {
    if (value === null || value === undefined) {
        return '0.00';
    }

    const trimmed = String(value).trim();
    if (!trimmed.length) {
        return '0.00';
    }

    let unsigned = trimmed;
    if (unsigned.startsWith('+') || unsigned.startsWith('-')) {
        unsigned = unsigned.slice(1);
    }

    if (!/^\d+(\.\d{1,2})?$/.test(unsigned)) {
        throw new Error('BalanceInvariantViolation: invalid monetary amount.');
    }

    return unsigned as MonetaryString;
}

/**
 * Builds the signed balance delta for a transaction operation.
 *
 * @summary Maps transaction type/source to signed monetary delta.
 * @param transactionType - Transaction type.
 * @param transactionSource - Transaction source.
 * @param value - Monetary value.
 * @returns Signed monetary delta string.
 */
export function getSignedTransactionDelta(
    transactionType: TransactionType,
    transactionSource: TransactionSource,
    value: string | number
): MonetaryString {
    const amount = toUnsignedMonetary(value);
    const shouldIncrease = transactionSource === TransactionSource.ACCOUNT
        ? transactionType === TransactionType.INCOME
        : transactionType === TransactionType.EXPENSE;

    return shouldIncrease ? amount : (`-${amount}` as MonetaryString);
}

/**
 * Inverts a signed monetary delta.
 *
 * @summary Reverses the sign of a monetary delta string.
 * @param delta - Monetary delta.
 * @returns Inverted delta.
 */
export function invertMonetaryDelta(delta: MonetaryString): MonetaryString {
    if (delta.startsWith('-')) {
        return delta.slice(1) as MonetaryString;
    }
    return `-${delta}` as MonetaryString;
}

/**
 * Checks whether a monetary delta is zero.
 *
 * @summary Detects zero-value monetary deltas.
 * @param delta - Monetary delta.
 * @returns True when the delta represents zero.
 */
export function isZeroMonetaryDelta(delta: MonetaryString): boolean {
    const unsigned = delta.startsWith('-') ? delta.slice(1) : delta;
    const [integerPart, decimalPart = ''] = unsigned.split('.');
    const normalizedInt = integerPart.replace(/^0+/, '');
    const normalizedDecimals = decimalPart.replace(/0/g, '');
    return normalizedInt.length === 0 && normalizedDecimals.length === 0;
}
