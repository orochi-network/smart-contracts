// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.19;

import '@openzeppelin/contracts/access/Ownable.sol';
import './interfaces/IOrandProviderV2.sol';
import './interfaces/IOrandECVRFV2.sol';
import './interfaces/IOrandConsumerV2.sol';
import './OrandECDSAV2.sol';
import './OrandStorageV2.sol';
import './OrandPenaltyV2.sol';
import './OrandManagementV2.sol';

contract OrandProviderV2 is IOrandProviderV2, Ownable, OrandStorageV2, OrandManagementV2, OrandECDSAV2, OrandPenaltyV2 {
  // ECVRF verifier smart contract
  IOrandECVRFV2 ecvrf;

  // Event: Set New ECVRF Verifier
  event SetNewECVRFVerifier(address indexed actor, address indexed ecvrfAddress);

  // Provider V2 construct method
  constructor(
    bytes memory pk,
    address operatorAddress,
    address ecvrfAddress,
    uint256 penaltyFee
  ) OrandManagementV2(pk) OrandECDSAV2(operatorAddress) OrandPenaltyV2(penaltyFee) {
    ecvrf = IOrandECVRFV2(ecvrfAddress);
  }

  //=======================[  Owner  ]====================

  // Update new ECVRF verifier
  function setNewECVRFVerifier(address ecvrfAddress) external onlyOwner {
    ecvrf = IOrandECVRFV2(ecvrfAddress);
    emit SetNewECVRFVerifier(msg.sender, ecvrfAddress);
  }

  // Set new operator to submit proof
  function setOperator(address operatorAddress) external onlyOwner returns (bool) {
    _setOperator(operatorAddress);
    return true;
  }

  // Set new public key to verify proof
  function setPublicKey(bytes memory pk) external onlyOwner returns (bool) {
    _setPublicKey(pk);
    return true;
  }

  // Set the penalty amount
  function setPenalty(uint256 newPenaltyFee) external onlyOwner returns (bool) {
    _setPenalty(newPenaltyFee);
    return true;
  }

  //=======================[  External  ]====================

  // Publish new epoch with ECDSA Proof and Fraud Proof
  function publish(bytes memory fraudProof, CallDataECVRFProof calldata ecvrfProof) external returns (bool) {
    (OrandECDSAProof memory ecdsaProof, uint256 ecvrfProofDigest) = _decodeFraudProof(fraudProof);

    // Proof signer must be the operator
    if (_getOperator() != ecdsaProof.signer) {
      revert InvalidProofSigner(ecdsaProof.signer);
    }

    // Make sure that the digest of proof was committed
    if (ecvrfProofDigest != _ecvrfProofDigest(ecvrfProof)) {
      revert InvalidECVRFProofDigest(ecvrfProofDigest, _ecvrfProofDigest(ecvrfProof));
    }

    // Make sure that were on same era
    if (keccak256(abi.encodePacked(ecvrfProof.pk)) != _getPublicKeyDigest()) {
      revert IncompatibleEra(keccak256(abi.encodePacked(ecvrfProof.pk)), _getPublicKeyDigest());
    }

    // Epoch must belong to the chain of genesis, linked by alpha
    if (_getLatestResult(ecdsaProof.receiverAddress) != ecvrfProof.alpha) {
      revert InvalidEpoch(_getLatestResult(ecdsaProof.receiverAddress), ecvrfProof.alpha);
    }

    // y = keccak256(gamma.x, gamma.y)
    uint256 y = uint256(keccak256(abi.encodePacked(ecvrfProof.gamma[0], ecvrfProof.gamma[1])));
    // Add epoch and its commitment to blockchain
    _addEpoch(ecdsaProof.receiverAddress, ecdsaProof.receiverEpoch, y, ecvrfProofDigest);

    // Check for the existing smart contract and forward randomness to receiver
    if (ecdsaProof.receiverAddress.code.length > 0) {
      if (!IOrandConsumerV2(ecdsaProof.receiverAddress).consumeRandomness(y)) {
        revert UnableToForwardRandomness(ecdsaProof.receiverAddress, ecdsaProof.receiverEpoch, y);
      }
    }

    return true;
  }

  // Allow user to sue service provider and its affiliate
  function sue(bytes memory fraudProof, CallDataECVRFProof calldata ecvrfProof) external returns (bool) {
    // Verify ECDSA proof
    (OrandECDSAProof memory ecdsaProof, uint256 ecvrfProofDigest) = _decodeFraudProof(fraudProof);

    // Genesis and sued epochs can't be sued
    if (_getEpoch(ecdsaProof.receiverAddress, ecdsaProof.receiverEpoch).epochDigest == 0) {
      revert UnableToSueThisEpoch(ecdsaProof.receiverAddress, ecdsaProof.receiverEpoch);
    }

    // Commited digest must have the same value to the digest of submited proof
    if (ecvrfProofDigest != _ecvrfProofDigest(ecvrfProof)) {
      revert InvalidECVRFProofDigest(ecvrfProofDigest, _ecvrfProofDigest(ecvrfProof));
    }

    // Make sure that we are on the same era
    if (keccak256(abi.encodePacked(ecvrfProof.pk)) != _getPublicKeyDigest()) {
      revert IncompatibleEra(keccak256(abi.encodePacked(ecvrfProof.pk)), _getPublicKeyDigest());
    }

    if (
      ecvrf.verifyStructECVRFProof(ecvrfProof) !=
      _getEpoch(ecdsaProof.receiverAddress, ecdsaProof.receiverEpoch).epochResult
    ) {
      // Mark the epoch as sued
      _markAsUnableToSue(ecdsaProof.receiverAddress, ecdsaProof.receiverEpoch);

      // Apply the penalty to the accursed
      _applyPenalty(ecdsaProof.receiverAddress);

      return true;
    }
    return false;
  }

  //=======================[  Internal Pure  ]====================

  function _ecvrfProofDigest(CallDataECVRFProof calldata ecvrfProof) internal pure returns (uint256) {
    return
      uint256(
        keccak256(
          abi.encodePacked(
            ecvrfProof.pk,
            ecvrfProof.gamma,
            ecvrfProof.c,
            ecvrfProof.s,
            ecvrfProof.alpha,
            ecvrfProof.uWitness,
            ecvrfProof.cGammaWitness,
            ecvrfProof.sHashWitness,
            ecvrfProof.zInv
          )
        )
      );
  }

  //=======================[  External View  ]====================

  // Get address of ECVRF verifier
  function getECVRFVerifier() external view returns (address) {
    return address(ecvrf);
  }
}
