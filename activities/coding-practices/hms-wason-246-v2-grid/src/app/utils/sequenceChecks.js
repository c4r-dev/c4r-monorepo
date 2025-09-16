// functions to confirm if sequences of 3 numbers follow a rule
export function isIncreasingByOne(a, b, c) {
    return b === a + 1 && c === b + 1;
}
export function isDecreasingByOne(a, b, c) {
    return b === a - 1 && c === b - 1;
}
export function isIncreasingByTwo(a, b, c) {
    return b === a + 2 && c === b + 2;
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
export function any3DifferentNumbers(num1, num2, num3) {
    return num1 !== num2 && num2 !== num3 && num1 !== num3;
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

export function isArithmeticSequence(num1, num2, num3) {
    return num2 - num1 === num3 - num2;
}

export function isSumDivisibleBy2(num1, num2, num3) {
    return (num1 + num2 + num3) % 2 === 0;
}
export function isSumDivisibleBy3(num1, num2, num3) {
    return (num1 + num2 + num3) % 3 === 0;
}

export function isLastNumberSumOfFirstTwo(num1, num2, num3) {
    return (num1 + num2) === num3;
}

export function isLastNumberGreaterOrEqualToSum(num1, num2, num3) {
    return (num1 + num2) <= num3;
}

export function areAllNumbersEven(num1, num2, num3) {
    return num1 % 2 === 0 && num2 % 2 === 0 && num3 % 2 === 0;
}

export function hasAtLeastOneEvenNumber(num1, num2, num3) {
    return num1 % 2 === 0 || num2 % 2 === 0 || num3 % 2 === 0;
}

export function isFirstDigit2(num1, num2, num3) {
    return num1.toString()[0] === '2';
}

/* 
Additional functions to add

- total sum is divisible by 2
    - return (num1 + num2 + num3) % 2 === 0
- total sum is divisible by 3
    - return (num1 + num2 + num3) % 3 === 0
- last number is equal to the sum of the first two
    - return (num1 + num2) === num3
- last number is greater than or equal to the sum of the first two
    - return (num1 + num2) <= num3
- all even numbers
    - return num1 % 2 && num2 % 2 && num3 % 2
- at least one even number
    - return num1 % 2 || num2 % 2 || num3 % 2

- The first digit is 2
    - (JS implementation)
*/