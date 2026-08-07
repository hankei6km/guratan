import { describe, it, afterEach, mock } from 'node:test'
import assert from 'node:assert/strict'

import { drive_v3 } from '@googleapis/drive'

const mockGoogleAuthExports = (() => {
  const mockGoogleAuth = mock.fn()
  const reset = () => {
    mockGoogleAuth.mock.resetCalls()
    mockGoogleAuth.mock.mockImplementation(function () {})
  }

  reset()
  return {
    exports: {
      GoogleAuth: mockGoogleAuth
    },
    _reset: reset,
    _getMocks: () => ({
      mockGoogleAuth
    })
  }
})()
mock.module('google-auth-library', { exports: mockGoogleAuthExports.exports })

//const mockGoogleAuthLibrary = await import('google-auth-library')
const { mockGoogleAuth } = mockGoogleAuthExports._getMocks()

const { GetFileIdError, validateQueryValue, getFileId, driveClient } =
  await import('../src/tdrive.ts')

afterEach(() => {
  mockGoogleAuthExports._reset()
})

describe('validateQueryValue()', () => {
  it('should return true', () => {
    assert.strictEqual(validateQueryValue('123abc'), true)
  })
  it('should return false', () => {
    assert.strictEqual(validateQueryValue("123'abc"), false)
  })
})
describe('getFileId()', () => {
  it('should return id of file', async () => {
    const list = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { files: [{ id: 'test-id' }] } })
    )
    const drive: any = {
      files: {
        list
      }
    }

    assert.strictEqual(
      await getFileId(drive, 'parent-id', 'file-name'),
      'test-id'
    )
    assert.deepStrictEqual(list.mock.calls[0].arguments[0], {
      fields: 'files(id, name)',
      pageSize: 10,
      q: "'parent-id' in parents and name = 'file-name'",
      includeItemsFromAllDrives: false,
      supportsAllDrives: false
    })
  })

  it('should enable supportsAllDrives', async () => {
    const list = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { files: [{ id: 'test-id' }] } })
    )
    const drive: any = {
      files: {
        list
      }
    }

    assert.strictEqual(
      await getFileId(drive, 'parent-id', 'file-name', true),
      'test-id'
    )
    assert.deepStrictEqual(list.mock.calls[0].arguments[0], {
      fields: 'files(id, name)',
      pageSize: 10,
      q: "'parent-id' in parents and name = 'file-name'",
      includeItemsFromAllDrives: true,
      supportsAllDrives: true
    })
  })

  it('should not return id of file when not found', async () => {
    const list = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { files: [] } })
    )
    const drive: any = {
      files: {
        list
      }
    }

    assert.strictEqual(
      await getFileId(drive, 'parent-id', 'file-name', false),
      ''
    )
    assert.deepStrictEqual(list.mock.calls[0].arguments[0], {
      fields: 'files(id, name)',
      pageSize: 10,
      q: "'parent-id' in parents and name = 'file-name'",
      includeItemsFromAllDrives: false,
      supportsAllDrives: false
    })
  })

  it('should throw GetFileIdError', async () => {
    const list = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.reject({ errors: 'err' })
    )
    const drive: any = {
      files: {
        list
      }
    }

    const res = getFileId(drive, 'parent-id', 'file-name', false)
    await assert.rejects(res, (err: any) => {
      assert.ok(err instanceof GetFileIdError)
      assert.strictEqual(err.message, '"err"')
      return true
    })
  })

  it('should throw GetFileIdError(parentId)', async () => {
    const list = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.reject({ errors: 'err' })
    )
    const drive: any = {
      files: {
        list
      }
    }

    const res = getFileId(drive, "parent'id", 'file-name', false)
    await assert.rejects(res, (err: any) => {
      assert.ok(err instanceof GetFileIdError)
      assert.strictEqual(err.message, "Invalid paretnt id : parent'id")
      return true
    })
  })

  it('should throw GetFileIdError(fileName)', async () => {
    const list = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.reject({ errors: 'err' })
    )
    const drive: any = {
      files: {
        list
      }
    }

    const res = getFileId(drive, 'parent-id', "file'name", false)
    await assert.rejects(res, (err: any) => {
      assert.ok(err instanceof GetFileIdError)
      assert.strictEqual(err.message, "Invalid file name : file'name")
      return true
    })
  })
})

describe('driveClient()', () => {
  it('should return drive_v3.Drive', () => {
    const d = driveClient()
    assert.ok(d instanceof drive_v3.Drive)
    assert.ok(mockGoogleAuth.mock.calls.length > 0)
    assert.deepStrictEqual(mockGoogleAuth.mock.calls[0].arguments[0], {
      scopes: ['https://www.googleapis.com/auth/drive']
    })
  })
})
