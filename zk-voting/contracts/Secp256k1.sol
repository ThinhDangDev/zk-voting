// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import './EllipticCurve.sol';

library Secp256k1 {
  uint256 private constant p =
    0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f;
  uint256 private constant a = 0;
  uint256 private constant b = 7;
  uint256 public constant gx =
    55066263022277343669578718895168534326250603453777594175500187360389116729240;
  uint256 public constant gy =
    32670510020758816978083085130507043184471273380659243275938904335757337482424;

  function ecAdd(
    uint256 _x1,
    uint256 _y1,
    uint256 _x2,
    uint256 _y2
  ) internal pure returns (uint256, uint256) {
    return EllipticCurve.ecAdd(_x1, _y1, _x2, _y2, a, p);
  }

  function ecSub(
    uint256 _x1,
    uint256 _y1,
    uint256 _x2,
    uint256 _y2
  ) internal pure returns (uint256, uint256) {
    return EllipticCurve.ecSub(_x1, _y1, _x2, _y2, a, p);
  }

  function ecMul(
    uint256 _k,
    uint256 _x,
    uint256 _y
  ) internal pure returns (uint256, uint256) {
    return EllipticCurve.ecMul(_k, _x, _y, a, p);
  }

  function compare(
    uint256 _x1,
    uint256 _y1,
    uint256 _x2,
    uint256 _y2
  ) internal pure returns (bool) {
    return _x1 == _x2 && _y1 == _y2;
  }
}
