import { describe, it, afterEach, mock } from 'node:test'
import assert from 'node:assert/strict'

import { PassThrough } from 'stream'

const mockTdriveExports = (() => {
  const mockDriveClient = mock.fn<() => string>()
  const reset = () => {
    //mockDriveClient.mockReset().mockReturnValue('test-drive')
    mockDriveClient.mock.resetCalls()
    mockDriveClient.mock.mockImplementation(function () {
      return 'test-drive'
    })
  }

  reset()
  return {
    exports: {
      driveClient: mockDriveClient
    },
    _reset: reset,
    _getMocks: () => ({
      mockDriveClient
    })
  }
})()
mock.module('../src/tdrive.ts', { exports: mockTdriveExports.exports })

const mockTsendExports = (() => {
  const mockSendFile = mock.fn<(a: any) => Promise<any>>()
  const reset = () => {
    mockSendFile.mock.resetCalls()
    mockSendFile.mock.mockImplementation(function () {
      return Promise.resolve('test-id')
    })
  }

  reset()
  return {
    exports: {
      sendFile: mockSendFile
    },
    _reset: reset,
    _getMocks: () => ({
      mockSendFile
    })
  }
})()
mock.module('../src/tsend.ts', { exports: mockTsendExports.exports })

const mockTrecvExports = (() => {
  const mockRecvFile = mock.fn<(a: any) => Promise<any>>()
  const reset = () => {
    mockRecvFile.mock.resetCalls()
    mockRecvFile.mock.mockImplementation(function () {
      return Promise.resolve('test-id')
    })
  }

  reset()
  return {
    exports: {
      recvFile: mockRecvFile
    },
    _reset: reset,
    _getMocks: () => ({
      mockRecvFile
    })
  }
})()
mock.module('../src/trecv.ts', { exports: mockTrecvExports.exports })

const mockTshareExports = (() => {
  const mockCreatePermisson = mock.fn<(a: any) => Promise<any>>()
  const reset = () => {
    mockCreatePermisson.mock.resetCalls()
    mockCreatePermisson.mock.mockImplementation(function () {
      return Promise.resolve('test-permission-id')
    })
  }

  reset()
  return {
    exports: {
      createPermisson: mockCreatePermisson
    },
    _reset: reset,
    _getMocks: () => ({
      mockCreatePermisson
    })
  }
})()
mock.module('../src/tshare.ts', { exports: mockTshareExports.exports })

const { mockSendFile } = mockTsendExports._getMocks()
const { mockRecvFile } = mockTrecvExports._getMocks()
const { mockCreatePermisson } = mockTshareExports._getMocks()
const { cliSend, cliRecv, cliShare } = await import('../src/cli.ts')

afterEach(() => {
  mockTsendExports._reset()
  mockTrecvExports._reset()
  mockTshareExports._reset()
})

describe('cliSend()', () => {
  it('should return 0', async () => {
    const stdin = new PassThrough()
    const stdout = new PassThrough()
    const stderr = new PassThrough()
    let outData = ''
    stdout.on('data', (d) => (outData = outData + d))
    let errData = ''
    stderr.on('data', (d) => (errData = errData + d))
    assert.strictEqual(
      await cliSend({
        fileId: 'file-id',
        parentId: 'parent-id',
        destFileName: 'dest-file-name',
        srcFileName: 'src-file-name',
        destMimeType: 'dest-mime-type',
        srcMimeType: 'src-mime-type',
        pipe: false,
        printId: false,
        stdin,
        stdout,
        stderr
      }),
      0
    )
    assert.deepStrictEqual(mockSendFile.mock.calls[0].arguments, [
      'test-drive',
      {
        fileId: 'file-id',
        parentId: 'parent-id',
        destFileName: 'dest-file-name',
        srcFileName: 'src-file-name',
        destMimeType: 'dest-mime-type',
        srcMimeType: 'src-mime-type',
        supportsAllDrives: false,
        srcStream: undefined
      }
    ])
    assert.strictEqual(outData, '')
    assert.strictEqual(errData, '')
  })

  it('should use stdin', async () => {
    const stdout = new PassThrough()
    const stderr = new PassThrough()
    let outData = ''
    stdout.on('data', (d) => (outData = outData + d))
    let errData = ''
    stderr.on('data', (d) => (errData = errData + d))
    assert.strictEqual(
      await cliSend({
        fileId: 'file-id',
        parentId: 'parent-id',
        destFileName: 'dest-file-name',
        srcFileName: 'src-file-name',
        destMimeType: 'dest-mime-type',
        srcMimeType: 'src-mime-type',
        pipe: true,
        printId: false,
        supportsAllDrives: false,
        stdin: 'std-in' as any,
        stdout,
        stderr
      }),
      0
    )
    assert.deepStrictEqual(mockSendFile.mock.calls[0].arguments, [
      'test-drive',
      {
        fileId: 'file-id',
        parentId: 'parent-id',
        destFileName: 'dest-file-name',
        srcFileName: 'src-file-name',
        destMimeType: 'dest-mime-type',
        srcMimeType: 'src-mime-type',
        srcStream: 'std-in',
        supportsAllDrives: false
      }
    ])
    assert.strictEqual(outData, '')
    assert.strictEqual(errData, '')
  })

  it('should print id', async () => {
    const stdin = new PassThrough()
    const stdout = new PassThrough()
    const stderr = new PassThrough()
    let outData = ''
    stdout.on('data', (d) => (outData = outData + d))
    let errData = ''
    stderr.on('data', (d) => (errData = errData + d))
    assert.strictEqual(
      await cliSend({
        fileId: 'file-id',
        parentId: 'parent-id',
        destFileName: 'dest-file-name',
        srcFileName: 'src-file-name',
        destMimeType: 'mime-type',
        srcMimeType: 'src-mime-type',
        supportsAllDrives: false,
        pipe: false,
        printId: true,
        stdin,
        stdout,
        stderr
      }),
      0
    )
    assert.deepStrictEqual(mockSendFile.mock.calls[0].arguments, [
      'test-drive',
      {
        fileId: 'file-id',
        parentId: 'parent-id',
        destFileName: 'dest-file-name',
        srcFileName: 'src-file-name',
        destMimeType: 'mime-type',
        srcMimeType: 'src-mime-type',
        supportsAllDrives: false,
        srcStream: undefined
      }
    ])
    assert.strictEqual(outData, 'test-id')
    assert.strictEqual(errData, '')
  })

  it('should supports all drives', async () => {
    const stdin = new PassThrough()
    const stdout = new PassThrough()
    const stderr = new PassThrough()
    let outData = ''
    stdout.on('data', (d) => (outData = outData + d))
    let errData = ''
    stderr.on('data', (d) => (errData = errData + d))
    assert.strictEqual(
      await cliSend({
        fileId: 'file-id',
        parentId: 'parent-id',
        destFileName: 'dest-file-name',
        srcFileName: 'src-file-name',
        destMimeType: 'mime-type',
        srcMimeType: 'src-mime-type',
        supportsAllDrives: true,
        pipe: false,
        printId: true,
        stdin,
        stdout,
        stderr
      }),
      0
    )
    assert.deepStrictEqual(mockSendFile.mock.calls[0].arguments, [
      'test-drive',
      {
        fileId: 'file-id',
        parentId: 'parent-id',
        destFileName: 'dest-file-name',
        srcFileName: 'src-file-name',
        destMimeType: 'mime-type',
        srcMimeType: 'src-mime-type',
        supportsAllDrives: true,
        srcStream: undefined
      }
    ])
    assert.strictEqual(outData, 'test-id')
    assert.strictEqual(errData, '')
  })
})

describe('cliRecv()', () => {
  it('should return 0', async () => {
    const stdin = new PassThrough()
    const stdout = new PassThrough()
    const stderr = new PassThrough()
    let outData = ''
    stdout.on('data', (d) => (outData = outData + d))
    let errData = ''
    stderr.on('data', (d) => (errData = errData + d))
    assert.strictEqual(
      await cliRecv({
        fileId: 'file-id',
        parentId: 'parent-id',
        srcFileName: 'src-file-name',
        destFileName: 'dest-file-name',
        destMimeType: 'dest-mime-type',
        pipe: false,
        printId: false,
        removeBom: false,
        stdin,
        stdout,
        stderr
      }),
      0
    )
    assert.deepStrictEqual(mockRecvFile.mock.calls[0].arguments, [
      'test-drive',
      {
        fileId: 'file-id',
        parentId: 'parent-id',
        srcFileName: 'src-file-name',
        destFileName: 'dest-file-name',
        destMimeType: 'dest-mime-type',
        supportsAllDrives: false,
        removeBom: false,
        destStream: undefined
      }
    ])
    assert.strictEqual(outData, '')
    assert.strictEqual(errData, '')
  })

  it('should use stdout', async () => {
    const stdin = new PassThrough()
    const stderr = new PassThrough()
    let errData = ''
    stderr.on('data', (d) => (errData = errData + d))
    assert.strictEqual(
      await cliRecv({
        fileId: 'file-id',
        parentId: 'parent-id',
        srcFileName: 'src-file-name',
        destFileName: 'dest-file-name',
        destMimeType: 'dest-mime-type',
        pipe: true,
        printId: false,
        supportsAllDrives: false,
        removeBom: false,
        stdin,
        stdout: 'std-out' as any,
        stderr
      }),
      0
    )
    assert.deepStrictEqual(mockRecvFile.mock.calls[0].arguments, [
      'test-drive',
      {
        fileId: 'file-id',
        parentId: 'parent-id',
        srcFileName: 'src-file-name',
        destFileName: 'dest-file-name',
        destMimeType: 'dest-mime-type',
        destStream: 'std-out',
        supportsAllDrives: false,
        removeBom: false
      }
    ])
    assert.strictEqual(errData, '')
  })

  it('should print id', async () => {
    const stdin = new PassThrough()
    const stdout = new PassThrough()
    const stderr = new PassThrough()
    let outData = ''
    stdout.on('data', (d) => (outData = outData + d))
    let errData = ''
    stderr.on('data', (d) => (errData = errData + d))
    assert.strictEqual(
      await cliRecv({
        fileId: 'file-id',
        parentId: 'parent-id',
        srcFileName: 'src-file-name',
        destFileName: 'dest-file-name',
        destMimeType: 'mime-type',
        supportsAllDrives: false,
        pipe: false,
        removeBom: false,
        printId: true,
        stdin,
        stdout,
        stderr
      }),
      0
    )
    assert.deepStrictEqual(mockRecvFile.mock.calls[0].arguments, [
      'test-drive',
      {
        fileId: 'file-id',
        parentId: 'parent-id',
        srcFileName: 'src-file-name',
        destFileName: 'dest-file-name',
        destMimeType: 'mime-type',
        supportsAllDrives: false,
        removeBom: false,
        destStream: undefined
      }
    ])
    assert.strictEqual(outData, 'test-id')
    assert.strictEqual(errData, '')
  })

  it('should supports all drives', async () => {
    const stdin = new PassThrough()
    const stdout = new PassThrough()
    const stderr = new PassThrough()
    let outData = ''
    stdout.on('data', (d) => (outData = outData + d))
    let errData = ''
    stderr.on('data', (d) => (errData = errData + d))
    assert.strictEqual(
      await cliRecv({
        fileId: 'file-id',
        parentId: 'parent-id',
        srcFileName: 'src-file-name',
        destFileName: 'dest-file-name',
        destMimeType: 'dest-mime-type',
        pipe: false,
        printId: false,
        removeBom: false,
        supportsAllDrives: true,
        stdin,
        stdout,
        stderr
      }),
      0
    )
    assert.deepStrictEqual(mockRecvFile.mock.calls[0].arguments, [
      'test-drive',
      {
        fileId: 'file-id',
        parentId: 'parent-id',
        srcFileName: 'src-file-name',
        destFileName: 'dest-file-name',
        destMimeType: 'dest-mime-type',
        supportsAllDrives: true,
        removeBom: false,
        destStream: undefined
      }
    ])
    assert.strictEqual(outData, '')
    assert.strictEqual(errData, '')
  })
})

describe('cliShare()', () => {
  it('should return 0', async () => {
    const stdin = new PassThrough()
    const stdout = new PassThrough()
    const stderr = new PassThrough()
    let outData = ''
    stdout.on('data', (d) => (outData = outData + d))
    let errData = ''
    stderr.on('data', (d) => (errData = errData + d))
    assert.strictEqual(
      await cliShare({
        fileId: 'test-file-id',
        parentId: 'parent-id',
        destFileName: 'dest-file-name',
        type: 'test-type',
        role: 'test-role',
        emailAddress: 'test-email-address',
        domain: 'test-domain',
        view: 'test-view',
        allowFileDiscovery: false,
        moveToNewOwnersRoot: false,
        transferOwnership: false,
        sendNotificationEmail: true,
        emailMessage: 'test-message',
        printId: false,
        stdin,
        stdout,
        stderr
      }),
      0
    )
    assert.deepStrictEqual(mockCreatePermisson.mock.calls[0].arguments, [
      'test-drive',
      {
        fileId: 'test-file-id',
        parentId: 'parent-id',
        destFileName: 'dest-file-name',
        type: 'test-type',
        role: 'test-role',
        emailAddress: 'test-email-address',
        domain: 'test-domain',
        view: 'test-view',
        allowFileDiscovery: false,
        moveToNewOwnersRoot: false,
        transferOwnership: false,
        sendNotificationEmail: true,
        emailMessage: 'test-message',
        supportsAllDrives: false
      }
    ])
    assert.strictEqual(outData, '')
    assert.strictEqual(errData, '')
  })

  it('should supports all drives', async () => {
    const stdin = new PassThrough()
    const stdout = new PassThrough()
    const stderr = new PassThrough()
    let outData = ''
    stdout.on('data', (d) => (outData = outData + d))
    let errData = ''
    stderr.on('data', (d) => (errData = errData + d))
    assert.strictEqual(
      await cliShare({
        fileId: 'test-file-id',
        parentId: 'parent-id',
        destFileName: 'dest-file-name',
        type: 'test-type',
        role: 'test-role',
        emailAddress: 'test-email-address',
        domain: 'test-domain',
        view: 'test-view',
        allowFileDiscovery: false,
        moveToNewOwnersRoot: false,
        transferOwnership: false,
        sendNotificationEmail: true,
        emailMessage: 'test-message',
        supportsAllDrives: true,
        printId: false,
        stdin,
        stdout,
        stderr
      }),
      0
    )
    assert.deepStrictEqual(mockCreatePermisson.mock.calls[0].arguments, [
      'test-drive',
      {
        fileId: 'test-file-id',
        parentId: 'parent-id',
        destFileName: 'dest-file-name',
        type: 'test-type',
        role: 'test-role',
        emailAddress: 'test-email-address',
        domain: 'test-domain',
        view: 'test-view',
        allowFileDiscovery: false,
        moveToNewOwnersRoot: false,
        transferOwnership: false,
        sendNotificationEmail: true,
        emailMessage: 'test-message',
        supportsAllDrives: true
      }
    ])
    assert.strictEqual(outData, '')
    assert.strictEqual(errData, '')
  })

  it('should print id', async () => {
    const stdin = new PassThrough()
    const stdout = new PassThrough()
    const stderr = new PassThrough()
    let outData = ''
    stdout.on('data', (d) => (outData = outData + d))
    let errData = ''
    stderr.on('data', (d) => (errData = errData + d))
    assert.strictEqual(
      await cliShare({
        fileId: 'test-file-id',
        parentId: 'parent-id',
        destFileName: 'dest-file-name',
        type: 'test-type',
        role: 'test-role',
        emailAddress: 'test-email-address',
        domain: 'test-domain',
        view: 'test-view',
        allowFileDiscovery: false,
        moveToNewOwnersRoot: false,
        transferOwnership: false,
        sendNotificationEmail: true,
        emailMessage: 'test-message',
        supportsAllDrives: false,
        printId: true,
        stdin,
        stdout,
        stderr
      }),
      0
    )
    assert.deepStrictEqual(mockCreatePermisson.mock.calls[0].arguments, [
      'test-drive',
      {
        fileId: 'test-file-id',
        parentId: 'parent-id',
        destFileName: 'dest-file-name',
        type: 'test-type',
        role: 'test-role',
        emailAddress: 'test-email-address',
        domain: 'test-domain',
        view: 'test-view',
        allowFileDiscovery: false,
        moveToNewOwnersRoot: false,
        transferOwnership: false,
        sendNotificationEmail: true,
        emailMessage: 'test-message',
        supportsAllDrives: false
      }
    ])
    assert.strictEqual(outData, 'test-permission-id')
    assert.strictEqual(errData, '')
  })
})
