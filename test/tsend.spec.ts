import { jest } from '@jest/globals'

jest.unstable_mockModule('fs', async () => {
  const mockCreateReadStream = jest.fn()
  const reset = () => {
    mockCreateReadStream.mockReset().mockReturnValue('mock-create-read-streadm')
  }

  reset()
  return {
    createReadStream: mockCreateReadStream,
    _reset: reset,
    _getMocks: () => ({
      mockCreateReadStream
    })
  }
})

const mockFs = await import('fs')
const { mockCreateReadStream } = (mockFs as any)._getMocks()
const { UploadFileError, UpdateFileError, uploadFile, updateFile, sendFile } =
  await import('../src/tsend.js')

afterEach(() => {
  ;(mockFs as any)._reset()
})

describe('uploadFile()', () => {
  it('should return id of file', async () => {
    const create = jest
      .fn<(a: any) => Promise<any>>()
      .mockResolvedValue({ data: { id: 'test-id' } })
    const drive: any = {
      files: {
        create
      }
    }

    expect(
      await uploadFile(drive, {
        parentId: 'parent-id',
        destFileName: 'dest-file-name',
        srcFileName: 'src-file-name',
        destMimeType: 'dest-mime-type',
        srcMimeType: 'src-mime-type'
      })
    ).toEqual('test-id')
    expect(mockCreateReadStream).toHaveBeenCalledWith('src-file-name')
    expect(create).toHaveBeenCalledWith({
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
  })

  it('should return id of file(supports all drives)', async () => {
    const create = jest
      .fn<(a: any) => Promise<any>>()
      .mockResolvedValue({ data: { id: 'test-id' } })
    const drive: any = {
      files: {
        create
      }
    }

    expect(
      await uploadFile(drive, {
        parentId: 'parent-id',
        destFileName: 'dest-file-name',
        srcFileName: 'src-file-name',
        destMimeType: 'dest-mime-type',
        srcMimeType: 'src-mime-type',
        supportsAllDrives: true
      })
    ).toEqual('test-id')
    expect(mockCreateReadStream).toHaveBeenCalledWith('src-file-name')
    expect(create).toHaveBeenCalledWith({
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
    const create = jest
      .fn<(a: any) => Promise<any>>()
      .mockResolvedValue({ data: { id: 'test-id' } })
    const drive: any = {
      files: {
        create
      }
    }

    expect(
      await uploadFile(drive, {
        parentId: 'parent-id',
        destFileName: 'dest-file-name',
        srcFileName: 'src-file-name',
        destMimeType: '',
        srcMimeType: '',
        supportsAllDrives: false
      })
    ).toEqual('test-id')
    expect(mockCreateReadStream).toHaveBeenCalledWith('src-file-name')
    expect(create).toHaveBeenCalledWith({
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
    const create = jest
      .fn<(a: any) => Promise<any>>()
      .mockResolvedValue({ data: { id: 'test-id' } })
    const drive: any = {
      files: {
        create
      }
    }

    expect(
      await uploadFile(drive, {
        parentId: 'parent-id',
        destFileName: 'dest-file-name',
        srcFileName: 'src-file-name',
        destMimeType: '',
        srcMimeType: '',
        supportsAllDrives: false,
        srcStream: 'src-stream' as any
      })
    ).toEqual('test-id')
    expect(mockCreateReadStream).toHaveBeenCalledTimes(0)
    expect(create).toHaveBeenCalledWith({
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
    const create = jest
      .fn<(a: any) => Promise<any>>()
      .mockRejectedValue({ errors: 'err' })
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
    await expect(res).rejects.toThrow('err')
    await expect(res).rejects.toBeInstanceOf(UploadFileError)
  })
})

describe('updateFile()', () => {
  it('should return id of file', async () => {
    const update = jest
      .fn<(a: any) => Promise<any>>()
      .mockResolvedValue({ data: { id: 'test-id' } })
    const drive: any = {
      files: {
        update
      }
    }

    expect(
      await updateFile(drive, {
        fileId: 'file-id',
        srcFileName: 'src-file-name',
        destMimeType: 'dest-mime-type',
        srcMimeType: 'src-mime-type'
      })
    ).toEqual('test-id')
    expect(mockCreateReadStream).toHaveBeenCalledWith('src-file-name')
    expect(update).toHaveBeenCalledWith({
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
    const update = jest
      .fn<(a: any) => Promise<any>>()
      .mockResolvedValue({ data: { id: 'test-id' } })
    const drive: any = {
      files: {
        update
      }
    }

    expect(
      await updateFile(drive, {
        fileId: 'file-id',
        srcFileName: 'src-file-name',
        destMimeType: 'dest-mime-type',
        srcMimeType: 'src-mime-type',
        supportsAllDrives: true
      })
    ).toEqual('test-id')
    expect(mockCreateReadStream).toHaveBeenCalledWith('src-file-name')
    expect(update).toHaveBeenCalledWith({
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
    const update = jest
      .fn<(a: any) => Promise<any>>()
      .mockResolvedValue({ data: { id: 'test-id' } })
    const drive: any = {
      files: {
        update
      }
    }

    expect(
      await updateFile(drive, {
        fileId: 'file-id',
        srcFileName: 'src-file-name',
        destMimeType: '',
        srcMimeType: '',
        supportsAllDrives: false
      })
    ).toEqual('test-id')
    expect(mockCreateReadStream).toHaveBeenCalledWith('src-file-name')
    expect(update).toHaveBeenCalledWith({
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
    const update = jest
      .fn<(a: any) => Promise<any>>()
      .mockResolvedValue({ data: { id: 'test-id' } })
    const drive: any = {
      files: {
        update
      }
    }

    expect(
      await updateFile(drive, {
        fileId: 'file-id',
        srcFileName: 'src-file-name',
        destMimeType: '',
        srcMimeType: '',
        supportsAllDrives: false,
        srcStream: 'src-stream' as any
      })
    ).toEqual('test-id')
    expect(mockCreateReadStream).toHaveBeenCalledTimes(0)
    expect(update).toHaveBeenCalledWith({
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
    const update = jest
      .fn<(a: any) => Promise<any>>()
      .mockRejectedValue({ errors: 'err' })
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
    await expect(res).rejects.toThrow('err')
    await expect(res).rejects.toBeInstanceOf(UpdateFileError)
  })
})

describe('sendFile()', () => {
  it('should call create', async () => {
    const list = jest
      .fn<(a: any) => Promise<any>>()
      .mockResolvedValue({ data: { files: [{}] } })
    const create = jest
      .fn<(a: any) => Promise<any>>()
      .mockResolvedValue({ data: { id: 'create-test-id' } })
    const update = jest
      .fn<(a: any) => Promise<any>>()
      .mockResolvedValue({ data: { id: 'update-test-id' } })
    const drive: any = {
      files: {
        list,
        create,
        update
      }
    }
    expect(
      await sendFile(drive, {
        fileId: '',
        parentId: 'parent-id',
        destFileName: 'dest-file-name',
        srcFileName: 'src-file-name',
        destMimeType: 'dest-mime-type',
        srcMimeType: 'src-mime-type'
      })
    ).toEqual('create-test-id')
    expect(list).toHaveBeenCalledWith({
      fields: 'files(id, name)',
      pageSize: 10,
      q: "'parent-id' in parents and name = 'dest-file-name'",
      includeItemsFromAllDrives: false,
      supportsAllDrives: false
    })
    expect(create).toHaveBeenCalledWith({
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
    expect(update).toHaveBeenCalledTimes(0)
  })

  it('should call create(supports all drives)', async () => {
    const list = jest
      .fn<(a: any) => Promise<any>>()
      .mockResolvedValue({ data: { files: [{}] } })
    const create = jest
      .fn<(a: any) => Promise<any>>()
      .mockResolvedValue({ data: { id: 'create-test-id' } })
    const update = jest
      .fn<(a: any) => Promise<any>>()
      .mockResolvedValue({ data: { id: 'update-test-id' } })
    const drive: any = {
      files: {
        list,
        create,
        update
      }
    }
    expect(
      await sendFile(drive, {
        fileId: '',
        parentId: 'parent-id',
        destFileName: 'dest-file-name',
        srcFileName: 'src-file-name',
        destMimeType: 'dest-mime-type',
        srcMimeType: 'src-mime-type',
        supportsAllDrives: true
      })
    ).toEqual('create-test-id')
    expect(list).toHaveBeenCalledWith({
      fields: 'files(id, name)',
      pageSize: 10,
      q: "'parent-id' in parents and name = 'dest-file-name'",
      includeItemsFromAllDrives: true,
      supportsAllDrives: true
    })
    expect(create).toHaveBeenCalledWith({
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
    expect(update).toHaveBeenCalledTimes(0)
  })

  it('should call create(pass srcStream)', async () => {
    const list = jest
      .fn<(a: any) => Promise<any>>()
      .mockResolvedValue({ data: { files: [{}] } })
    const create = jest
      .fn<(a: any) => Promise<any>>()
      .mockResolvedValue({ data: { id: 'create-test-id' } })
    const update = jest
      .fn<(a: any) => Promise<any>>()
      .mockResolvedValue({ data: { id: 'update-test-id' } })
    const drive: any = {
      files: {
        list,
        create,
        update
      }
    }
    expect(
      await sendFile(drive, {
        fileId: '',
        parentId: 'parent-id',
        destFileName: 'dest-file-name',
        srcFileName: 'src-file-name',
        destMimeType: 'dest-mime-type',
        srcMimeType: 'src-mime-type',
        supportsAllDrives: false,
        srcStream: 'src-stream' as any
      })
    ).toEqual('create-test-id')
    expect(list).toHaveBeenCalledWith({
      fields: 'files(id, name)',
      pageSize: 10,
      q: "'parent-id' in parents and name = 'dest-file-name'",
      includeItemsFromAllDrives: false,
      supportsAllDrives: false
    })
    expect(create).toHaveBeenCalledWith({
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
    expect(update).toHaveBeenCalledTimes(0)
  })

  it('should call update(fileId is blank)', async () => {
    const list = jest
      .fn<(a: any) => Promise<any>>()
      .mockResolvedValue({ data: { files: [{ id: 'test-id' }] } })
    const create = jest
      .fn<(a: any) => Promise<any>>()
      .mockResolvedValue({ data: { id: 'create-test-id' } })
    const update = jest
      .fn<(a: any) => Promise<any>>()
      .mockResolvedValue({ data: { id: 'update-test-id' } })
    const drive: any = {
      files: {
        list,
        create,
        update
      }
    }
    expect(
      await sendFile(drive, {
        fileId: '',
        parentId: 'parent-id',
        destFileName: 'dest-file-name',
        srcFileName: 'src-file-name',
        destMimeType: 'dest-mime-type',
        srcMimeType: 'src-mime-type',
        supportsAllDrives: false
      })
    ).toEqual('update-test-id')
    expect(list).toHaveBeenCalledWith({
      fields: 'files(id, name)',
      pageSize: 10,
      q: "'parent-id' in parents and name = 'dest-file-name'",
      includeItemsFromAllDrives: false,
      supportsAllDrives: false
    })
    expect(create).toHaveBeenCalledTimes(0)
    expect(update).toHaveBeenCalledWith({
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
    const list = jest
      .fn<(a: any) => Promise<any>>()
      .mockResolvedValue({ data: { files: [{ id: 'test-id' }] } })
    const create = jest
      .fn<(a: any) => Promise<any>>()
      .mockResolvedValue({ data: { id: 'create-test-id' } })
    const update = jest
      .fn<(a: any) => Promise<any>>()
      .mockResolvedValue({ data: { id: 'update-test-id' } })
    const drive: any = {
      files: {
        list,
        create,
        update
      }
    }
    expect(
      await sendFile(drive, {
        fileId: '',
        parentId: 'parent-id',
        destFileName: 'dest-file-name',
        srcFileName: 'src-file-name',
        destMimeType: 'dest-mime-type',
        srcMimeType: 'src-mime-type',
        supportsAllDrives: true
      })
    ).toEqual('update-test-id')
    expect(list).toHaveBeenCalledWith({
      fields: 'files(id, name)',
      pageSize: 10,
      q: "'parent-id' in parents and name = 'dest-file-name'",
      includeItemsFromAllDrives: true,
      supportsAllDrives: true
    })
    expect(create).toHaveBeenCalledTimes(0)
    expect(update).toHaveBeenCalledWith({
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
    const list = jest
      .fn<(a: any) => Promise<any>>()
      .mockResolvedValue({ data: { files: [{ id: 'test-id' }] } })
    const create = jest
      .fn<(a: any) => Promise<any>>()
      .mockResolvedValue({ data: { id: 'create-test-id' } })
    const update = jest
      .fn<(a: any) => Promise<any>>()
      .mockResolvedValue({ data: { id: 'update-test-id' } })
    const drive: any = {
      files: {
        list,
        create,
        update
      }
    }
    expect(
      await sendFile(drive, {
        fileId: 'file-id',
        parentId: 'parent-id',
        destFileName: 'dest-file-name',
        srcFileName: 'src-file-name',
        destMimeType: 'dest-mime-type',
        srcMimeType: 'src-mime-type',
        supportsAllDrives: false
      })
    ).toEqual('update-test-id')
    expect(list).toHaveBeenCalledTimes(0)
    expect(create).toHaveBeenCalledTimes(0)
    expect(update).toHaveBeenCalledWith({
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
    const list = jest
      .fn<(a: any) => Promise<any>>()
      .mockResolvedValue({ data: { files: [{ id: 'test-id' }] } })
    const create = jest
      .fn<(a: any) => Promise<any>>()
      .mockResolvedValue({ data: { id: 'create-test-id' } })
    const update = jest
      .fn<(a: any) => Promise<any>>()
      .mockResolvedValue({ data: { id: 'update-test-id' } })
    const drive: any = {
      files: {
        list,
        create,
        update
      }
    }
    expect(
      await sendFile(drive, {
        fileId: 'file-id',
        parentId: 'parent-id',
        destFileName: 'dest-file-name',
        srcFileName: 'src-file-name',
        destMimeType: 'dest-mime-type',
        srcMimeType: 'src-mime-type',
        supportsAllDrives: false,
        srcStream: 'src-stream' as any
      })
    ).toEqual('update-test-id')
    expect(list).toHaveBeenCalledTimes(0)
    expect(create).toHaveBeenCalledTimes(0)
    expect(update).toHaveBeenCalledWith({
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
    await expect(res).rejects.toThrow(
      'The source content is not specified'
    )
  })
})
