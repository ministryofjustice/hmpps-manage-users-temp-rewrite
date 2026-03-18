import { convertToTitleCase, initialiseName, isAlphaStringOrSpecialChars } from './utils'

describe('convert to title case', () => {
  it.each([
    [null, null, ''],
    ['empty string', '', ''],
    ['Lower case', 'robert', 'Robert'],
    ['Upper case', 'ROBERT', 'Robert'],
    ['Mixed case', 'RoBErT', 'Robert'],
    ['Multiple words', 'RobeRT SMiTH', 'Robert Smith'],
    ['Leading spaces', '  RobeRT', '  Robert'],
    ['Trailing spaces', 'RobeRT  ', 'Robert  '],
    ['Hyphenated', 'Robert-John SmiTH-jONes-WILSON', 'Robert-John Smith-Jones-Wilson'],
  ])('%s convertToTitleCase(%s, %s)', (_: string, a: string, expected: string) => {
    expect(convertToTitleCase(a)).toEqual(expected)
  })
})

describe('initialise name', () => {
  it.each([
    [null, null, null],
    ['Empty string', '', null],
    ['One word', 'robert', 'r. robert'],
    ['Two words', 'Robert James', 'R. James'],
    ['Three words', 'Robert James Smith', 'R. Smith'],
    ['Double barrelled', 'Robert-John Smith-Jones-Wilson', 'R. Smith-Jones-Wilson'],
  ])('%s initialiseName(%s, %s)', (_: string, a: string, expected: string) => {
    expect(initialiseName(a)).toEqual(expected)
  })
})

describe('isAlphaStringOrSpecialChars', () => {
  test.each([
    ['John', true],
    ["O'Connor", true],
    ['Jean-Paul', true],
    ['Anne-Marie', true],
    ['D’Angelo', true],
    ['O’Brien', true],
    ['Alpha-Beta', true],
  ])('returns %s -> %s for valid/invalid input', (input, expected) => {
    const result = isAlphaStringOrSpecialChars(input)
    expect(result).toBe(expected)
  })

  test.each([
    ['John123', false],
    ['123', false],
    ['John!', false],
    ['John_Doe', false],
    ['John Doe', false],
    ['', false],
  ])('rejects invalid values %s -> %s', (input, expected) => {
    const result = isAlphaStringOrSpecialChars(input)
    expect(result).toBe(expected)
  })
})
