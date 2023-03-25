import { OpCode } from '@/const'

export class NetworkData {
  op: OpCode
  data1: string | null
  data2: string | null

  constructor (op: OpCode, data1: string | null = null, data2: string | null = null) {
    this.op = op
    this.data1 = data1
    this.data2 = data2
  }
}
