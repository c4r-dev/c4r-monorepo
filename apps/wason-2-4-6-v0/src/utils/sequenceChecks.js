// functions to confirm if sequences of 3 numbers follow a rule
export function isIncreasingByOne(a, b, c) {
    return b === a + 1 && c === b + 1;
}
export function isDecreasingByOne(a, b, c) {
    return b === a - 1 && c === b - 1;
}
export function isIncreasingByTwo(a, b, c) {
    window.c4rLogger ? window.c4rLogger.info('app_log', "checking if increasing by 2");
    window.c4rLogger ? window.c4rLogger.info('app_log', 
        "numbers(post type conversation): " +
        a +
        ", " +
        b +
        ", " +
        c
    );

    let isTrue = b === a + 2 && c === b + 2;
    window.c4rLogger ? window.c4rLogger.info('app_log', "is true: " + isTrue);
    return isTrue;
    // return b === a + 2 && c === b + 2;
}
export function isDecreasingByTwo(a, b, c) {
    return b === a - 2 && c === b - 2;
}
export function isFibonacci(a, b, c) {
    return a + b === c;
}
export function isIncreasing(a, b, c) {
    return b > a && c > b;
}
export function isDecreasing(a, b, c) {
    return b < a && c < b;
}
export function areAllNumbersPositive(num1, num2, num3) {
    return num1 > 0 && num2 > 0 && num3 > 0;
}
export function areAllNumbersNegative(num1, num2, num3) {
    return num1 < 0 && num2 < 0 && num3 < 0;
}
export function any3Numbers(num1, num2, num3) {
    return true;
}
export function isPrime(num) {
    for (var i = 2; i < num; i++) if (num % i === 0) return false;
    return num > 1;
}
export function areAllNumbersPrime(num1, num2, num3) {
    return isPrime(num1) && isPrime(num2) && isPrime(num3);
}
export function sqareOfPrevious(num1, num2, num3) {
    return num1 * num1 === num2 && num2 * num2 === num3;
}
 : console.$1(