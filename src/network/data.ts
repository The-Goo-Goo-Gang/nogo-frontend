import { OpCode } from '@/const'

export class NetworkData {
  op: OpCode
  data1?: string
  data2?: string

  constructor (op: OpCode, data1?: string, data2?: string) {
    this.op = op
    if (data1 !== undefined) this.data1 = data1
    if (data2 !== undefined) this.data2 = data2
  }
}
