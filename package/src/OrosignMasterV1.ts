/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  EventFragment,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod,
} from "./common";

export interface OrosignMasterV1Interface extends Interface {
  getFunction(
    nameOrSignature:
      | "addOperator"
      | "createWallet"
      | "getMetadata"
      | "isContractExist"
      | "isMultiSigExist"
      | "owner"
      | "packingSalt"
      | "predictWalletAddress"
      | "removeOperator"
      | "renounceOwnership"
      | "transferOwnership"
      | "upgradeImplementation"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | "AddOperator"
      | "CreateNewWallet"
      | "OwnershipTransferred"
      | "RemoveOperator"
      | "UpgradeImplementation"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "addOperator",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "createWallet",
    values: [BigNumberish, AddressLike[], BigNumberish[], BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getMetadata",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "isContractExist",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "isMultiSigExist",
    values: [BigNumberish, AddressLike]
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "packingSalt",
    values: [BigNumberish, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "predictWalletAddress",
    values: [BigNumberish, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "removeOperator",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "upgradeImplementation",
    values: [AddressLike]
  ): string;

  decodeFunctionResult(
    functionFragment: "addOperator",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "createWallet",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getMetadata",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isContractExist",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isMultiSigExist",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "packingSalt",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "predictWalletAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "removeOperator",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "upgradeImplementation",
    data: BytesLike
  ): Result;
}

export namespace AddOperatorEvent {
  export type InputTuple = [newOperatorAddress: AddressLike];
  export type OutputTuple = [newOperatorAddress: string];
  export interface OutputObject {
    newOperatorAddress: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace CreateNewWalletEvent {
  export type InputTuple = [
    salt: BigNumberish,
    owner: AddressLike,
    walletAddress: AddressLike
  ];
  export type OutputTuple = [
    salt: bigint,
    owner: string,
    walletAddress: string
  ];
  export interface OutputObject {
    salt: bigint;
    owner: string;
    walletAddress: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace OwnershipTransferredEvent {
  export type InputTuple = [previousOwner: AddressLike, newOwner: AddressLike];
  export type OutputTuple = [previousOwner: string, newOwner: string];
  export interface OutputObject {
    previousOwner: string;
    newOwner: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace RemoveOperatorEvent {
  export type InputTuple = [oldOperatorAddress: AddressLike];
  export type OutputTuple = [oldOperatorAddress: string];
  export interface OutputObject {
    oldOperatorAddress: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace UpgradeImplementationEvent {
  export type InputTuple = [
    oldImplementation: AddressLike,
    upgradeImplementation: AddressLike
  ];
  export type OutputTuple = [
    oldImplementation: string,
    upgradeImplementation: string
  ];
  export interface OutputObject {
    oldImplementation: string;
    upgradeImplementation: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface OrosignMasterV1 extends BaseContract {
  connect(runner?: ContractRunner | null): OrosignMasterV1;
  waitForDeployment(): Promise<this>;

  interface: OrosignMasterV1Interface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  addOperator: TypedContractMethod<
    [newOperator: AddressLike],
    [boolean],
    "nonpayable"
  >;

  createWallet: TypedContractMethod<
    [
      salt: BigNumberish,
      userList: AddressLike[],
      roleList: BigNumberish[],
      votingThreshold: BigNumberish
    ],
    [string],
    "nonpayable"
  >;

  getMetadata: TypedContractMethod<
    [],
    [[bigint, string] & { sChainId: bigint; sImplementation: string }],
    "view"
  >;

  isContractExist: TypedContractMethod<
    [walletAddress: AddressLike],
    [boolean],
    "view"
  >;

  isMultiSigExist: TypedContractMethod<
    [salt: BigNumberish, creatorAddress: AddressLike],
    [boolean],
    "view"
  >;

  owner: TypedContractMethod<[], [string], "view">;

  packingSalt: TypedContractMethod<
    [salt: BigNumberish, creatorAddress: AddressLike],
    [bigint],
    "view"
  >;

  predictWalletAddress: TypedContractMethod<
    [salt: BigNumberish, creatorAddress: AddressLike],
    [string],
    "view"
  >;

  removeOperator: TypedContractMethod<
    [oldOperator: AddressLike],
    [boolean],
    "nonpayable"
  >;

  renounceOwnership: TypedContractMethod<[], [void], "nonpayable">;

  transferOwnership: TypedContractMethod<
    [newOwner: AddressLike],
    [void],
    "nonpayable"
  >;

  upgradeImplementation: TypedContractMethod<
    [newImplementation: AddressLike],
    [boolean],
    "nonpayable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "addOperator"
  ): TypedContractMethod<[newOperator: AddressLike], [boolean], "nonpayable">;
  getFunction(
    nameOrSignature: "createWallet"
  ): TypedContractMethod<
    [
      salt: BigNumberish,
      userList: AddressLike[],
      roleList: BigNumberish[],
      votingThreshold: BigNumberish
    ],
    [string],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "getMetadata"
  ): TypedContractMethod<
    [],
    [[bigint, string] & { sChainId: bigint; sImplementation: string }],
    "view"
  >;
  getFunction(
    nameOrSignature: "isContractExist"
  ): TypedContractMethod<[walletAddress: AddressLike], [boolean], "view">;
  getFunction(
    nameOrSignature: "isMultiSigExist"
  ): TypedContractMethod<
    [salt: BigNumberish, creatorAddress: AddressLike],
    [boolean],
    "view"
  >;
  getFunction(
    nameOrSignature: "owner"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "packingSalt"
  ): TypedContractMethod<
    [salt: BigNumberish, creatorAddress: AddressLike],
    [bigint],
    "view"
  >;
  getFunction(
    nameOrSignature: "predictWalletAddress"
  ): TypedContractMethod<
    [salt: BigNumberish, creatorAddress: AddressLike],
    [string],
    "view"
  >;
  getFunction(
    nameOrSignature: "removeOperator"
  ): TypedContractMethod<[oldOperator: AddressLike], [boolean], "nonpayable">;
  getFunction(
    nameOrSignature: "renounceOwnership"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "transferOwnership"
  ): TypedContractMethod<[newOwner: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "upgradeImplementation"
  ): TypedContractMethod<
    [newImplementation: AddressLike],
    [boolean],
    "nonpayable"
  >;

  getEvent(
    key: "AddOperator"
  ): TypedContractEvent<
    AddOperatorEvent.InputTuple,
    AddOperatorEvent.OutputTuple,
    AddOperatorEvent.OutputObject
  >;
  getEvent(
    key: "CreateNewWallet"
  ): TypedContractEvent<
    CreateNewWalletEvent.InputTuple,
    CreateNewWalletEvent.OutputTuple,
    CreateNewWalletEvent.OutputObject
  >;
  getEvent(
    key: "OwnershipTransferred"
  ): TypedContractEvent<
    OwnershipTransferredEvent.InputTuple,
    OwnershipTransferredEvent.OutputTuple,
    OwnershipTransferredEvent.OutputObject
  >;
  getEvent(
    key: "RemoveOperator"
  ): TypedContractEvent<
    RemoveOperatorEvent.InputTuple,
    RemoveOperatorEvent.OutputTuple,
    RemoveOperatorEvent.OutputObject
  >;
  getEvent(
    key: "UpgradeImplementation"
  ): TypedContractEvent<
    UpgradeImplementationEvent.InputTuple,
    UpgradeImplementationEvent.OutputTuple,
    UpgradeImplementationEvent.OutputObject
  >;

  filters: {
    "AddOperator(address)": TypedContractEvent<
      AddOperatorEvent.InputTuple,
      AddOperatorEvent.OutputTuple,
      AddOperatorEvent.OutputObject
    >;
    AddOperator: TypedContractEvent<
      AddOperatorEvent.InputTuple,
      AddOperatorEvent.OutputTuple,
      AddOperatorEvent.OutputObject
    >;

    "CreateNewWallet(uint96,address,address)": TypedContractEvent<
      CreateNewWalletEvent.InputTuple,
      CreateNewWalletEvent.OutputTuple,
      CreateNewWalletEvent.OutputObject
    >;
    CreateNewWallet: TypedContractEvent<
      CreateNewWalletEvent.InputTuple,
      CreateNewWalletEvent.OutputTuple,
      CreateNewWalletEvent.OutputObject
    >;

    "OwnershipTransferred(address,address)": TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;
    OwnershipTransferred: TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;

    "RemoveOperator(address)": TypedContractEvent<
      RemoveOperatorEvent.InputTuple,
      RemoveOperatorEvent.OutputTuple,
      RemoveOperatorEvent.OutputObject
    >;
    RemoveOperator: TypedContractEvent<
      RemoveOperatorEvent.InputTuple,
      RemoveOperatorEvent.OutputTuple,
      RemoveOperatorEvent.OutputObject
    >;

    "UpgradeImplementation(address,address)": TypedContractEvent<
      UpgradeImplementationEvent.InputTuple,
      UpgradeImplementationEvent.OutputTuple,
      UpgradeImplementationEvent.OutputObject
    >;
    UpgradeImplementation: TypedContractEvent<
      UpgradeImplementationEvent.InputTuple,
      UpgradeImplementationEvent.OutputTuple,
      UpgradeImplementationEvent.OutputObject
    >;
  };
}
