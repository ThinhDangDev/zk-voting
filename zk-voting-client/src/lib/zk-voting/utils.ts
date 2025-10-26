import * as secp256k1 from "@noble/secp256k1";
import { bytesToHex } from "@noble/hashes/utils";
import { keccak_256 } from "@noble/hashes/sha3";

/**
 * Xor multiple buffers.
 * @param arr The buffer list.
 * @returns Uint8Array
 */
export const xor = (...arr: Uint8Array[]): Uint8Array => {
  if (!arr || !arr.length) throw new Error("Cannot XOR empty input.");
  const [init, ...rest] = arr;
  return rest.reduce((result, next) => {
    if (result.length !== init.length)
      throw new Error("Cannot XOR different length inputs.");
    return result.map((el, i) => el ^ next[i]);
  }, init);
};

export const BSGS = async (points: secp256k1.Point[]) => {
  const P = secp256k1.Point.BASE;
  const result: number[] = [];
  for (const G of points) {
    for (let j = 1; j <= 100; j++) {
      if (secp256k1.Point.ZERO.equals(G)) {
        result.push(0);
        break;
      }
      if (P.multiply(BigInt(j)).equals(G)) {
        result.push(j);
        break;
      }
    }
  }
  return result;
};

export const toEvmAddress = (pubkey: Uint8Array) => {
  try {
    const point = secp256k1.Point.fromHex(secp256k1.etc.bytesToHex(pubkey));
    const pub = point.toBytes().subarray(1);
    const hash = bytesToHex(keccak_256(pub).slice(-20));
    const address = `0x${hash}`;
    return address;
  } catch (er) {
    return "";
  }
};

export const randomKeypair = () => {
  const priv = secp256k1.utils.randomSecretKey();
  const pubkey = secp256k1.getPublicKey(priv, true);
  const address = toEvmAddress(pubkey);
  return { address, priv, pubkey };
};
