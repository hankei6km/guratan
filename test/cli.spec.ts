import { PassThrough } from 'stream'
import { jest } from '@jest/globals'

jest.unstable_mockModule('../src/tdrive.js', async () => {
  const mockDriveClient = jest.fn()
  const reset = () => {
    mockDriveClient.mockReset().mockReturnValue('test-drive')
  }

  reset()
  return {
    driveClient: mockDriveClient,
    _reset: reset,
    _getMocks: () => ({
      mockDriveClient
    })
  }
})

jest.unstable_mockModule('../src/tsend.js', async () => {
  const mockSendFile = jest.fn<any, any[]>()
  const reset = () => {
    mockSendFile.mockReset().mockResolvedValue('test-id')
  }

  reset()
  return {
    sendFile: mockSendFile,
    _reset: reset,
    _getMocks: () => ({
      mockSendFile
    })
  }
})

jest.unstable_mockModule('../src/trecv.js', async () => {
  const mockRecvFile = jest.fn<any, any[]>()
  const reset = () => {
    mockRecvFile.mockReset().mockResolvedValue('test-id')
  }

  reset()
  return {
    recvFile: mockRecvFile,
    _reset: reset,
    _getMocks: () => ({
      mockRecvFile
    })
  }
})

jest.unstable_mockModule('../src/tshare.js', async () => {
  const mockCreatePermisson = jest.fn<any, any[]>()
  const reset = () => {
    mockCreatePermisson.mockReset().mockResolvedValue('test-permission-id')
  }

  reset()
  return {
    createPermisson: mockCreatePermisson,
    _reset: reset,
    _getMocks: () => ({
      mockCreatePermisson
    })
  }
})

const mockTsend = await import('../src/tsend.js')
const mockTrecv = await import('../src/trecv.js')
const mockTshare = await import('../src/tshare.js')
const { mockSendFile } = (mockTsend as any)._getMocks()
const { mockRecvFile } = (mockTrecv as any)._getMocks()
const { mockCreatePermisson } = (mockTshare as any)._getMocks()
const { cliSend, cliRecv, cliShare } = await import('../src/cli.js')

afterEach(() => {
  ;(mockTsend as any)._reset()
  ;(mockTrecv as any)._reset()
  ;(mockTshare as any)._reset()
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
    expect(
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
      })
    ).toEqual(0)
    expect(mockSendFile).toBeCalledWith('test-drive', {
      fileId: 'file-id',
      parentId: 'parent-id',
      destFileName: 'dest-file-name',
      srcFileName: 'src-file-name',
      destMimeType: 'dest-mime-type',
      srcMimeType: 'src-mime-type'
    })
    expect(outData).toEqual('')
    expect(errData).toEqual('')
  })

  it('should use stdin', async () => {
    const stdout = new PassThrough()
    const stderr = new PassThrough()
    let outData = ''
    stdout.on('data', (d) => (outData = outData + d))
    let errData = ''
    stderr.on('data', (d) => (errData = errData + d))
    expect(
      await cliSend({
        fileId: 'file-id',
        parentId: 'parent-id',
        destFileName: 'dest-file-name',
        srcFileName: 'src-file-name',
        destMimeType: 'dest-mime-type',
        srcMimeType: 'src-mime-type',
        pipe: true,
        printId: false,
        stdin: 'std-in' as any,
        stdout,
        stderr
      })
    ).toEqual(0)
    expect(mockSendFile).toBeCalledWith('test-drive', {
      fileId: 'file-id',
      parentId: 'parent-id',
      destFileName: 'dest-file-name',
      srcFileName: 'src-file-name',
      destMimeType: 'dest-mime-type',
      srcMimeType: 'src-mime-type',
      srcStream: 'std-in'
    })
    expect(outData).toEqual('')
    expect(errData).toEqual('')
  })

  it('should print id', async () => {
    const stdin = new PassThrough()
    const stdout = new PassThrough()
    const stderr = new PassThrough()
    let outData = ''
    stdout.on('data', (d) => (outData = outData + d))
    let errData = ''
    stderr.on('data', (d) => (errData = errData + d))
    expect(
      await cliSend({
        fileId: 'file-id',
        parentId: 'parent-id',
        destFileName: 'dest-file-name',
        srcFileName: 'src-file-name',
        destMimeType: 'mime-type',
        srcMimeType: 'src-mime-type',
        pipe: false,
        printId: true,
        stdin,
        stdout,
        stderr
      })
    ).toEqual(0)
    expect(mockSendFile).toBeCalledWith('test-drive', {
      fileId: 'file-id',
      parentId: 'parent-id',
      destFileName: 'dest-file-name',
      srcFileName: 'src-file-name',
      destMimeType: 'mime-type',
      srcMimeType: 'src-mime-type'
    })
    expect(outData).toEqual('test-id')
    expect(errData).toEqual('')
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
    expect(
      await cliRecv({
        fileId: 'file-id',
        parentId: 'parent-id',
        srcFileName: 'src-file-name',
        destFileName: 'dest-file-name',
        destMimeType: 'dest-mime-type',
        pipe: false,
        printId: false,
        stdin,
        stdout,
        stderr
      })
    ).toEqual(0)
    expect(mockRecvFile).toBeCalledWith('test-drive', {
      fileId: 'file-id',
      parentId: 'parent-id',
      srcFileName: 'src-file-name',
      destFileName: 'dest-file-name',
      destMimeType: 'dest-mime-type'
    })
    expect(outData).toEqual('')
    expect(errData).toEqual('')
  })

  it('should use stdout', async () => {
    const stdin = new PassThrough()
    const stderr = new PassThrough()
    let errData = ''
    stderr.on('data', (d) => (errData = errData + d))
    expect(
      await cliRecv({
        fileId: 'file-id',
        parentId: 'parent-id',
        srcFileName: 'src-file-name',
        destFileName: 'dest-file-name',
        destMimeType: 'dest-mime-type',
        pipe: true,
        printId: false,
        stdin,
        stdout: 'std-out' as any,
        stderr
      })
    ).toEqual(0)
    expect(mockRecvFile).toBeCalledWith('test-drive', {
      fileId: 'file-id',
      parentId: 'parent-id',
      srcFileName: 'src-file-name',
      destFileName: 'dest-file-name',
      destMimeType: 'dest-mime-type',
      destStream: 'std-out'
    })
    expect(errData).toEqual('')
  })

  it('should print id', async () => {
    const stdin = new PassThrough()
    const stdout = new PassThrough()
    const stderr = new PassThrough()
    let outData = ''
    stdout.on('data', (d) => (outData = outData + d))
    let errData = ''
    stderr.on('data', (d) => (errData = errData + d))
    expect(
      await cliRecv({
        fileId: 'file-id',
        parentId: 'parent-id',
        srcFileName: 'src-file-name',
        destFileName: 'dest-file-name',
        destMimeType: 'mime-type',
        pipe: false,
        printId: true,
        stdin,
        stdout,
        stderr
      })
    ).toEqual(0)
    expect(mockRecvFile).toBeCalledWith('test-drive', {
      fileId: 'file-id',
      parentId: 'parent-id',
      srcFileName: 'src-file-name',
      destFileName: 'dest-file-name',
      destMimeType: 'mime-type'
    })
    expect(outData).toEqual('test-id')
    expect(errData).toEqual('')
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
    expect(
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
      })
    ).toEqual(0)
    expect(mockCreatePermisson).toBeCalledWith('test-drive', {
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
      emailMessage: 'test-message'
    })
    expect(outData).toEqual('')
    expect(errData).toEqual('')
  })

  it('should print id', async () => {
    const stdin = new PassThrough()
    const stdout = new PassThrough()
    const stderr = new PassThrough()
    let outData = ''
    stdout.on('data', (d) => (outData = outData + d))
    let errData = ''
    stderr.on('data', (d) => (errData = errData + d))
    expect(
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
        printId: true,
        stdin,
        stdout,
        stderr
      })
    ).toEqual(0)
    expect(mockCreatePermisson).toBeCalledWith('test-drive', {
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
      emailMessage: 'test-message'
    })
    expect(outData).toEqual('test-permission-id')
    expect(errData).toEqual('')
  })
})
