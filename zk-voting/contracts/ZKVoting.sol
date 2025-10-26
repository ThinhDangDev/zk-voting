// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import './Secp256k1.sol';
import 'hardhat/console.sol';
import 'vrc25/contracts/VRC25.sol';

contract ZKVoting is VRC25 {
  struct Point {
    uint256 x;
    uint256 y;
  }

  struct Proposal {
    bytes32 merkleRoot;
    bytes32 metadata;
    Point[] ballotBoxes;
    uint startDate;
    uint endDate;
    address authority;
    uint256[] randomNumbers;
    address[] candidates;
    uint256 commitment;
  }
  Point public pubkey =
    Point({
      x: 57128826578175384707766714092333618877258119505076620888632164891568179932400,
      y: 77584907535870701173066994001389296153827093547003175977953419032582119567751
    });

  mapping(uint => mapping(address => bool)) public receipts;
  mapping(uint256 => Proposal) public proposals;
  uint public proposalId = 0;

  constructor() VRC25('ZKVoting', 'AB', 18) {}

  event InitProposal(
    uint256 proposalId,
    address indexed authority,
    address[] indexed candidates,
    bytes32 merkle_root,
    bytes32 metadata
  );

  function initProposal(
    bytes32 _merkleRoot,
    bytes32 _metadata,
    uint _startDate,
    uint _endDate,
    uint256 _commitment,
    uint256[] memory _randomNumbers,
    address[] memory _candidates,
    Point[] memory _ballotBoxes
  ) public {
    Proposal storage newProposal = proposals[proposalId];
    newProposal.merkleRoot = _merkleRoot;
    newProposal.metadata = _metadata;
    newProposal.startDate = _startDate;
    newProposal.endDate = _endDate;
    newProposal.randomNumbers = _randomNumbers;
    newProposal.candidates = _candidates;
    newProposal.authority = msg.sender;
    newProposal.commitment = _commitment;

    for (uint i = 0; i < _ballotBoxes.length; i++) {
      newProposal.ballotBoxes.push(_ballotBoxes[i]);
    }

    proposalId++;

    emit InitProposal(
      proposalId,
      msg.sender,
      _candidates,
      _merkleRoot,
      _metadata
    );
  }

  function calcSumPoint(
    Point[] memory points
  ) internal pure returns (uint256, uint256) {
    uint256 x = 0;
    uint256 y = 0;
    for (uint i = 0; i < points.length; i++) {
      (uint256 _x, uint256 _y) = Secp256k1.ecAdd(
        x,
        y,
        points[i].x,
        points[i].y
      );
      x = _x;
      y = _y;
    }
    return (x, y);
  }

  function isValidSumVotes(
    Point[] memory votes,
    uint256[] memory numbers
  ) internal view returns (bool) {
    uint256 totalRandom = 0;
    for (uint i = 0; i < numbers.length; i++) {
      totalRandom += numbers[i];
    }
    (uint256 x1, uint256 y1) = calcSumPoint(votes);
    (uint256 x2, uint256 y2) = Secp256k1.ecMul(totalRandom, pubkey.x, pubkey.y);
    (uint256 x3, uint256 y3) = Secp256k1.ecAdd(
      x2,
      y2,
      Secp256k1.gx,
      Secp256k1.gy
    );

    return Secp256k1.compare(x1, y1, x3, y3);
  }

  /*
   * Prove: 2n-1 vote have shape: vote = random_number * pubkey
   * Commitment: T = Gr - Pc
   */
  function isValidVotes(
    Point[] memory votes,
    uint256[] calldata public_r,
    Point[] calldata public_t,
    uint256 c
  ) internal view returns (bool) {
    uint256 count = 0;

    for (uint i = 0; i < votes.length; i++) {
      Point memory p = votes[i];
      (uint256 pc_x, uint256 pc_y) = Secp256k1.ecMul(c, p.x, p.y);

      uint256 r = public_r[i];
      (uint256 gr_x, uint256 gr_y) = Secp256k1.ecMul(r, pubkey.x, pubkey.y);

      Point memory t = public_t[i];
      (uint256 diff_x, uint256 diff_y) = Secp256k1.ecSub(
        gr_x,
        gr_y,
        pc_x,
        pc_y
      );
      if (diff_x == t.x && diff_y == t.y) count++;
    }

    return count == votes.length - 1;
  }

  function vote(
    uint _proposalId,
    uint256[] memory _randomNumbers,
    Point[] memory votes,
    bytes32[] calldata proof,
    uint256[] calldata public_r,
    Point[] calldata public_t
  ) public {
    // require(!receipts[proposalId][msg.sender], 'You already voted.');
    Proposal storage proposal = proposals[_proposalId];
    Point[] memory _votes = votes;
    // Verify valid voter
    bytes32 node = keccak256(abi.encodePacked(msg.sender));
    for (uint i = 0; i < proof.length; i++) {
      node = keccak256(abi.encodePacked(node ^ proof[i]));
    }
    // require(node == proposal.merkleRoot, 'You are not on the voting list.');

    // Verify valid votes
    require(
      isValidSumVotes(_votes, _randomNumbers),
      'Your sum votes not valid.'
    );
    // Verify valid votes
    require(
      isValidVotes(_votes, public_r, public_t, proposal.commitment),
      'Your votes not valid.'
    );

    for (uint i = 0; i < proposal.ballotBoxes.length; i++) {
      Point memory oldVote = proposal.ballotBoxes[i];
      (uint256 x, uint256 y) = Secp256k1.ecAdd(
        oldVote.x,
        oldVote.y,
        _votes[i].x,
        _votes[i].y
      );
      proposal.ballotBoxes[i] = Point({x: x, y: y});
    }

    for (uint i = 0; i < proposal.randomNumbers.length; i++) {
      uint256 newNumber = proposal.randomNumbers[i] + _randomNumbers[i];
      proposal.randomNumbers[i] = newNumber;
    }

    receipts[proposalId][msg.sender] = true;
  }

  function getProposal(uint256 index) public view returns (Proposal memory) {
    return proposals[index];
  }

  function _estimateFee(
    uint256 value
  ) internal view virtual override returns (uint256) {
    return value * 0;
  }
}
