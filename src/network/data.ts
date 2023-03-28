import { OpCode } from '@/const'

export class NetworkData {
  op: OpCode
  data1?: string
  data2?: string

  constructor (op: OpCode, data1: string | null = null, data2: string | null = null) {
    this.op = op
    if (data1) this.data1 = data1
    if (data2) this.data2 = data2
  }
}
