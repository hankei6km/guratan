import { drive_v3 } from '@googleapis/drive'
import { jest } from '@jest/globals'

jest.unstable_mockModule('google-auth-library', async () => {
  const mockGoogleAuth = jest.fn()
  const reset = () => {
    mockGoogleAuth.mockReset().mockImplementation(() => {})
  }

  reset()
  return {
    GoogleAuth: mockGoogleAuth,
    _reset: reset,
    _getMocks: () => ({
      mockGoogleAuth
    })
  }
})

const mockGoogleAuthLibrary = await import('google-auth-library')
const { mockGoogleAuth } = (mockGoogleAuthLibrary as any)._getMocks()

const { validateQueryValue, driveClient } = await import('../src/tdrive.js')

afterEach(() => {
  ;(mockGoogleAuthLibrary as any)._reset()
})

describe('validateQueryValue()', () => {
  it('should return true', () => {
    expect(validateQueryValue('123abc')).toBeTruthy()
  })
  it('should return false', () => {
    expect(validateQueryValue("123'abc")).toBeFalsy()
  })
})

describe('driveClient()', () => {
  it('should return drive_v3.Drive', () => {
    const d = driveClient()
    expect(d).toBeInstanceOf(drive_v3.Drive)
    expect(mockGoogleAuth).toBeCalledWith({
      scopes: ['https://www.googleapis.com/auth/drive.file']
    })
  })
})
