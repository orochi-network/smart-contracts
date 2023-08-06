// Dependency file: contracts/interfaces/IOrandStorage.sol
// pragma solidity ^0.8.0;

error CanotOverwiteEpoch(address receiverAddress, uint256 receiverEpoch, uint256 randomness);

interface IOrandStorage {
  // Tranmission form of ECVRF epoch proof
  struct ECVRFEpochProof {
    uint256 y;
    uint256[2] gamma;
    uint256 c;
    uint256 s;
    address uWitness;
    uint256[2] cGammaWitness;
    uint256[2] sHashWitness;
    uint256 zInv;
  }
}


// Dependency file: contracts/interfaces/IOrandECDSA.sol

// pragma solidity ^0.8.0;

error InvalidProofEpoch(uint96 proofEpoch);
error InvalidProofSigner(address proofSigner);
error MismatchProofResult(uint256 ecvrfY, uint256 ecdsaY);

interface IOrandECDSA {
  // Struct Orand ECDSA proof
  struct OrandECDSAProof {
    address signer;
    uint96 receiverEpoch;
    address receiverAddress;
    uint256 y;
  }
}


// Root file: contracts/interfaces/IOrandProviderV1.sol

pragma solidity ^0.8.0;
// import 'contracts/interfaces/IOrandStorage.sol';
// import 'contracts/interfaces/IOrandECDSA.sol';

error UnableToForwardRandomness(address receiver, uint256 epoch, uint256 y);
error UnableToIncreaseEpoch();
error EverythingIsCorrect(IOrandECDSA.OrandECDSAProof ecdsaProof);
error InvalidEpoch();

interface IOrandProviderV1 is IOrandStorage, IOrandECDSA {}
