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
const mockTshare = await import('../src/tshare.js')
const { mockSendFile } = (mockTsend as any)._getMocks()
const { mockCreatePermisson } = (mockTshare as any)._getMocks()
const { cliSend, cliShare } = await import('../src/cli.js')

afterEach(() => {
  ;(mockTsend as any)._reset()
  ;(mockTshare as any)._reset()
})

describe('cliSend()', () => {
  it('should return 0', async () => {
    const stdout = new PassThrough()
    const stderr = new PassThrough()
    let outData = ''
    stdout.on('data', (d) => (outData = outData + d))
    let errData = ''
    stderr.on('data', (d) => (errData = errData + d))
    expect(
      await cliSend({
        parentId: 'parent-id',
        destFileName: 'dest-file-name',
        srcFileName: 'src-file-name',
        destMimeType: 'dest-mime-type',
        srcMimeType: 'src-mime-type',
        printId: false,
        stdout,
        stderr
      })
    ).toEqual(0)
    expect(mockSendFile).toBeCalledWith('test-drive', {
      parentId: 'parent-id',
      destFileName: 'dest-file-name',
      srcFileName: 'src-file-name',
      destMimeType: 'dest-mime-type',
      srcMimeType: 'src-mime-type'
    })
    expect(outData).toEqual('')
    expect(errData).toEqual('')
  })

  it('should print id', async () => {
    const stdout = new PassThrough()
    const stderr = new PassThrough()
    let outData = ''
    stdout.on('data', (d) => (outData = outData + d))
    let errData = ''
    stderr.on('data', (d) => (errData = errData + d))
    expect(
      await cliSend({
        parentId: 'parent-id',
        destFileName: 'dest-file-name',
        srcFileName: 'src-file-name',
        destMimeType: 'mime-type',
        srcMimeType: 'src-mime-type',
        printId: true,
        stdout,
        stderr
      })
    ).toEqual(0)
    expect(mockSendFile).toBeCalledWith('test-drive', {
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

describe('cliShare()', () => {
  it('should return 0', async () => {
    const stdout = new PassThrough()
    const stderr = new PassThrough()
    let outData = ''
    stdout.on('data', (d) => (outData = outData + d))
    let errData = ''
    stderr.on('data', (d) => (errData = errData + d))
    expect(
      await cliShare({
        fileId: 'test-file-id',
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
        stdout,
        stderr
      })
    ).toEqual(0)
    expect(mockCreatePermisson).toBeCalledWith('test-drive', {
      fileId: 'test-file-id',
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
    const stdout = new PassThrough()
    const stderr = new PassThrough()
    let outData = ''
    stdout.on('data', (d) => (outData = outData + d))
    let errData = ''
    stderr.on('data', (d) => (errData = errData + d))
    expect(
      await cliShare({
        fileId: 'test-file-id',
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
        stdout,
        stderr
      })
    ).toEqual(0)
    expect(mockCreatePermisson).toBeCalledWith('test-drive', {
      fileId: 'test-file-id',
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
