import { OpCode } from '@/const'
import { Plugin } from 'vue'
// import Mixin from './mixin'

const network: Plugin = {
  install (app, options) {
    // window.electronAPI.onData((opCode, data1, data2) => {
    //   console.log(opCode, data1, data2)
    // })
    // app.mixin(Mixin)
    app.config.globalProperties.$sendData = (opCode: OpCode, data1: string | undefined, data2: string | undefined) => {
      window.electronAPI.sendData(opCode, data1, data2)
    }
  }
}

export default network
