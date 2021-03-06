import { jest } from '@jest/globals'

const { CreatePermissonError, UpdatePermissonError, createPermisson } =
  await import('../src/tshare.js')

describe('createPermisson()', () => {
  it('should return id of permission', async () => {
    const list = jest
      .fn<any, any[]>()
      .mockResolvedValue({ data: { files: [{ id: 'test-id' }] } })
    const create = jest
      .fn<any, any[]>()
      .mockResolvedValue({ data: { id: 'test-id' } })
    const update = jest
      .fn<any, any[]>()
      .mockResolvedValue({ data: { id: 'test-id' } })
    const drive: any = {
      files: {
        list
      },
      permissions: {
        create,
        update
      }
    }

    expect(
      await createPermisson(drive, {
        fileId: 'test-file-id',
        parentId: 'parent-id',
        destFileName: 'dest-file-name',
        type: 'test-type',
        role: 'test-role',
        emailAddress: 'test-mail',
        domain: 'test-domain',
        view: 'test-view',
        moveToNewOwnersRoot: true,
        transferOwnership: true,
        allowFileDiscovery: true,
        sendNotificationEmail: false,
        emailMessage: 'test-message'
      })
    ).toEqual('test-id')
    expect(list).toBeCalledTimes(0)
    expect(create).toBeCalledWith({
      requestBody: {
        type: 'test-type',
        role: 'test-role',
        emailAddress: 'test-mail',
        domain: 'test-domain',
        allowFileDiscovery: true,
        view: 'test-view'
      },
      fileId: 'test-file-id',
      fields: 'id',
      moveToNewOwnersRoot: true,
      transferOwnership: true,
      sendNotificationEmail: false
    })
    expect(update).toBeCalledTimes(0) // transferOwnership が指定されているので.
  })
  it('should return id of permission(default values)', async () => {
    const list = jest
      .fn<any, any[]>()
      .mockResolvedValue({ data: { files: [{ id: 'test-id' }] } })
    const create = jest
      .fn<any, any[]>()
      .mockResolvedValue({ data: { id: 'test-id' } })
    const update = jest
      .fn<any, any[]>()
      .mockResolvedValue({ data: { id: 'test-id' } })
    const drive: any = {
      files: {
        list
      },
      permissions: {
        create,
        update
      }
    }

    expect(
      await createPermisson(drive, {
        fileId: 'test-file-id',
        parentId: 'parent-id',
        destFileName: 'dest-file-name',
        type: 'test-type',
        role: 'test-role',
        emailAddress: '',
        domain: '',
        view: '',
        emailMessage: ''
      })
    ).toEqual('test-id')
    expect(list).toBeCalledTimes(0)
    expect(create).toBeCalledWith({
      requestBody: {
        type: 'test-type',
        role: 'test-role'
      },
      fileId: 'test-file-id',
      fields: 'id'
    })
    expect(update).toBeCalledWith({
      permissionId: 'test-id',
      requestBody: {
        role: 'test-role'
      },
      fileId: 'test-file-id',
      fields: 'id'
    })
  })

  it('should return id of permission(email message)', async () => {
    const list = jest
      .fn<any, any[]>()
      .mockResolvedValue({ data: { files: [{ id: 'test-id' }] } })
    const create = jest
      .fn<any, any[]>()
      .mockResolvedValue({ data: { id: 'test-id' } })
    const update = jest
      .fn<any, any[]>()
      .mockResolvedValue({ data: { id: 'test-id' } })
    const drive: any = {
      files: {
        list
      },
      permissions: {
        create,
        update
      }
    }

    expect(
      await createPermisson(drive, {
        fileId: 'test-file-id',
        parentId: 'parent-id',
        destFileName: 'dest-file-name',
        type: 'test-type',
        role: 'test-role',
        emailAddress: '',
        domain: '',
        view: '',
        allowFileDiscovery: false,
        moveToNewOwnersRoot: false,
        transferOwnership: false,
        sendNotificationEmail: true,
        emailMessage: 'test-message'
      })
    ).toEqual('test-id')
    expect(list).toBeCalledTimes(0)
    expect(create).toBeCalledWith({
      requestBody: {
        type: 'test-type',
        role: 'test-role',
        allowFileDiscovery: false
      },
      fileId: 'test-file-id',
      fields: 'id',
      moveToNewOwnersRoot: false,
      transferOwnership: false,
      sendNotificationEmail: true,
      emailMessage: 'test-message'
    })
  })

  it('should get fileId by using getFileId()', async () => {
    const list = jest
      .fn<any, any[]>()
      .mockResolvedValue({ data: { files: [{ id: 'file-id-from-list' }] } })
    const create = jest
      .fn<any, any[]>()
      .mockResolvedValue({ data: { id: 'test-id' } })
    const update = jest
      .fn<any, any[]>()
      .mockResolvedValue({ data: { id: 'test-id' } })
    const drive: any = {
      files: {
        list
      },
      permissions: {
        create,
        update
      }
    }

    expect(
      await createPermisson(drive, {
        fileId: '',
        parentId: 'parent-id',
        destFileName: 'dest-file-name',
        type: 'test-type',
        role: 'test-role',
        emailAddress: '',
        domain: '',
        view: '',
        allowFileDiscovery: false,
        moveToNewOwnersRoot: false,
        transferOwnership: false,
        sendNotificationEmail: true,
        emailMessage: 'test-message'
      })
    ).toEqual('test-id')
    expect(list).toBeCalledWith({
      fields: 'files(id, name)',
      pageSize: 10,
      q: "'parent-id' in parents and name = 'dest-file-name'"
    })
    expect(create).toBeCalledWith({
      requestBody: {
        type: 'test-type',
        role: 'test-role',
        allowFileDiscovery: false
      },
      fileId: 'file-id-from-list',
      fields: 'id',
      moveToNewOwnersRoot: false,
      transferOwnership: false,
      sendNotificationEmail: true,
      emailMessage: 'test-message'
    })
  })

  it('should throw CreatePermissonError', async () => {
    const create = jest.fn<any, any[]>().mockRejectedValue({ errors: 'err' })
    const drive: any = {
      permissions: {
        create
      }
    }

    const res = createPermisson(drive, {
      fileId: 'test-file-id',
      parentId: 'parent-id',
      destFileName: 'dest-file-name',
      type: 'test-type',
      role: 'test-role',
      emailAddress: '',
      domain: '',
      view: '',
      allowFileDiscovery: false,
      moveToNewOwnersRoot: false,
      transferOwnership: false,
      sendNotificationEmail: true,
      emailMessage: ''
    })
    await expect(res).rejects.toThrowError('err')
    await expect(res).rejects.toBeInstanceOf(CreatePermissonError)
  })

  it('should throw UpdatePermissonError', async () => {
    const create = jest
      .fn<any, any[]>()
      .mockResolvedValue({ data: { id: 'test-id' } })
    const update = jest.fn<any, any[]>().mockRejectedValue({ errors: 'err' })
    const drive: any = {
      permissions: {
        create,
        update
      }
    }

    const res = createPermisson(drive, {
      fileId: 'test-file-id',
      parentId: 'parent-id',
      destFileName: 'dest-file-name',
      type: 'test-type',
      role: 'test-role',
      emailAddress: '',
      domain: '',
      view: '',
      allowFileDiscovery: false,
      moveToNewOwnersRoot: false,
      transferOwnership: false,
      sendNotificationEmail: true,
      emailMessage: ''
    })
    await expect(res).rejects.toThrowError('err')
    await expect(res).rejects.toBeInstanceOf(UpdatePermissonError)
  })

  it('should throw error when create() return blank id', async () => {
    const create = jest.fn<any, any[]>().mockResolvedValue({ data: { id: '' } })
    const drive: any = {
      permissions: {
        create
      }
    }

    const res = createPermisson(drive, {
      fileId: 'test-file-id',
      parentId: 'parent-id',
      destFileName: 'dest-file-name',
      type: 'test-type',
      role: 'test-role',
      emailAddress: '',
      domain: '',
      view: '',
      allowFileDiscovery: false,
      moveToNewOwnersRoot: false,
      transferOwnership: false,
      sendNotificationEmail: true,
      emailMessage: ''
    })
    await expect(res).rejects.toThrowError('blank id')
    await expect(res).rejects.toBeInstanceOf(CreatePermissonError)
  })
})
