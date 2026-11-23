import test from 'node:test';
import assert from 'node:assert/strict';
import { isCorrectPlacement } from '../src/rules';
test('first record always fits an empty timeline', () => assert.equal(isCorrectPlacement([], 1980, 0), true));
test('insert before, between and after', () => {
    assert.equal(isCorrectPlacement([1980, 2000], 1970, 0), true);
    assert.equal(isCorrectPlacement([1980, 2000], 1990, 1), true);
    assert.equal(isCorrectPlacement([1980, 2000], 2010, 2), true);
});
test('wrong order rejected', () => assert.equal(isCorrectPlacement([1980, 2000], 2010, 1), false));
test('equal years allowed on either side', () => {
    assert.equal(isCorrectPlacement([1980], 1980, 0), true);
    assert.equal(isCorrectPlacement([1980], 1980, 1), true);
});
test('invalid slots rejected', () => {
    for (const slot of [-1, 2, 0.5]) assert.equal(isCorrectPlacement([1980], 1990, slot), false);
});
