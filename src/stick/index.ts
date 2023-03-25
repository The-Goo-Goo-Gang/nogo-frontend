import { EventEmitter } from 'events'

export class Stick {
  private strBuffer: string
  private eventEmitter: EventEmitter

  constructor () {
    this.strBuffer = ''
    this.eventEmitter = new EventEmitter()
  }

  onData (listener: (data: string) => void): void {
    this.eventEmitter.on('data', listener)
  }

  pushData (newData: string): void {
    this.strBuffer += newData
    const arr = this.strBuffer.split('\n')
    if (arr.length > 1) {
      const data = arr.shift()
      this.strBuffer = arr.join('\n')
      this.eventEmitter.emit('data', data)
    }
  }
}
