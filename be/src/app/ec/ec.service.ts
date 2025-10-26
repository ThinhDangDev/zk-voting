import * as ed from '@noble/ed25519'
import * as ec from '@noble/secp256k1'

import { Injectable } from '@nestjs/common'
import configuration from 'config/configuration'

@Injectable()
export class ECService {
  private privateKey = BigInt('0x' + configuration().admin.privKey)
  private ecPrivateKey = BigInt('0x' + configuration().admin.ecPrivKey)

  decrypt(message: string, r: string) {
    const C = ed.Point.fromHex(message)
    const R = ed.Point.fromHex(r)
    const M = C.subtract(R.multiply(this.privateKey))
    return { message: M.toHex() }
  }

  decryptEvm(message: string, r: string) {
    const C = ec.Point.fromHex(message)
    const R = ec.Point.fromHex(r)
    const M = C.subtract(R.multiply(this.ecPrivateKey))

    return { message: { x: M.x.toString(), y: M.y.toString() } }
  }
}
