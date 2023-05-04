import { jest } from '@jest/globals'

jest.unstable_mockModule('stream', async () => {
  const mockPipeline = jest.fn<any, any[]>()
  const reset = () => {
    mockPipeline.mockReset().mockImplementation(async (s, d1, d2, d3) => {
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
    pipeline: mockPipeline,
    _reset: reset,
    _getMocks: () => ({
      mockPipeline
    })
  }
})

jest.unstable_mockModule('fs', async () => {
  const mockWrite = jest.fn()
  const mockClose = jest.fn<any, any[]>()
  const mockCreateWriteStream = jest.fn()
  const reset = () => {
    mockClose.mockReset().mockImplementation((cb) => {
      setImmediate(cb)
    })
    mockWrite.mockReset()
    mockCreateWriteStream
      .mockReset()
      .mockReturnValue({ close: mockClose, write: mockWrite })
  }

  reset()
  return {
    createWriteStream: mockCreateWriteStream,
    _reset: reset,
    _getMocks: () => ({
      mockCreateWriteStream,
      mockClose,
      mockWrite
    })
  }
})

const mockStream = await import('stream')
const mockFs = await import('fs')
const { mockCreateWriteStream, mockClose, mockWrite } = (
  mockFs as any
)._getMocks()
const { GetFileIdError } = await import('../src/tdrive.js')
const { DownloadFileError, downloadFile, recvFile } = await import(
  '../src/trecv.js'
)

afterEach(() => {
  ;(mockFs as any)._reset()
  ;(mockStream as any)._reset()
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
    const mockExport = jest
      .fn<any, any[]>()
      .mockResolvedValue({ data: mockExportGen() })
    const get = jest.fn<any, any[]>().mockResolvedValue({ data: mockGetGen() })
    const drive: any = {
      files: {
        export: mockExport,
        get
      }
    }
    expect(
      await downloadFile(drive, {
        fileId: 'test-id',
        destFileName: 'dest-file-name',
        destMimeType: 'dest-mime-type'
      })
    ).toBeUndefined()
    expect(mockExport).toBeCalledWith(
      {
        fileId: 'test-id',
        mimeType: 'dest-mime-type'
      },
      { responseType: 'stream' }
    )
    expect(mockCreateWriteStream).toBeCalledWith('dest-file-name')
    expect(mockWrite).toBeCalledWith('export-data1')
    expect(mockWrite).toBeCalledWith('export-data2')
    expect(get).toBeCalledTimes(0)
    expect(mockClose).toBeCalledTimes(1)
  })

  it('should call exrpot() with removbeBom', async () => {
    const mockExport = jest
      .fn<any, any[]>()
      .mockResolvedValue({ data: mockExportGenBom() })
    const get = jest.fn<any, any[]>().mockResolvedValue({ data: mockGetGen() })
    const drive: any = {
      files: {
        export: mockExport,
        get
      }
    }
    expect(
      await downloadFile(drive, {
        fileId: 'test-id',
        destFileName: 'dest-file-name',
        destMimeType: 'dest-mime-type',
        supportsAllDrives: false,
        removeBom: true
      })
    ).toBeUndefined()
    expect(mockExport).toBeCalledWith(
      {
        fileId: 'test-id',
        mimeType: 'dest-mime-type'
      },
      { responseType: 'stream' }
    )
    expect(mockCreateWriteStream).toBeCalledWith('dest-file-name')
    expect(mockWrite).toBeCalledWith('export-data1')
    expect(mockWrite).toBeCalledWith('export-data2')
    expect(get).toBeCalledTimes(0)
    expect(mockClose).toBeCalledTimes(1)
  })

  it('should call exrpot() with suppots all drives(it not effect)', async () => {
    const mockExport = jest
      .fn<any, any[]>()
      .mockResolvedValue({ data: mockExportGenBom() })
    const get = jest.fn<any, any[]>().mockResolvedValue({ data: mockGetGen() })
    const drive: any = {
      files: {
        export: mockExport,
        get
      }
    }
    expect(
      await downloadFile(drive, {
        fileId: 'test-id',
        destFileName: 'dest-file-name',
        destMimeType: 'dest-mime-type',
        supportsAllDrives: true,
        removeBom: true
      })
    ).toBeUndefined()
    expect(mockExport).toBeCalledWith(
      {
        fileId: 'test-id',
        mimeType: 'dest-mime-type'
      },
      { responseType: 'stream' }
    )
    expect(mockCreateWriteStream).toBeCalledWith('dest-file-name')
    expect(mockWrite).toBeCalledWith('export-data1')
    expect(mockWrite).toBeCalledWith('export-data2')
    expect(get).toBeCalledTimes(0)
    expect(mockClose).toBeCalledTimes(1)
  })

  it('should call exrpot() with bom pass through', async () => {
    const mockExport = jest
      .fn<any, any[]>()
      .mockResolvedValue({ data: mockExportGenBom() })
    const get = jest.fn<any, any[]>().mockResolvedValue({ data: mockGetGen() })
    const drive: any = {
      files: {
        export: mockExport,
        get
      }
    }
    expect(
      await downloadFile(drive, {
        fileId: 'test-id',
        destFileName: 'dest-file-name',
        destMimeType: 'dest-mime-type',
        supportsAllDrives: false,
        removeBom: false
      })
    ).toBeUndefined()
    expect(mockExport).toBeCalledWith(
      {
        fileId: 'test-id',
        mimeType: 'dest-mime-type'
      },
      { responseType: 'stream' }
    )
    expect(mockCreateWriteStream).toBeCalledWith('dest-file-name')
    expect(mockWrite).toBeCalledWith('\uFEFFexport-data1')
    expect(mockWrite).toBeCalledWith('export-data2')
    expect(get).toBeCalledTimes(0)
    expect(mockClose).toBeCalledTimes(1)
  })

  it('should call get()', async () => {
    const mockExport = jest
      .fn<any, any[]>()
      .mockResolvedValue({ data: mockExportGen() })
    const get = jest.fn<any, any[]>().mockResolvedValue({ data: mockGetGen() })
    const drive: any = {
      files: {
        export: mockExport,
        get
      }
    }
    expect(
      await downloadFile(drive, {
        fileId: 'test-id',
        destFileName: 'dest-file-name',
        destMimeType: '',
        supportsAllDrives: false
      })
    ).toBeUndefined()
    expect(mockExport).toBeCalledTimes(0)
    expect(mockCreateWriteStream).toBeCalledWith('dest-file-name')
    expect(get).toBeCalledWith(
      {
        fileId: 'test-id',
        alt: 'media',
        supportsAllDrives: false
      },
      { responseType: 'stream' }
    )
    expect(mockWrite).toBeCalledWith('get-data1')
    expect(mockWrite).toBeCalledWith('get-data2')
    expect(mockClose).toBeCalledTimes(1)
  })

  it('should call get() with supports all drives', async () => {
    const mockExport = jest
      .fn<any, any[]>()
      .mockResolvedValue({ data: mockExportGen() })
    const get = jest.fn<any, any[]>().mockResolvedValue({ data: mockGetGen() })
    const drive: any = {
      files: {
        export: mockExport,
        get
      }
    }
    expect(
      await downloadFile(drive, {
        fileId: 'test-id',
        destFileName: 'dest-file-name',
        destMimeType: '',
        supportsAllDrives: true
      })
    ).toBeUndefined()
    expect(mockExport).toBeCalledTimes(0)
    expect(mockCreateWriteStream).toBeCalledWith('dest-file-name')
    expect(get).toBeCalledWith(
      {
        fileId: 'test-id',
        alt: 'media',
        supportsAllDrives: true
      },
      { responseType: 'stream' }
    )
    expect(mockWrite).toBeCalledWith('get-data1')
    expect(mockWrite).toBeCalledWith('get-data2')
    expect(mockClose).toBeCalledTimes(1)
  })

  it('should use destStream', async () => {
    const mockExport = jest
      .fn<any, any[]>()
      .mockResolvedValue({ data: mockExportGen() })
    const get = jest.fn<any, any[]>().mockResolvedValue({ data: mockGetGen() })
    const drive: any = {
      files: {
        export: mockExport,
        get
      }
    }
    const mockDestStream = {
      write: jest.fn()
    }
    expect(
      await downloadFile(drive, {
        fileId: 'test-id',
        destFileName: 'dest-file-name',
        destMimeType: '',
        supportsAllDrives: false,
        destStream: mockDestStream as any
      })
    ).toBeUndefined()
    expect(mockExport).toBeCalledTimes(0)
    expect(mockCreateWriteStream).toBeCalledTimes(0)
    expect(get).toBeCalledWith(
      {
        fileId: 'test-id',
        alt: 'media',
        supportsAllDrives: false
      },
      { responseType: 'stream' }
    )
    expect(mockDestStream.write).toBeCalledWith('get-data1')
    expect(mockDestStream.write).toBeCalledWith('get-data2')
    expect(mockWrite).toReturnTimes(0)
    expect(mockClose).toBeCalledTimes(0)
  })

  it('should throw downloadFileError(export)', async () => {
    const mockExport = jest
      .fn<any, any[]>()
      .mockRejectedValue({ errors: 'err' })
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
    await expect(res).rejects.toThrowError('err')
    await expect(res).rejects.toBeInstanceOf(DownloadFileError)
    expect(mockClose).toBeCalledTimes(1)
  })

  it('should throw downloadFileError(get)', async () => {
    const get = jest.fn<any, any[]>().mockRejectedValue({ errors: 'err' })
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
    await expect(res).rejects.toThrowError('err')
    await expect(res).rejects.toBeInstanceOf(DownloadFileError)
    expect(mockClose).toBeCalledTimes(1)
  })
})

describe('recvFile()', () => {
  it('should call getFileId', async () => {
    const list = jest
      .fn<any, any[]>()
      .mockResolvedValue({ data: { files: [{ id: 'test-id' }] } })
    const mockExport = jest
      .fn<any, any[]>()
      .mockResolvedValue({ data: mockExportGen() })
    const get = jest.fn<any, any[]>().mockResolvedValue({ data: mockGetGen() })
    const drive: any = {
      files: {
        list,
        export: mockExport,
        get
      }
    }
    expect(
      await recvFile(drive, {
        fileId: '',
        parentId: 'parent-id',
        srcFileName: 'src-file-name',
        destFileName: 'dest-file-name',
        destMimeType: 'dest-mime-type'
      })
    ).toEqual('test-id')
    expect(list).toBeCalledWith({
      fields: 'files(id, name)',
      pageSize: 10,
      q: "'parent-id' in parents and name = 'src-file-name'",
      includeItemsFromAllDrives: false,
      supportsAllDrives: false
    })
    expect(mockExport).toBeCalledWith(
      {
        fileId: 'test-id',
        mimeType: 'dest-mime-type'
      },
      { responseType: 'stream' }
    )
    expect(mockCreateWriteStream).toBeCalledWith('dest-file-name')
    expect(mockWrite).toBeCalledWith('export-data1')
    expect(mockWrite).toBeCalledWith('export-data2')
    expect(get).toBeCalledTimes(0)
    expect(mockClose).toBeCalledTimes(1)
  })

  it('should call getFileId with support all drives', async () => {
    const list = jest
      .fn<any, any[]>()
      .mockResolvedValue({ data: { files: [{ id: 'test-id' }] } })
    const mockExport = jest
      .fn<any, any[]>()
      .mockResolvedValue({ data: mockExportGen() })
    const get = jest.fn<any, any[]>().mockResolvedValue({ data: mockGetGen() })
    const drive: any = {
      files: {
        list,
        export: mockExport,
        get
      }
    }
    expect(
      await recvFile(drive, {
        fileId: '',
        parentId: 'parent-id',
        srcFileName: 'src-file-name',
        destFileName: 'dest-file-name',
        destMimeType: 'dest-mime-type',
        supportsAllDrives: true
      })
    ).toEqual('test-id')
    expect(list).toBeCalledWith({
      fields: 'files(id, name)',
      pageSize: 10,
      q: "'parent-id' in parents and name = 'src-file-name'",
      includeItemsFromAllDrives: true,
      supportsAllDrives: true
    })
    expect(mockExport).toBeCalledWith(
      {
        fileId: 'test-id',
        mimeType: 'dest-mime-type'
      },
      { responseType: 'stream' }
    )
    expect(mockCreateWriteStream).toBeCalledWith('dest-file-name')
    expect(mockWrite).toBeCalledWith('export-data1')
    expect(mockWrite).toBeCalledWith('export-data2')
    expect(get).toBeCalledTimes(0)
    expect(mockClose).toBeCalledTimes(1)
  })

  it('should not call getFileId', async () => {
    const list = jest
      .fn<any, any[]>()
      .mockResolvedValue({ data: { files: [{ id: 'test-id' }] } })
    const mockExport = jest
      .fn<any, any[]>()
      .mockResolvedValue({ data: mockExportGen() })
    const get = jest.fn<any, any[]>().mockResolvedValue({ data: mockGetGen() })
    const drive: any = {
      files: {
        list,
        export: mockExport,
        get
      }
    }
    expect(
      await recvFile(drive, {
        fileId: 'file-id',
        parentId: 'parent-id',
        srcFileName: 'src-file-name',
        destFileName: 'dest-file-name',
        destMimeType: 'dest-mime-type',
        supportsAllDrives: false
      })
    ).toEqual('file-id')
    expect(list).toBeCalledTimes(0)
    expect(mockExport).toBeCalledWith(
      {
        fileId: 'file-id',
        mimeType: 'dest-mime-type'
      },
      { responseType: 'stream' }
    )
    expect(mockCreateWriteStream).toBeCalledWith('dest-file-name')
    expect(mockWrite).toBeCalledWith('export-data1')
    expect(mockWrite).toBeCalledWith('export-data2')
    expect(get).toBeCalledTimes(0)
    expect(mockClose).toBeCalledTimes(1)
  })

  it('should use destStream', async () => {
    const list = jest
      .fn<any, any[]>()
      .mockResolvedValue({ data: { files: [{ id: 'test-id' }] } })
    const mockExport = jest
      .fn<any, any[]>()
      .mockResolvedValue({ data: mockExportGen() })
    const get = jest.fn<any, any[]>().mockResolvedValue({ data: mockGetGen() })
    const drive: any = {
      files: {
        list,
        export: mockExport,
        get
      }
    }
    const mockDestStream = { write: jest.fn() }
    expect(
      await recvFile(drive, {
        fileId: '',
        parentId: 'parent-id',
        srcFileName: 'src-file-name',
        destFileName: 'dest-file-name',
        destMimeType: 'dest-mime-type',
        supportsAllDrives: false,
        destStream: mockDestStream as any
      })
    ).toEqual('test-id')
    expect(list).toBeCalledWith({
      fields: 'files(id, name)',
      pageSize: 10,
      q: "'parent-id' in parents and name = 'src-file-name'",
      includeItemsFromAllDrives: false,
      supportsAllDrives: false
    })
    expect(mockExport).toBeCalledWith(
      {
        fileId: 'test-id',
        mimeType: 'dest-mime-type'
      },
      { responseType: 'stream' }
    )
    expect(mockCreateWriteStream).toBeCalledTimes(0)
    expect(mockDestStream.write).toBeCalledWith('export-data1')
    expect(mockDestStream.write).toBeCalledWith('export-data2')
    expect(mockWrite).toBeCalledTimes(0)
    expect(get).toBeCalledTimes(0)
    expect(mockClose).toBeCalledTimes(0)
  })

  it('should use get() with support all drives', async () => {
    const list = jest
      .fn<any, any[]>()
      .mockResolvedValue({ data: { files: [{ id: 'test-id' }] } })
    const mockExport = jest
      .fn<any, any[]>()
      .mockResolvedValue({ data: mockExportGen() })
    const get = jest.fn<any, any[]>().mockResolvedValue({ data: mockGetGen() })
    const drive: any = {
      files: {
        list,
        export: mockExport,
        get
      }
    }
    expect(
      await recvFile(drive, {
        fileId: '',
        parentId: 'parent-id',
        srcFileName: 'src-file-name',
        destFileName: 'dest-file-name',
        destMimeType: '',
        supportsAllDrives: true
      })
    ).toEqual('test-id')
    expect(list).toBeCalledWith({
      fields: 'files(id, name)',
      pageSize: 10,
      q: "'parent-id' in parents and name = 'src-file-name'",
      includeItemsFromAllDrives: true,
      supportsAllDrives: true
    })
    expect(mockExport).toBeCalledTimes(0)
    expect(mockCreateWriteStream).toBeCalledWith('dest-file-name')
    expect(get).toBeCalledWith(
      {
        fileId: 'test-id',
        alt: 'media',
        supportsAllDrives: true
      },
      { responseType: 'stream' }
    )
    expect(mockWrite).toBeCalledWith('get-data1')
    expect(mockWrite).toBeCalledWith('get-data2')
    expect(mockClose).toBeCalledTimes(1)
  })

  it('should throw when file not found', async () => {
    const list = jest
      .fn<any, any[]>()
      .mockResolvedValue({ data: { files: [] } })
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
    await expect(res).rejects.toThrowError('The srouce file not found')
    await expect(res).rejects.toBeInstanceOf(GetFileIdError)
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
    await expect(res).rejects.toThrowError('The destination is not specified')
  })
})
