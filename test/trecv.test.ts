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

const mockStreamExports = await (async () => {
  const { default: stream, ..._stream } = await import('stream')
  const mockPipeline =
    mock.fn<(s: any, d1: any, d2: any, d3: any) => Promise<void>>()
  const reset = () => {
    mockPipeline.mock.resetCalls()
    mockPipeline.mock.mockImplementation(async (s, d1, d2, d3) => {
      if (typeof d2 === 'function') {
        for await (const c of s) {
          d1.write(c)
        }
        d2(null)
      } else {
        ;(async () => {
          for await (const c of s) {
            d1.write(c)
          }
          d1.end()
        })()
        for await (const c of d1) {
          d2.write(c.toString())
        }
        d3(null)
      }
    })
  }

  reset()
  return {
    exports: {
      ..._stream,
      pipeline: mockPipeline
    },
    _reset: reset,
    _getMocks: () => ({
      mockPipeline
    })
  }
})()
mock.module('stream', { exports: mockStreamExports.exports })

const mockFsExports = await (async () => {
  const { default: fs, ..._fs } = await import('fs')
  const mockWrite = mock.fn()
  const mockClose = mock.fn<(cb: () => Error) => void>()
  const mockCreateWriteStream =
    mock.fn<() => { close: typeof mockClose; write: typeof mockWrite }>()
  const reset = () => {
    mockClose.mock.resetCalls()
    mockClose.mock.mockImplementation((cb) => {
      setImmediate(cb)
    })
    mockWrite.mock.resetCalls()
    mockCreateWriteStream.mock.resetCalls()
    mockCreateWriteStream.mock.mockImplementation(() => ({
      close: mockClose,
      write: mockWrite
    }))
  }

  reset()
  return {
    exports: {
      ..._fs,
      createWriteStream: mockCreateWriteStream
    },
    _reset: reset,
    _getMocks: () => ({
      mockCreateWriteStream,
      mockClose,
      mockWrite
    })
  }
})()
mock.module('fs', { exports: mockFsExports.exports })

const { mockCreateWriteStream, mockClose, mockWrite } =
  mockFsExports._getMocks()
const { GetFileIdError } = await import('../src/tdrive.ts')
const { DownloadFileError, downloadFile, recvFile } =
  await import('../src/trecv.ts')

afterEach(() => {
  mockGoogleAuthExports._reset()
  mockFsExports._reset()
  mockStreamExports._reset()
})

async function* mockExportGen() {
  yield Promise.resolve('export-data1')
  yield Promise.resolve('export-data2')
}

async function* mockExportGenBom() {
  yield Promise.resolve('\uFEFFexport-data1')
  yield Promise.resolve('export-data2')
}

async function* mockGetGen() {
  yield Promise.resolve('get-data1')
  yield Promise.resolve('get-data2')
}

describe('downloadFile()', () => {
  it('should call exrpot()', async () => {
    const mockExport = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: mockExportGen() })
    )
    const get = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: mockGetGen() })
    )
    const drive: any = {
      files: {
        export: mockExport,
        get
      }
    }
    assert.strictEqual(
      await downloadFile(drive, {
        fileId: 'test-id',
        destFileName: 'dest-file-name',
        destMimeType: 'dest-mime-type'
      }),
      undefined
    )
    assert.deepStrictEqual(mockExport.mock.calls[0].arguments, [
      {
        fileId: 'test-id',
        mimeType: 'dest-mime-type'
      },
      { responseType: 'stream' }
    ])
    assert.deepStrictEqual(mockCreateWriteStream.mock.calls[0].arguments, [
      'dest-file-name'
    ])
    assert.deepStrictEqual(mockWrite.mock.calls[0].arguments, ['export-data1'])
    assert.deepStrictEqual(mockWrite.mock.calls[1].arguments, ['export-data2'])
    assert.strictEqual(get.mock.callCount(), 0)
    assert.strictEqual(mockClose.mock.callCount(), 1)
  })

  it('should call exrpot() with removbeBom', async () => {
    const mockExport = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: mockExportGenBom() })
    )
    const get = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: mockGetGen() })
    )
    const drive: any = {
      files: {
        export: mockExport,
        get
      }
    }
    assert.strictEqual(
      await downloadFile(drive, {
        fileId: 'test-id',
        destFileName: 'dest-file-name',
        destMimeType: 'dest-mime-type',
        supportsAllDrives: false,
        removeBom: true
      }),
      undefined
    )
    assert.deepStrictEqual(mockExport.mock.calls[0].arguments, [
      {
        fileId: 'test-id',
        mimeType: 'dest-mime-type'
      },
      { responseType: 'stream' }
    ])
    assert.deepStrictEqual(mockCreateWriteStream.mock.calls[0].arguments, [
      'dest-file-name'
    ])
    assert.deepStrictEqual(mockWrite.mock.calls[0].arguments, ['export-data1'])
    assert.deepStrictEqual(mockWrite.mock.calls[1].arguments, ['export-data2'])
    assert.strictEqual(get.mock.callCount(), 0)
    assert.strictEqual(mockClose.mock.callCount(), 1)
  })

  it('should call exrpot() with suppots all drives(it not effect)', async () => {
    const mockExport = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: mockExportGenBom() })
    )
    const get = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: mockGetGen() })
    )
    const drive: any = {
      files: {
        export: mockExport,
        get
      }
    }
    assert.strictEqual(
      await downloadFile(drive, {
        fileId: 'test-id',
        destFileName: 'dest-file-name',
        destMimeType: 'dest-mime-type',
        supportsAllDrives: true,
        removeBom: true
      }),
      undefined
    )
    assert.deepStrictEqual(mockExport.mock.calls[0].arguments, [
      {
        fileId: 'test-id',
        mimeType: 'dest-mime-type'
      },
      { responseType: 'stream' }
    ])
    assert.deepStrictEqual(mockCreateWriteStream.mock.calls[0].arguments, [
      'dest-file-name'
    ])
    assert.deepStrictEqual(mockWrite.mock.calls[0].arguments, ['export-data1'])
    assert.deepStrictEqual(mockWrite.mock.calls[1].arguments, ['export-data2'])
    assert.strictEqual(get.mock.callCount(), 0)
    assert.strictEqual(mockClose.mock.callCount(), 1)
  })

  it('should call exrpot() with bom pass through', async () => {
    const mockExport = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: mockExportGenBom() })
    )
    const get = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: mockGetGen() })
    )
    const drive: any = {
      files: {
        export: mockExport,
        get
      }
    }
    assert.strictEqual(
      await downloadFile(drive, {
        fileId: 'test-id',
        destFileName: 'dest-file-name',
        destMimeType: 'dest-mime-type',
        supportsAllDrives: false,
        removeBom: false
      }),
      undefined
    )
    assert.deepStrictEqual(mockExport.mock.calls[0].arguments, [
      {
        fileId: 'test-id',
        mimeType: 'dest-mime-type'
      },
      { responseType: 'stream' }
    ])
    assert.deepStrictEqual(mockCreateWriteStream.mock.calls[0].arguments, [
      'dest-file-name'
    ])
    assert.deepStrictEqual(mockWrite.mock.calls[0].arguments, [
      '\uFEFFexport-data1'
    ])
    assert.deepStrictEqual(mockWrite.mock.calls[1].arguments, ['export-data2'])
    assert.strictEqual(get.mock.callCount(), 0)
    assert.strictEqual(mockClose.mock.callCount(), 1)
  })

  it('should call get()', async () => {
    const mockExport = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: mockExportGen() })
    )
    const get = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: mockGetGen() })
    )
    const drive: any = {
      files: {
        export: mockExport,
        get
      }
    }
    assert.strictEqual(
      await downloadFile(drive, {
        fileId: 'test-id',
        destFileName: 'dest-file-name',
        destMimeType: '',
        supportsAllDrives: false
      }),
      undefined
    )
    assert.strictEqual(mockExport.mock.callCount(), 0)
    assert.deepStrictEqual(mockCreateWriteStream.mock.calls[0].arguments, [
      'dest-file-name'
    ])
    assert.deepStrictEqual(get.mock.calls[0].arguments, [
      {
        fileId: 'test-id',
        alt: 'media',
        supportsAllDrives: false
      },
      { responseType: 'stream' }
    ])
    assert.deepStrictEqual(mockWrite.mock.calls[0].arguments, ['get-data1'])
    assert.deepStrictEqual(mockWrite.mock.calls[1].arguments, ['get-data2'])
    assert.strictEqual(mockClose.mock.callCount(), 1)
  })

  it('should call get() with supports all drives', async () => {
    const mockExport = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: mockExportGen() })
    )
    const get = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: mockGetGen() })
    )
    const drive: any = {
      files: {
        export: mockExport,
        get
      }
    }
    assert.strictEqual(
      await downloadFile(drive, {
        fileId: 'test-id',
        destFileName: 'dest-file-name',
        destMimeType: '',
        supportsAllDrives: true
      }),
      undefined
    )
    assert.strictEqual(mockExport.mock.callCount(), 0)
    assert.deepStrictEqual(mockCreateWriteStream.mock.calls[0].arguments, [
      'dest-file-name'
    ])
    assert.deepStrictEqual(get.mock.calls[0].arguments, [
      {
        fileId: 'test-id',
        alt: 'media',
        supportsAllDrives: true
      },
      { responseType: 'stream' }
    ])
    assert.deepStrictEqual(mockWrite.mock.calls[0].arguments, ['get-data1'])
    assert.deepStrictEqual(mockWrite.mock.calls[1].arguments, ['get-data2'])
    assert.strictEqual(mockClose.mock.callCount(), 1)
  })

  it('should use destStream', async () => {
    const mockExport = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: mockExportGen() })
    )
    const get = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: mockGetGen() })
    )
    const drive: any = {
      files: {
        export: mockExport,
        get
      }
    }
    const mockDestStream = {
      write: mock.fn()
    }
    assert.strictEqual(
      await downloadFile(drive, {
        fileId: 'test-id',
        destFileName: 'dest-file-name',
        destMimeType: '',
        supportsAllDrives: false,
        destStream: mockDestStream as any
      }),
      undefined
    )
    assert.strictEqual(mockExport.mock.callCount(), 0)
    assert.strictEqual(mockCreateWriteStream.mock.callCount(), 0)
    assert.deepStrictEqual(get.mock.calls[0].arguments, [
      {
        fileId: 'test-id',
        alt: 'media',
        supportsAllDrives: false
      },
      { responseType: 'stream' }
    ])
    assert.deepStrictEqual(mockDestStream.write.mock.calls[0].arguments, [
      'get-data1'
    ])
    assert.deepStrictEqual(mockDestStream.write.mock.calls[1].arguments, [
      'get-data2'
    ])
    assert.strictEqual(mockWrite.mock.callCount(), 0)
    assert.strictEqual(mockClose.mock.callCount(), 0)
  })

  it('should throw downloadFileError(export)', async () => {
    const mockExport = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.reject({ errors: 'err' })
    )
    const drive: any = {
      files: {
        export: mockExport
      }
    }

    const res = downloadFile(drive, {
      fileId: 'file-id',
      destFileName: 'dest-file-name',
      destMimeType: 'dest-mime-type',
      supportsAllDrives: false
    })
    await assert.rejects(res, (err: Error) => {
      assert.strictEqual(err.message, '"err"')
      assert.strictEqual(err instanceof DownloadFileError, true)
      return true
    })
    assert.strictEqual(mockClose.mock.callCount(), 1)
  })

  it('should throw downloadFileError(get)', async () => {
    const get = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.reject({ errors: 'err' })
    )
    const drive: any = {
      files: {
        get
      }
    }

    const res = downloadFile(drive, {
      fileId: 'file-id',
      destFileName: 'dest-file-name',
      destMimeType: '',
      supportsAllDrives: false
    })
    await assert.rejects(res, (err: Error) => {
      assert.strictEqual(err.message, '"err"')
      assert.strictEqual(err instanceof DownloadFileError, true)
      return true
    })
    assert.strictEqual(mockClose.mock.callCount(), 1)
  })
})

describe('recvFile()', () => {
  it('should call getFileId', async () => {
    const list = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { files: [{ id: 'test-id' }] } })
    )
    const mockExport = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: mockExportGen() })
    )
    const get = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: mockGetGen() })
    )
    const drive: any = {
      files: {
        list,
        export: mockExport,
        get
      }
    }
    assert.strictEqual(
      await recvFile(drive, {
        fileId: '',
        parentId: 'parent-id',
        srcFileName: 'src-file-name',
        destFileName: 'dest-file-name',
        destMimeType: 'dest-mime-type'
      }),
      'test-id'
    )
    assert.deepStrictEqual(list.mock.calls[0].arguments[0], {
      fields: 'files(id, name)',
      pageSize: 10,
      q: "'parent-id' in parents and name = 'src-file-name'",
      includeItemsFromAllDrives: false,
      supportsAllDrives: false
    })
    assert.deepStrictEqual(mockExport.mock.calls[0].arguments, [
      {
        fileId: 'test-id',
        mimeType: 'dest-mime-type'
      },
      { responseType: 'stream' }
    ])
    assert.deepStrictEqual(mockCreateWriteStream.mock.calls[0].arguments, [
      'dest-file-name'
    ])
    assert.deepStrictEqual(mockWrite.mock.calls[0].arguments, ['export-data1'])
    assert.deepStrictEqual(mockWrite.mock.calls[1].arguments, ['export-data2'])
    assert.strictEqual(get.mock.callCount(), 0)
    assert.strictEqual(mockClose.mock.callCount(), 1)
  })

  it('should call getFileId with support all drives', async () => {
    const list = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { files: [{ id: 'test-id' }] } })
    )
    const mockExport = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: mockExportGen() })
    )
    const get = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: mockGetGen() })
    )
    const drive: any = {
      files: {
        list,
        export: mockExport,
        get
      }
    }
    assert.strictEqual(
      await recvFile(drive, {
        fileId: '',
        parentId: 'parent-id',
        srcFileName: 'src-file-name',
        destFileName: 'dest-file-name',
        destMimeType: 'dest-mime-type',
        supportsAllDrives: true
      }),
      'test-id'
    )
    assert.deepStrictEqual(list.mock.calls[0].arguments[0], {
      fields: 'files(id, name)',
      pageSize: 10,
      q: "'parent-id' in parents and name = 'src-file-name'",
      includeItemsFromAllDrives: true,
      supportsAllDrives: true
    })
    assert.deepStrictEqual(mockExport.mock.calls[0].arguments, [
      {
        fileId: 'test-id',
        mimeType: 'dest-mime-type'
      },
      { responseType: 'stream' }
    ])
    assert.deepStrictEqual(mockCreateWriteStream.mock.calls[0].arguments, [
      'dest-file-name'
    ])
    assert.deepStrictEqual(mockWrite.mock.calls[0].arguments, ['export-data1'])
    assert.deepStrictEqual(mockWrite.mock.calls[1].arguments, ['export-data2'])
    assert.strictEqual(get.mock.callCount(), 0)
    assert.strictEqual(mockClose.mock.callCount(), 1)
  })

  it('should not call getFileId', async () => {
    const list = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { files: [{ id: 'test-id' }] } })
    )
    const mockExport = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: mockExportGen() })
    )
    const get = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: mockGetGen() })
    )
    const drive: any = {
      files: {
        list,
        export: mockExport,
        get
      }
    }
    assert.strictEqual(
      await recvFile(drive, {
        fileId: 'file-id',
        parentId: 'parent-id',
        srcFileName: 'src-file-name',
        destFileName: 'dest-file-name',
        destMimeType: 'dest-mime-type',
        supportsAllDrives: false
      }),
      'file-id'
    )
    assert.strictEqual(list.mock.callCount(), 0)
    assert.deepStrictEqual(mockExport.mock.calls[0].arguments, [
      {
        fileId: 'file-id',
        mimeType: 'dest-mime-type'
      },
      { responseType: 'stream' }
    ])
    assert.deepStrictEqual(mockCreateWriteStream.mock.calls[0].arguments, [
      'dest-file-name'
    ])
    assert.deepStrictEqual(mockWrite.mock.calls[0].arguments, ['export-data1'])
    assert.deepStrictEqual(mockWrite.mock.calls[1].arguments, ['export-data2'])
    assert.strictEqual(get.mock.callCount(), 0)
    assert.strictEqual(mockClose.mock.callCount(), 1)
  })

  it('should use destStream', async () => {
    const list = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { files: [{ id: 'test-id' }] } })
    )
    const mockExport = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: mockExportGen() })
    )
    const get = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: mockGetGen() })
    )
    const drive: any = {
      files: {
        list,
        export: mockExport,
        get
      }
    }
    const mockDestStream = { write: mock.fn() }
    assert.strictEqual(
      await recvFile(drive, {
        fileId: '',
        parentId: 'parent-id',
        srcFileName: 'src-file-name',
        destFileName: 'dest-file-name',
        destMimeType: 'dest-mime-type',
        supportsAllDrives: false,
        destStream: mockDestStream as any
      }),
      'test-id'
    )
    assert.deepStrictEqual(list.mock.calls[0].arguments, [
      {
        fields: 'files(id, name)',
        pageSize: 10,
        q: "'parent-id' in parents and name = 'src-file-name'",
        includeItemsFromAllDrives: false,
        supportsAllDrives: false
      }
    ])
    assert.deepStrictEqual(mockExport.mock.calls[0].arguments, [
      {
        fileId: 'test-id',
        mimeType: 'dest-mime-type'
      },
      { responseType: 'stream' }
    ])
    assert.strictEqual(mockCreateWriteStream.mock.callCount(), 0)
    assert.deepStrictEqual(mockDestStream.write.mock.calls[0].arguments, [
      'export-data1'
    ])
    assert.deepStrictEqual(mockDestStream.write.mock.calls[1].arguments, [
      'export-data2'
    ])
    assert.strictEqual(mockWrite.mock.callCount(), 0)
    assert.strictEqual(get.mock.callCount(), 0)
    assert.strictEqual(mockClose.mock.callCount(), 0)
  })

  it('should use get() with support all drives', async () => {
    const list = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { files: [{ id: 'test-id' }] } })
    )
    const mockExport = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: mockExportGen() })
    )
    const get = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: mockGetGen() })
    )
    const drive: any = {
      files: {
        list,
        export: mockExport,
        get
      }
    }
    assert.strictEqual(
      await recvFile(drive, {
        fileId: '',
        parentId: 'parent-id',
        srcFileName: 'src-file-name',
        destFileName: 'dest-file-name',
        destMimeType: '',
        supportsAllDrives: true
      }),
      'test-id'
    )
    assert.deepStrictEqual(list.mock.calls[0].arguments[0], {
      fields: 'files(id, name)',
      pageSize: 10,
      q: "'parent-id' in parents and name = 'src-file-name'",
      includeItemsFromAllDrives: true,
      supportsAllDrives: true
    })
    assert.strictEqual(mockExport.mock.callCount(), 0)
    assert.deepStrictEqual(mockCreateWriteStream.mock.calls[0].arguments, [
      'dest-file-name'
    ])
    assert.deepStrictEqual(get.mock.calls[0].arguments, [
      {
        fileId: 'test-id',
        alt: 'media',
        supportsAllDrives: true
      },
      { responseType: 'stream' }
    ])
    assert.deepStrictEqual(mockWrite.mock.calls[0].arguments, ['get-data1'])
    assert.deepStrictEqual(mockWrite.mock.calls[1].arguments, ['get-data2'])
    assert.strictEqual(mockClose.mock.callCount(), 1)
  })

  it('should throw when file not found', async () => {
    const list = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { files: [] } })
    )
    const drive: any = {
      files: {
        list
      }
    }
    const res = recvFile(drive, {
      fileId: '',
      parentId: 'parent-id',
      srcFileName: 'src-file-name',
      destFileName: 'dest-file-name',
      destMimeType: 'dest-mime-type',
      supportsAllDrives: false
    })
    await assert.rejects(res, (err: Error) => {
      assert.strictEqual(err.message, 'The srouce file not found')
      assert.strictEqual(err instanceof GetFileIdError, true)
      return true
    })
  })

  it('should throw error when dest-file-name and dest-strem not passed', async () => {
    const drive: any = {}
    const res = recvFile(drive, {
      fileId: 'file-id',
      parentId: 'parent-id',
      srcFileName: 'src-file-name',
      destFileName: '',
      supportsAllDrives: false,
      destMimeType: 'dest-mime-type'
    })
    await assert.rejects(res, (err: Error) => {
      assert.strictEqual(err.message, 'The destination is not specified')
      return true
    })
  })
})
