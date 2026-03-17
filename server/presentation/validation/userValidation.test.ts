import { validateEmail, validateUsername } from './userValidation'
import { FormError } from '../../interfaces/formError'

describe('validateEmail', () => {
  it('returns error when email is missing', () => {
    const result = validateEmail('')
    expect(result).toEqual<FormError[]>([{ href: '#email', text: 'Enter an email address' }])
  })

  it('returns error for invalid email format', () => {
    const result = validateEmail('invalid-email')
    expect(result).toEqual<FormError[]>([
      {
        href: '#email',
        text: 'Enter an email address in the correct format, like first.last@justice.gov.uk',
      },
    ])
  })

  it('returns error for invalid characters', () => {
    const result = validateEmail('bad!email@example.com')
    expect(result).toContainEqual<FormError>({
      href: '#email',
      text: "Email address can only contain 0-9, a-z, @, ', _, ., - and + characters",
    })
  })

  it('returns error for too-long email', () => {
    const longEmail = `${'a'.repeat(241)}@example.com`
    const result = validateEmail(longEmail)
    expect(result).toContainEqual<FormError>({
      href: '#email',
      text: 'Email address must be 240 characters or less',
    })
  })

  it('returns no errors for valid email', () => {
    const result = validateEmail('first.last@justice.gov.uk')
    expect(result).toEqual([])
  })
})

describe('validateUsername', () => {
  it('returns error when username is missing', () => {
    const result = validateUsername('')
    expect(result).toEqual<FormError[]>([{ href: '#username', text: 'Enter a username' }])
  })

  it('returns error when username is too short', () => {
    const result = validateUsername('a')
    expect(result).toEqual<FormError[]>([{ href: '#username', text: 'Username must be 2 characters or more' }])
  })

  it('returns error when username is too long', () => {
    const longUsername = 'a'.repeat(31)
    const result = validateUsername(longUsername)
    expect(result).toEqual<FormError[]>([{ href: '#username', text: 'Username must be 30 characters or less' }])
  })

  it('returns no errors for valid username', () => {
    const result = validateUsername('validUser')
    expect(result).toEqual([])
  })

  it('supports custom fieldName and messages', () => {
    const result = validateUsername('', 'staffId', 'a staff ID', 'Staff ID')
    expect(result).toEqual<FormError[]>([{ href: '#staffId', text: 'Enter a staff ID' }])
  })
})
