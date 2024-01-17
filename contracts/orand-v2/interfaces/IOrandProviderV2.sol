// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;
import './IOrandStorageV2.sol';
import './IOrandECDSAV2.sol';

error UnableToForwardRandomness(address receiver, uint256 epoch, uint256 y);
error InvalidEpoch(uint256 requiredAlpha, uint256 submittedAlpha);
error InvalidECVRFProofDigest(uint256 committedEcvrfProofDigest, uint256 givenEcvrfProofDigest);
error IncompatibleEra(bytes32 proofPublicKeyDigest, bytes32 givenPublicKeyDigest);
error UnableToSueThisEpoch(address receiverAddress, uint256 receiverEpoch);

interface IOrandProviderV2 is IOrandStorageV2, IOrandECDSAV2 {
  // Struc calldata Proof for backup
  struct CallDataECVRFProof {
    uint256[2] pk;
    uint256[2] gamma;
    uint256 c;
    uint256 s;
    uint256 alpha;
    address uWitness;
    uint256[2] cGammaWitness;
    uint256[2] sHashWitness;
    uint256 zInv;
  }
}
