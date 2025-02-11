// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./GameContract.sol";
import '@openzeppelin/contracts/access/Ownable.sol';

contract GameContractFactory is Ownable {

    // Contract deployed array 
    address[] contractListDeploy;

    // Invalid User
    error InvalidUser();

    // Signer List
    mapping(address => bool) private _signerMap;

    // Signer Total
    uint256 private _signerTotal;

    // Game Contract deployed event
    event GameContractDeploy(address indexed owner, address indexed contractAddress);

    //  Add list Users
    event SignerListAdd(uint256 indexed totalAddedUser, uint256 indexed timestamp);

    // Remove list Users
    event SignerListRemove(uint256 indexed totalAddedUser, uint256 indexed timestamp);

    // We only allow User have been add by owner
    modifier onlyUser() {
        if (!_signerMap[msg.sender]) {
            revert InvalidUser();
        }
        _;
    }

    /*******************************************************
    * External section
    ********************************************************/

    // Add new Users in list
    function signerListAdd(address[] memory signerListToAdd) external onlyOwner {
        for (uint256 i = 0; i < signerListToAdd.length; i += 1) {
            if (!_signerMap[signerListToAdd[i]]) { 
                _signerMap[signerListToAdd[i]] = true; 
                _signerTotal += 1;
            }
        }
        emit SignerListAdd(_signerTotal, block.timestamp);
    }

    // Remove old Users in list
    function signerListRemove(address[] memory listSignerToRemove) external onlyOwner {
        for (uint256 i = 0; i < listSignerToRemove.length; i += 1) {
            if (_signerMap[listSignerToRemove[i]]) { 
                _signerMap[listSignerToRemove[i]] = false; 
                _signerTotal -= 1;
            }
        }
         emit SignerListRemove(_signerTotal, block.timestamp);
    }

    // Deploy game contract
    function deployGameContract(address _GameContractOwner, bytes32 salt) external onlyUser {

        GameContract newGameContract = new GameContract{salt: salt}();

        newGameContract.transferOwnership(_GameContractOwner); 

        contractListDeploy.push(address(newGameContract));

        emit GameContractDeploy(_GameContractOwner, address(newGameContract));
    
    }

    // Get list contract
    function getContractListDeploy() external view returns (address[] memory) {
        return contractListDeploy;
    }

     // Check list signer status which have add and which hasn't add
    function signerListCheck(address[] memory signerListToCheck) external view returns (bool[] memory) {
        bool[] memory statusList = new bool[](signerListToCheck.length);
        for (uint256 i = 0; i < signerListToCheck.length; i += 1) {
            statusList[i] = _signerMap[signerListToCheck[i]];
        }
        return statusList; 
    }

    // Check signer status 
    function signerCheck(address signerToCheck) external view returns (bool) {
        return _signerMap[signerToCheck];
    }

    // Total signer has been added
    function signerTotal() external view returns (uint256) {
        return _signerTotal;
    }
}
