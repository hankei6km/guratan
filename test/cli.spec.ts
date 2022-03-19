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

const mockTsend = await import('../src/tsend.js')
const { mockSendFile } = (mockTsend as any)._getMocks()
const { cliSend } = await import('../src/cli.js')

afterEach(() => {
  ;(mockTsend as any)._reset()
})

describe('cli()', () => {
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
        printId: false,
        stdout,
        stderr
      })
    ).toEqual(0)
    expect(mockSendFile).toBeCalledWith(
      'test-drive',
      'parent-id',
      'dest-file-name',
      'src-file-name'
    )
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
        printId: true,
        stdout,
        stderr
      })
    ).toEqual(0)
    expect(mockSendFile).toBeCalledWith(
      'test-drive',
      'parent-id',
      'dest-file-name',
      'src-file-name'
    )
    expect(outData).toEqual('test-id')
    expect(errData).toEqual('')
  })
})
