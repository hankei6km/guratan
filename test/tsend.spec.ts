import { jest } from '@jest/globals'

jest.unstable_mockModule('fs', async () => {
  const mockCreateReadStream = jest.fn()
  const mockClose = jest.fn<any, any[]>()
  const reset = () => {
    mockClose.mockReset().mockImplementation((cb) => {
      setImmediate(cb)
    })
    mockCreateReadStream.mockReset().mockReturnValue({
      close: mockClose
    })
  }

  reset()
  return {
    createReadStream: mockCreateReadStream,
    _reset: reset,
    _getMocks: () => ({
      mockCreateReadStream,
      mockClose
    })
  }
})

const mockFs = await import('fs')
const { mockClose, mockCreateReadStream } = (mockFs as any)._getMocks()
const { UploadFileError, UpdateFileError, uploadFile, updateFile, sendFile } =
  await import('../src/tsend.js')

afterEach(() => {
  ;(mockFs as any)._reset()
})

describe('uploadFile()', () => {
  it('should return id of file', async () => {
    const create = jest
      .fn<any, any[]>()
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
    expect(mockCreateReadStream).toBeCalledWith('src-file-name')
    expect(create).toBeCalledWith({
      fields: 'id',
      media: {
        mimeType: 'src-mime-type',
        body: { close: mockClose }
      },
      requestBody: {
        name: 'dest-file-name',
        mimeType: 'dest-mime-type',
        parents: ['parent-id']
      }
    })
    expect(mockClose).toBeCalledTimes(1)
  })

  it('should return id of file(mimeType is blank)', async () => {
    const create = jest
      .fn<any, any[]>()
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
        srcMimeType: ''
      })
    ).toEqual('test-id')
    expect(mockCreateReadStream).toBeCalledWith('src-file-name')
    expect(create).toBeCalledWith({
      fields: 'id',
      media: {
        body: { close: mockClose }
      },
      requestBody: {
        name: 'dest-file-name',
        parents: ['parent-id']
      }
    })
    expect(mockClose).toBeCalledTimes(1)
  })

  it('should throw UploadFileError', async () => {
    const create = jest.fn<any, any[]>().mockRejectedValue({ errors: 'err' })
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
      srcMimeType: 'src-mime-type'
    })
    await expect(res).rejects.toThrowError('err')
    await expect(res).rejects.toBeInstanceOf(UploadFileError)
    expect(mockClose).toBeCalledTimes(1)
  })
})

describe('updateFile()', () => {
  it('should return id of file', async () => {
    const update = jest
      .fn<any, any[]>()
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
    expect(mockCreateReadStream).toBeCalledWith('src-file-name')
    expect(update).toBeCalledWith({
      fileId: 'file-id',
      fields: 'id',
      media: {
        mimeType: 'src-mime-type',
        body: { close: mockClose }
      },
      requestBody: {
        mimeType: 'dest-mime-type'
      }
    })
    expect(mockClose).toBeCalledTimes(1)
  })

  it('should return id of file(mimeType is blank)', async () => {
    const update = jest
      .fn<any, any[]>()
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
        srcMimeType: ''
      })
    ).toEqual('test-id')
    expect(mockCreateReadStream).toBeCalledWith('src-file-name')
    expect(update).toBeCalledWith({
      fileId: 'file-id',
      fields: 'id',
      media: {
        body: { close: mockClose }
      },
      requestBody: {}
    })
    expect(mockClose).toBeCalledTimes(1)
  })

  it('should throw UploadFileError', async () => {
    const update = jest.fn<any, any[]>().mockRejectedValue({ errors: 'err' })
    const drive: any = {
      files: {
        update
      }
    }

    const res = updateFile(drive, {
      fileId: 'file-id',
      srcFileName: 'src-file-name',
      destMimeType: 'dest-mime-type',
      srcMimeType: 'src-mime-type'
    })
    await expect(res).rejects.toThrowError('err')
    await expect(res).rejects.toBeInstanceOf(UpdateFileError)
    expect(mockClose).toBeCalledTimes(1)
  })
})

describe('sendFile()', () => {
  it('should call create', async () => {
    const list = jest
      .fn<any, any[]>()
      .mockResolvedValue({ data: { files: [{}] } })
    const create = jest
      .fn<any, any[]>()
      .mockResolvedValue({ data: { id: 'create-test-id' } })
    const update = jest
      .fn<any, any[]>()
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
    expect(list).toBeCalledWith({
      fields: 'files(id, name)',
      pageSize: 10,
      q: "'parent-id' in parents and name = 'dest-file-name'"
    })
    expect(create).toBeCalledWith({
      fields: 'id',
      media: {
        mimeType: 'src-mime-type',
        body: { close: mockClose }
      },
      requestBody: {
        name: 'dest-file-name',
        mimeType: 'dest-mime-type',
        parents: ['parent-id']
      }
    })
    expect(update).toBeCalledTimes(0)
    expect(mockClose).toBeCalledTimes(1)
  })

  it('should call update(fileId is blank)', async () => {
    const list = jest
      .fn<any, any[]>()
      .mockResolvedValue({ data: { files: [{ id: 'test-id' }] } })
    const create = jest
      .fn<any, any[]>()
      .mockResolvedValue({ data: { id: 'create-test-id' } })
    const update = jest
      .fn<any, any[]>()
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
    ).toEqual('update-test-id')
    expect(list).toBeCalledWith({
      fields: 'files(id, name)',
      pageSize: 10,
      q: "'parent-id' in parents and name = 'dest-file-name'"
    })
    expect(create).toBeCalledTimes(0)
    expect(update).toBeCalledWith({
      fileId: 'test-id',
      fields: 'id',
      media: {
        mimeType: 'src-mime-type',
        body: { close: mockClose }
      },
      requestBody: {
        mimeType: 'dest-mime-type'
      }
    })
    expect(mockClose).toBeCalledTimes(1)
  })

  it('should call update(fileId is specified)', async () => {
    const list = jest
      .fn<any, any[]>()
      .mockResolvedValue({ data: { files: [{ id: 'test-id' }] } })
    const create = jest
      .fn<any, any[]>()
      .mockResolvedValue({ data: { id: 'create-test-id' } })
    const update = jest
      .fn<any, any[]>()
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
        srcMimeType: 'src-mime-type'
      })
    ).toEqual('update-test-id')
    expect(list).toBeCalledTimes(0)
    expect(create).toBeCalledTimes(0)
    expect(update).toBeCalledWith({
      fileId: 'file-id',
      fields: 'id',
      media: {
        mimeType: 'src-mime-type',
        body: { close: mockClose }
      },
      requestBody: {
        mimeType: 'dest-mime-type'
      }
    })
    expect(mockClose).toBeCalledTimes(1)
  })
})
