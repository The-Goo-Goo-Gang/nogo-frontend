import { networkInterfaces } from 'os'
import { getPortPromise } from 'portfinder'

export function isVmNetwork (mac: string) {
  // 常见的虚拟网卡MAC地址和厂商
  const vmNetwork = [
    '00:05:69', // vmware1
    '00:0C:29', // vmware2
    '00:50:56', // vmware3
    '00:1C:42', // parallels1
    '00:03:FF', // microsoft virtual pc
    '00:0F:4B', // virtual iron 4
    '00:16:3E', // red hat xen , oracle vm , xen source, novell xen
    '08:00:27', // virtualbox
    '00:00:00' // VPN
  ]
  return vmNetwork.some(macPerfix => mac.toUpperCase().startsWith(macPerfix.toUpperCase()))
}

export const isPortOccupied = async (port: number) => {
  const p = await getPortPromise({ port })
  return p !== port
}

export const getLocalIpAddresses = () => {
  const netDict = networkInterfaces()
  const addresses = []
  for (const devName in netDict) {
    const netList = netDict[devName]
    if (!netList) continue
    for (let i = 0; i < netList.length; i++) {
      const { address, family, internal, mac } = netList[i]
      const isvm = isVmNetwork(mac)
      if (family === 'IPv4' && address !== '127.0.0.1' && !internal && !isvm) {
        addresses.push(address)
      }
    }
  }
  return addresses
}
