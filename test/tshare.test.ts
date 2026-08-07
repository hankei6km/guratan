import { describe, it, afterEach, mock } from 'node:test'
import assert from 'node:assert/strict'

const { CreatePermissonError, UpdatePermissonError, createPermisson } =
  await import('../src/tshare.ts')

describe('createPermisson()', () => {
  it('should return id of permission', async () => {
    const list = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { files: [{ id: 'test-id' }] } })
    )
    const create = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { id: 'test-id' } })
    )
    const update = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { id: 'test-id' } })
    )
    const drive: any = {
      files: {
        list
      },
      permissions: {
        create,
        update
      }
    }

    assert.strictEqual(
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
      }),
      'test-id'
    )
    assert.strictEqual(list.mock.callCount(), 0)
    assert.deepStrictEqual(create.mock.calls[0].arguments[0], {
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
      sendNotificationEmail: false,
      supportsAllDrives: false
    })
    assert.strictEqual(update.mock.callCount(), 0) // transferOwnership が指定されているので.
  })

  it('should return id of permission(supports all drives)', async () => {
    const list = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { files: [{ id: 'test-id' }] } })
    )
    const create = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { id: 'test-id' } })
    )
    const update = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { id: 'test-id' } })
    )
    const drive: any = {
      files: {
        list
      },
      permissions: {
        create,
        update
      }
    }

    assert.strictEqual(
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
        emailMessage: 'test-message',
        supportsAllDrives: true
      }),
      'test-id'
    )
    assert.strictEqual(list.mock.callCount(), 0)
    assert.deepStrictEqual(create.mock.calls[0].arguments[0], {
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
      sendNotificationEmail: false,
      supportsAllDrives: true
    })
    assert.strictEqual(update.mock.callCount(), 0) // transferOwnership が指定されているので.
  })

  it('should return id of permission(default values)', async () => {
    const list = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { files: [{ id: 'test-id' }] } })
    )
    const create = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { id: 'test-id' } })
    )
    const update = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { id: 'test-id' } })
    )
    const drive: any = {
      files: {
        list
      },
      permissions: {
        create,
        update
      }
    }

    assert.strictEqual(
      await createPermisson(drive, {
        fileId: 'test-file-id',
        parentId: 'parent-id',
        destFileName: 'dest-file-name',
        type: 'test-type',
        role: 'test-role',
        emailAddress: '',
        domain: '',
        view: '',
        emailMessage: '',
        supportsAllDrives: false
      }),
      'test-id'
    )
    assert.strictEqual(list.mock.callCount(), 0)
    assert.deepStrictEqual(create.mock.calls[0].arguments[0], {
      requestBody: {
        type: 'test-type',
        role: 'test-role'
      },
      fileId: 'test-file-id',
      fields: 'id',
      supportsAllDrives: false
    })
    assert.deepStrictEqual(update.mock.calls[0].arguments[0], {
      permissionId: 'test-id',
      requestBody: {
        role: 'test-role'
      },
      fileId: 'test-file-id',
      fields: 'id',
      supportsAllDrives: false
    })
  })

  it('should return id of permission(default values and support all drives)', async () => {
    const list = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { files: [{ id: 'test-id' }] } })
    )
    const create = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { id: 'test-id' } })
    )
    const update = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { id: 'test-id' } })
    )
    const drive: any = {
      files: {
        list
      },
      permissions: {
        create,
        update
      }
    }

    assert.strictEqual(
      await createPermisson(drive, {
        fileId: 'test-file-id',
        parentId: 'parent-id',
        destFileName: 'dest-file-name',
        type: 'test-type',
        role: 'test-role',
        emailAddress: '',
        domain: '',
        view: '',
        emailMessage: '',
        supportsAllDrives: true
      }),
      'test-id'
    )
    assert.strictEqual(list.mock.callCount(), 0)
    assert.deepStrictEqual(create.mock.calls[0].arguments[0], {
      requestBody: {
        type: 'test-type',
        role: 'test-role'
      },
      fileId: 'test-file-id',
      fields: 'id',
      supportsAllDrives: true
    })
    assert.deepStrictEqual(update.mock.calls[0].arguments[0], {
      permissionId: 'test-id',
      requestBody: {
        role: 'test-role'
      },
      fileId: 'test-file-id',
      fields: 'id',
      supportsAllDrives: true
    })
  })

  it('should return id of permission(email message)', async () => {
    const list = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { files: [{ id: 'test-id' }] } })
    )
    const create = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { id: 'test-id' } })
    )
    const update = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { id: 'test-id' } })
    )
    const drive: any = {
      files: {
        list
      },
      permissions: {
        create,
        update
      }
    }

    assert.strictEqual(
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
        emailMessage: 'test-message',
        supportsAllDrives: false
      }),
      'test-id'
    )
    assert.strictEqual(list.mock.callCount(), 0)
    assert.deepStrictEqual(create.mock.calls[0].arguments[0], {
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
      emailMessage: 'test-message',
      supportsAllDrives: false
    })
  })

  it('should get fileId by using getFileId()(support all drives)', async () => {
    const list = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { files: [{ id: 'file-id-from-list' }] } })
    )
    const create = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { id: 'test-id' } })
    )
    const update = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { id: 'test-id' } })
    )
    const drive: any = {
      files: {
        list
      },
      permissions: {
        create,
        update
      }
    }

    assert.strictEqual(
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
        emailMessage: 'test-message',
        supportsAllDrives: true
      }),
      'test-id'
    )
    assert.deepStrictEqual(list.mock.calls[0].arguments[0], {
      fields: 'files(id, name)',
      pageSize: 10,
      q: "'parent-id' in parents and name = 'dest-file-name'",
      includeItemsFromAllDrives: true,
      supportsAllDrives: true
    })
    assert.deepStrictEqual(create.mock.calls[0].arguments[0], {
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
      emailMessage: 'test-message',
      supportsAllDrives: true
    })
  })

  it('should get fileId by using getFileId()', async () => {
    const list = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { files: [{ id: 'file-id-from-list' }] } })
    )
    const create = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { id: 'test-id' } })
    )
    const update = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { id: 'test-id' } })
    )
    const drive: any = {
      files: {
        list
      },
      permissions: {
        create,
        update
      }
    }

    assert.strictEqual(
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
        emailMessage: 'test-message',
        supportsAllDrives: false
      }),
      'test-id'
    )
    assert.deepStrictEqual(list.mock.calls[0].arguments[0], {
      fields: 'files(id, name)',
      pageSize: 10,
      q: "'parent-id' in parents and name = 'dest-file-name'",
      includeItemsFromAllDrives: false,
      supportsAllDrives: false
    })
    assert.deepEqual(create.mock.calls[0].arguments[0], {
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
      emailMessage: 'test-message',
      supportsAllDrives: false
    })
  })

  it('should throw CreatePermissonError', async () => {
    const create = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.reject({ errors: 'err' })
    )
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
      emailMessage: '',
      supportsAllDrives: false
    })
    await assert.rejects(res, (err: Error) => {
      assert.strictEqual(err.message, '"err"')
      assert.ok(err instanceof CreatePermissonError)
      return true
    })
  })

  it('should throw UpdatePermissonError', async () => {
    const create = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { id: 'test-id' } })
    )
    const update = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.reject({ errors: 'err' })
    )
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
      emailMessage: '',
      supportsAllDrives: false
    })
    await assert.rejects(res, (err: Error) => {
      assert.strictEqual(err.message, '"err"')
      assert.ok(err instanceof UpdatePermissonError)
      return true
    })
  })

  it('should throw error when create() return blank id', async () => {
    const create = mock.fn<(a: any) => Promise<any>>(() =>
      Promise.resolve({ data: { id: '' } })
    )
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
      emailMessage: '',
      supportsAllDrives: false
    })
    //await expect(res).rejects.toThrow('blank id')
    //await expect(res).rejects.toBeInstanceOf(CreatePermissonError)
    await assert.rejects(res, (err: any) => {
      assert.strictEqual(
        err.message,
        'drive.permissions.create() return blank id '
      )
      assert.ok(err instanceof CreatePermissonError)
      return true
    })
  })
})
