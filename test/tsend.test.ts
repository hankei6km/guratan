import { describe, it, afterEach, mock } from 'node:test'
import assert from 'node:assert/strict'

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

const mockFsExports = await (async () => {
  const { default: fs, ..._fs } = await import('fs')
  const mockCreateReadStream = mock.fn<(a: any) => string>()
  const reset = () => {
    mockCreateReadStream.mock.resetCalls()
    mockCreateReadStream.mock.mockImplementation(
      () => 'mock-create-read-streadm'
    )
  }

  reset()
  return {
    exports: {
      ..._fs,
      createReadStream: mockCreateReadStream
    },
    _reset: reset,
    _getMocks: () => ({
      mockCreateReadStream
    })
  }
})()
mock.module('fs', { exports: mockFsExports.exports })

const mockFs = await import('fs')
const { mockCreateReadStream } = mockFsExports._getMocks()
const { UploadFileError, UpdateFileError, uploadFile, updateFile, sendFile } =
  await import('../src/tsend.ts')

afterEach(() => {
  mockFsExports._reset()
})

describe('uploadFile()', () => {
  it('should return id of file', async () => {
    const create = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { id: 'test-id' } })
    )
    const drive: any = {
      files: {
        create
      }
    }

    assert.strictEqual(
      await uploadFile(drive, {
        parentId: 'parent-id',
        destFileName: 'dest-file-name',
        srcFileName: 'src-file-name',
        destMimeType: 'dest-mime-type',
        srcMimeType: 'src-mime-type'
      }),
      'test-id'
    )
    assert.strictEqual(
      mockCreateReadStream.mock.calls[0].arguments[0],
      'src-file-name'
    )
    assert.deepStrictEqual(create.mock.calls[0].arguments, [
      {
        fields: 'id',
        media: {
          mimeType: 'src-mime-type',
          body: 'mock-create-read-streadm'
        },
        supportsAllDrives: false,
        requestBody: {
          name: 'dest-file-name',
          mimeType: 'dest-mime-type',
          parents: ['parent-id']
        }
      }
    ])
  })

  it('should return id of file(supports all drives)', async () => {
    const create = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { id: 'test-id' } })
    )
    const drive: any = {
      files: {
        create
      }
    }

    assert.strictEqual(
      await uploadFile(drive, {
        parentId: 'parent-id',
        destFileName: 'dest-file-name',
        srcFileName: 'src-file-name',
        destMimeType: 'dest-mime-type',
        srcMimeType: 'src-mime-type',
        supportsAllDrives: true
      }),
      'test-id'
    )
    assert.strictEqual(
      mockCreateReadStream.mock.calls[0].arguments[0],
      'src-file-name'
    )
    assert.deepStrictEqual(create.mock.calls[0].arguments[0], {
      fields: 'id',
      media: {
        mimeType: 'src-mime-type',
        body: 'mock-create-read-streadm'
      },
      supportsAllDrives: true,
      requestBody: {
        name: 'dest-file-name',
        mimeType: 'dest-mime-type',
        parents: ['parent-id']
      }
    })
  })

  it('should return id of file(mimeType is blank)', async () => {
    const create = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { id: 'test-id' } })
    )
    const drive: any = {
      files: {
        create
      }
    }

    assert.strictEqual(
      await uploadFile(drive, {
        parentId: 'parent-id',
        destFileName: 'dest-file-name',
        srcFileName: 'src-file-name',
        destMimeType: '',
        srcMimeType: '',
        supportsAllDrives: false
      }),
      'test-id'
    )
    assert.strictEqual(
      mockCreateReadStream.mock.calls[0].arguments[0],
      'src-file-name'
    )
    assert.deepStrictEqual(create.mock.calls[0].arguments[0], {
      fields: 'id',
      media: {
        body: 'mock-create-read-streadm'
      },
      supportsAllDrives: false,
      requestBody: {
        name: 'dest-file-name',
        parents: ['parent-id']
      }
    })
  })

  it('should use srcStream', async () => {
    const create = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { id: 'test-id' } })
    )
    const drive: any = {
      files: {
        create
      }
    }

    assert.strictEqual(
      await uploadFile(drive, {
        parentId: 'parent-id',
        destFileName: 'dest-file-name',
        srcFileName: 'src-file-name',
        destMimeType: '',
        srcMimeType: '',
        supportsAllDrives: false,
        srcStream: 'src-stream' as any
      }),
      'test-id'
    )
    assert.strictEqual(mockCreateReadStream.mock.callCount(), 0)
    assert.deepStrictEqual(create.mock.calls[0].arguments[0], {
      fields: 'id',
      media: {
        body: 'src-stream'
      },
      supportsAllDrives: false,
      requestBody: {
        name: 'dest-file-name',
        parents: ['parent-id']
      }
    })
  })

  it('should throw UploadFileError', async () => {
    const create = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.reject({ errors: 'err' })
    )
    const drive: any = {
      files: {
        create
      }
    }

    const res = uploadFile(drive, {
      parentId: 'parent-id',
      destFileName: 'dest-file-name',
      srcFileName: 'src-file-name',
      destMimeType: 'dest-mime-type',
      srcMimeType: 'src-mime-type',
      supportsAllDrives: false
    })
    await assert.rejects(res, (err: Error) => {
      assert.strictEqual(err.message, '"err"')
      assert.ok(err instanceof UploadFileError)
      return true
    })
  })
})

describe('updateFile()', () => {
  it('should return id of file', async () => {
    const update = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { id: 'test-id' } })
    )
    const drive: any = {
      files: {
        update
      }
    }

    assert.strictEqual(
      await updateFile(drive, {
        fileId: 'file-id',
        srcFileName: 'src-file-name',
        destMimeType: 'dest-mime-type',
        srcMimeType: 'src-mime-type'
      }),
      'test-id'
    )
    assert.strictEqual(
      mockCreateReadStream.mock.calls[0].arguments[0],
      'src-file-name'
    )
    assert.deepStrictEqual(update.mock.calls[0].arguments[0], {
      fileId: 'file-id',
      fields: 'id',
      media: {
        mimeType: 'src-mime-type',
        body: 'mock-create-read-streadm'
      },
      supportsAllDrives: false,
      requestBody: {
        mimeType: 'dest-mime-type'
      }
    })
  })

  it('should return id of file(supports all drives)', async () => {
    const update = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { id: 'test-id' } })
    )
    const drive: any = {
      files: {
        update
      }
    }

    assert.strictEqual(
      await updateFile(drive, {
        fileId: 'file-id',
        srcFileName: 'src-file-name',
        destMimeType: 'dest-mime-type',
        srcMimeType: 'src-mime-type',
        supportsAllDrives: true
      }),
      'test-id'
    )
    assert.strictEqual(
      mockCreateReadStream.mock.calls[0].arguments[0],
      'src-file-name'
    )
    assert.deepStrictEqual(update.mock.calls[0].arguments[0], {
      fileId: 'file-id',
      fields: 'id',
      media: {
        mimeType: 'src-mime-type',
        body: 'mock-create-read-streadm'
      },
      supportsAllDrives: true,
      requestBody: {
        mimeType: 'dest-mime-type'
      }
    })
  })

  it('should return id of file(mimeType is blank)', async () => {
    const update = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { id: 'test-id' } })
    )
    const drive: any = {
      files: {
        update
      }
    }

    assert.strictEqual(
      await updateFile(drive, {
        fileId: 'file-id',
        srcFileName: 'src-file-name',
        destMimeType: '',
        srcMimeType: '',
        supportsAllDrives: false
      }),
      'test-id'
    )
    assert.strictEqual(
      mockCreateReadStream.mock.calls[0].arguments[0],
      'src-file-name'
    )
    assert.deepStrictEqual(update.mock.calls[0].arguments[0], {
      fileId: 'file-id',
      fields: 'id',
      media: {
        body: 'mock-create-read-streadm'
      },
      supportsAllDrives: false,
      requestBody: {}
    })
  })

  it('should use srcStream', async () => {
    const update = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { id: 'test-id' } })
    )
    const drive: any = {
      files: {
        update
      }
    }

    assert.strictEqual(
      await updateFile(drive, {
        fileId: 'file-id',
        srcFileName: 'src-file-name',
        destMimeType: '',
        srcMimeType: '',
        supportsAllDrives: false,
        srcStream: 'src-stream' as any
      }),
      'test-id'
    )
    assert.strictEqual(mockCreateReadStream.mock.callCount(), 0)
    assert.deepStrictEqual(update.mock.calls[0].arguments[0], {
      fileId: 'file-id',
      fields: 'id',
      media: {
        body: 'src-stream'
      },
      supportsAllDrives: false,
      requestBody: {}
    })
  })

  it('should throw UploadFileError', async () => {
    const update = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.reject({ errors: 'err' })
    )
    const drive: any = {
      files: {
        update
      }
    }

    const res = updateFile(drive, {
      fileId: 'file-id',
      srcFileName: 'src-file-name',
      destMimeType: 'dest-mime-type',
      srcMimeType: 'src-mime-type',
      supportsAllDrives: false
    })
    await assert.rejects(res, (err: Error) => {
      assert.strictEqual(err.message, '"err"')
      assert.ok(err instanceof UpdateFileError)
      return true
    })
  })
})

describe('sendFile()', () => {
  it('should call create', async () => {
    const list = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { files: [{}] } })
    )
    const create = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { id: 'create-test-id' } })
    )
    const update = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { id: 'update-test-id' } })
    )
    const drive: any = {
      files: {
        list,
        create,
        update
      }
    }
    assert.strictEqual(
      await sendFile(drive, {
        fileId: '',
        parentId: 'parent-id',
        destFileName: 'dest-file-name',
        srcFileName: 'src-file-name',
        destMimeType: 'dest-mime-type',
        srcMimeType: 'src-mime-type'
      }),
      'create-test-id'
    )
    assert.deepStrictEqual(list.mock.calls[0].arguments[0], {
      fields: 'files(id, name)',
      pageSize: 10,
      q: "'parent-id' in parents and name = 'dest-file-name'",
      includeItemsFromAllDrives: false,
      supportsAllDrives: false
    })
    assert.deepStrictEqual(create.mock.calls[0].arguments[0], {
      fields: 'id',
      media: {
        mimeType: 'src-mime-type',
        body: 'mock-create-read-streadm'
      },
      supportsAllDrives: false,
      requestBody: {
        name: 'dest-file-name',
        mimeType: 'dest-mime-type',
        parents: ['parent-id']
      }
    })
    assert.strictEqual(update.mock.callCount(), 0)
  })

  it('should call create(supports all drives)', async () => {
    const list = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { files: [{}] } })
    )
    const create = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { id: 'create-test-id' } })
    )
    const update = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { id: 'update-test-id' } })
    )
    const drive: any = {
      files: {
        list,
        create,
        update
      }
    }
    assert.strictEqual(
      await sendFile(drive, {
        fileId: '',
        parentId: 'parent-id',
        destFileName: 'dest-file-name',
        srcFileName: 'src-file-name',
        destMimeType: 'dest-mime-type',
        srcMimeType: 'src-mime-type',
        supportsAllDrives: true
      }),
      'create-test-id'
    )
    assert.deepStrictEqual(list.mock.calls[0].arguments[0], {
      fields: 'files(id, name)',
      pageSize: 10,
      q: "'parent-id' in parents and name = 'dest-file-name'",
      includeItemsFromAllDrives: true,
      supportsAllDrives: true
    })
    assert.deepStrictEqual(create.mock.calls[0].arguments[0], {
      fields: 'id',
      media: {
        mimeType: 'src-mime-type',
        body: 'mock-create-read-streadm'
      },
      supportsAllDrives: true,
      requestBody: {
        name: 'dest-file-name',
        mimeType: 'dest-mime-type',
        parents: ['parent-id']
      }
    })
    assert.strictEqual(update.mock.callCount(), 0)
  })

  it('should call create(pass srcStream)', async () => {
    const list = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { files: [{}] } })
    )
    const create = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { id: 'create-test-id' } })
    )
    const update = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { id: 'update-test-id' } })
    )
    const drive: any = {
      files: {
        list,
        create,
        update
      }
    }
    assert.strictEqual(
      await sendFile(drive, {
        fileId: '',
        parentId: 'parent-id',
        destFileName: 'dest-file-name',
        srcFileName: 'src-file-name',
        destMimeType: 'dest-mime-type',
        srcMimeType: 'src-mime-type',
        supportsAllDrives: false,
        srcStream: 'src-stream' as any
      }),
      'create-test-id'
    )
    assert.deepStrictEqual(list.mock.calls[0].arguments[0], {
      fields: 'files(id, name)',
      pageSize: 10,
      q: "'parent-id' in parents and name = 'dest-file-name'",
      includeItemsFromAllDrives: false,
      supportsAllDrives: false
    })
    assert.deepStrictEqual(create.mock.calls[0].arguments[0], {
      fields: 'id',
      media: {
        mimeType: 'src-mime-type',
        body: 'src-stream'
      },
      supportsAllDrives: false,
      requestBody: {
        name: 'dest-file-name',
        mimeType: 'dest-mime-type',
        parents: ['parent-id']
      }
    })
    assert.strictEqual(update.mock.callCount(), 0)
  })

  it('should call update(fileId is blank)', async () => {
    const list = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { files: [{ id: 'test-id' }] } })
    )
    const create = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { id: 'create-test-id' } })
    )
    const update = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { id: 'update-test-id' } })
    )
    const drive: any = {
      files: {
        list,
        create,
        update
      }
    }
    assert.strictEqual(
      await sendFile(drive, {
        fileId: '',
        parentId: 'parent-id',
        destFileName: 'dest-file-name',
        srcFileName: 'src-file-name',
        destMimeType: 'dest-mime-type',
        srcMimeType: 'src-mime-type',
        supportsAllDrives: false
      }),
      'update-test-id'
    )
    assert.deepStrictEqual(list.mock.calls[0].arguments[0], {
      fields: 'files(id, name)',
      pageSize: 10,
      q: "'parent-id' in parents and name = 'dest-file-name'",
      includeItemsFromAllDrives: false,
      supportsAllDrives: false
    })
    assert.strictEqual(create.mock.callCount(), 0)
    assert.deepStrictEqual(update.mock.calls[0].arguments[0], {
      fileId: 'test-id',
      fields: 'id',
      media: {
        mimeType: 'src-mime-type',
        body: 'mock-create-read-streadm'
      },
      supportsAllDrives: false,
      requestBody: {
        mimeType: 'dest-mime-type'
      }
    })
  })

  it('should call update(supports all drives)', async () => {
    const list = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { files: [{ id: 'test-id' }] } })
    )
    const create = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { id: 'create-test-id' } })
    )
    const update = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { id: 'update-test-id' } })
    )
    const drive: any = {
      files: {
        list,
        create,
        update
      }
    }
    assert.strictEqual(
      await sendFile(drive, {
        fileId: '',
        parentId: 'parent-id',
        destFileName: 'dest-file-name',
        srcFileName: 'src-file-name',
        destMimeType: 'dest-mime-type',
        srcMimeType: 'src-mime-type',
        supportsAllDrives: true
      }),
      'update-test-id'
    )
    assert.deepStrictEqual(list.mock.calls[0].arguments[0], {
      fields: 'files(id, name)',
      pageSize: 10,
      q: "'parent-id' in parents and name = 'dest-file-name'",
      includeItemsFromAllDrives: true,
      supportsAllDrives: true
    })
    assert.strictEqual(create.mock.callCount(), 0)
    assert.deepStrictEqual(update.mock.calls[0].arguments[0], {
      fileId: 'test-id',
      fields: 'id',
      media: {
        mimeType: 'src-mime-type',
        body: 'mock-create-read-streadm'
      },
      supportsAllDrives: true,
      requestBody: {
        mimeType: 'dest-mime-type'
      }
    })
  })

  it('should call update(fileId is specified)', async () => {
    const list = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { files: [{ id: 'test-id' }] } })
    )
    const create = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { id: 'create-test-id' } })
    )
    const update = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { id: 'update-test-id' } })
    )
    const drive: any = {
      files: {
        list,
        create,
        update
      }
    }
    assert.strictEqual(
      await sendFile(drive, {
        fileId: 'file-id',
        parentId: 'parent-id',
        destFileName: 'dest-file-name',
        srcFileName: 'src-file-name',
        destMimeType: 'dest-mime-type',
        srcMimeType: 'src-mime-type',
        supportsAllDrives: false
      }),
      'update-test-id'
    )
    assert.strictEqual(list.mock.callCount(), 0)
    assert.strictEqual(create.mock.callCount(), 0)
    assert.deepStrictEqual(update.mock.calls[0].arguments[0], {
      fileId: 'file-id',
      fields: 'id',
      media: {
        mimeType: 'src-mime-type',
        body: 'mock-create-read-streadm'
      },
      supportsAllDrives: false,
      requestBody: {
        mimeType: 'dest-mime-type'
      }
    })
  })

  it('should call update(pass srcStream)', async () => {
    const list = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { files: [{ id: 'test-id' }] } })
    )
    const create = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { id: 'create-test-id' } })
    )
    const update = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { id: 'update-test-id' } })
    )
    const drive: any = {
      files: {
        list,
        create,
        update
      }
    }
    assert.strictEqual(
      await sendFile(drive, {
        fileId: 'file-id',
        parentId: 'parent-id',
        destFileName: 'dest-file-name',
        srcFileName: 'src-file-name',
        destMimeType: 'dest-mime-type',
        srcMimeType: 'src-mime-type',
        supportsAllDrives: false,
        srcStream: 'src-stream' as any
      }),
      'update-test-id'
    )
    assert.strictEqual(list.mock.callCount(), 0)
    assert.strictEqual(create.mock.callCount(), 0)
    assert.deepStrictEqual(update.mock.calls[0].arguments[0], {
      fileId: 'file-id',
      fields: 'id',
      media: {
        mimeType: 'src-mime-type',
        body: 'src-stream'
      },
      supportsAllDrives: false,
      requestBody: {
        mimeType: 'dest-mime-type'
      }
    })
  })

  it('should throw error when src-file-name and src-strem not passed', async () => {
    const drive: any = {}
    const res = sendFile(drive, {
      fileId: 'file-id',
      parentId: 'parent-id',
      destFileName: 'dest-file-name',
      srcFileName: '',
      destMimeType: 'dest-mime-type',
      srcMimeType: 'src-mime-type',
      supportsAllDrives: false
    })
    await assert.rejects(res, (err: Error) => {
      assert.strictEqual(err.message, 'The source content is not specified')
      return true
    })
  })
})
