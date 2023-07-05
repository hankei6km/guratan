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

const { GetFileIdError, validateQueryValue, getFileId, driveClient } =
  await import('../src/tdrive.js')

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

describe('getFileId()', () => {
  it('should return id of file', async () => {
    const list = jest
      .fn<(a: any) => Promise<any>>()
      .mockResolvedValue({ data: { files: [{ id: 'test-id' }] } })
    const drive: any = {
      files: {
        list
      }
    }

    expect(await getFileId(drive, 'parent-id', 'file-name')).toEqual('test-id')
    expect(list).toBeCalledWith({
      fields: 'files(id, name)',
      pageSize: 10,
      q: "'parent-id' in parents and name = 'file-name'",
      includeItemsFromAllDrives: false,
      supportsAllDrives: false
    })
  })

  it('should enable supportsAllDrives', async () => {
    const list = jest
      .fn<(a: any) => Promise<any>>()
      .mockResolvedValue({ data: { files: [{ id: 'test-id' }] } })
    const drive: any = {
      files: {
        list
      }
    }

    expect(await getFileId(drive, 'parent-id', 'file-name', true)).toEqual(
      'test-id'
    )
    expect(list).toBeCalledWith({
      fields: 'files(id, name)',
      pageSize: 10,
      q: "'parent-id' in parents and name = 'file-name'",
      includeItemsFromAllDrives: true,
      supportsAllDrives: true
    })
  })

  it('should not return id of file when not found', async () => {
    const list = jest
      .fn<(a: any) => Promise<any>>()
      .mockResolvedValue({ data: { files: [] } })
    const drive: any = {
      files: {
        list
      }
    }

    expect(await getFileId(drive, 'parent-id', 'file-name', false)).toEqual('')
    expect(list).toBeCalledWith({
      fields: 'files(id, name)',
      pageSize: 10,
      q: "'parent-id' in parents and name = 'file-name'",
      includeItemsFromAllDrives: false,
      supportsAllDrives: false
    })
  })

  it('should throw GetFileIdError', async () => {
    const list = jest
      .fn<(a: any) => Promise<any>>()
      .mockRejectedValue({ errors: 'err' })
    const drive: any = {
      files: {
        list
      }
    }

    const res = getFileId(drive, 'parent-id', 'file-name', false)
    await expect(res).rejects.toThrowError('err')
    await expect(res).rejects.toBeInstanceOf(GetFileIdError)
  })

  it('should throw GetFileIdError(parentId)', async () => {
    const list = jest
      .fn<(a: any) => Promise<any>>()
      .mockRejectedValue({ errors: 'err' })
    const drive: any = {
      files: {
        list
      }
    }

    const res = getFileId(drive, "parent'id", 'file-name', false)
    await expect(res).rejects.toThrowError("Invalid paretnt id : parent'id")
    await expect(res).rejects.toBeInstanceOf(GetFileIdError)
  })

  it('should throw GetFileIdError(fileName)', async () => {
    const list = jest
      .fn<(a: any) => Promise<any>>()
      .mockRejectedValue({ errors: 'err' })
    const drive: any = {
      files: {
        list
      }
    }

    const res = getFileId(drive, 'parent-id', "file'name", false)
    await expect(res).rejects.toThrowError("Invalid file name : file'name")
    await expect(res).rejects.toBeInstanceOf(GetFileIdError)
  })
})

describe('driveClient()', () => {
  it('should return drive_v3.Drive', () => {
    const d = driveClient()
    expect(d).toBeInstanceOf(drive_v3.Drive)
    expect(mockGoogleAuth).toBeCalledWith({
      scopes: ['https://www.googleapis.com/auth/drive']
    })
  })
})
