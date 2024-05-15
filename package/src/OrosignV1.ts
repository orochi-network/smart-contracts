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

export declare namespace IOrosignV1 {
  export type PackedTransactionStruct = {
    chainId: BigNumberish;
    votingDeadline: BigNumberish;
    nonce: BigNumberish;
    currentBlockTime: BigNumberish;
    target: AddressLike;
    value: BigNumberish;
    orosignAddress: AddressLike;
    data: BytesLike;
  };

  export type PackedTransactionStructOutput = [
    chainId: bigint,
    votingDeadline: bigint,
    nonce: bigint,
    currentBlockTime: bigint,
    target: string,
    value: bigint,
    orosignAddress: string,
    data: string
  ] & {
    chainId: bigint;
    votingDeadline: bigint;
    nonce: bigint;
    currentBlockTime: bigint;
    target: string;
    value: bigint;
    orosignAddress: string;
    data: string;
  };

  export type OrosignV1MetadataStruct = {
    chainId: BigNumberish;
    nonce: BigNumberish;
    totalSigner: BigNumberish;
    threshold: BigNumberish;
    securedTimeout: BigNumberish;
    blockTimestamp: BigNumberish;
  };

  export type OrosignV1MetadataStructOutput = [
    chainId: bigint,
    nonce: bigint,
    totalSigner: bigint,
    threshold: bigint,
    securedTimeout: bigint,
    blockTimestamp: bigint
  ] & {
    chainId: bigint;
    nonce: bigint;
    totalSigner: bigint;
    threshold: bigint;
    securedTimeout: bigint;
    blockTimestamp: bigint;
  };
}

export declare namespace Permissioned {
  export type RoleRecordStruct = {
    index: BigNumberish;
    role: BigNumberish;
    activeTime: BigNumberish;
  };

  export type RoleRecordStructOutput = [
    index: bigint,
    role: bigint,
    activeTime: bigint
  ] & { index: bigint; role: bigint; activeTime: bigint };
}

export interface OrosignV1Interface extends Interface {
  getFunction(
    nameOrSignature:
      | "decodePackedTransaction"
      | "encodePackedTransaction"
      | "executeTransaction"
      | "getAllUser"
      | "getMetadata"
      | "getRole"
      | "getTotalUser"
      | "init"
      | "isActivePermission"
      | "isActiveUser"
      | "quickEncodePackedTransaction"
      | "transferRole"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic: "ExecutedTransaction" | "TransferRole"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "decodePackedTransaction",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "encodePackedTransaction",
    values: [BigNumberish, AddressLike, BigNumberish, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "executeTransaction",
    values: [BytesLike, BytesLike[], BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "getAllUser",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getMetadata",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getRole",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "getTotalUser",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "init",
    values: [AddressLike[], BigNumberish[], BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "isActivePermission",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "isActiveUser",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "quickEncodePackedTransaction",
    values: [AddressLike, BigNumberish, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "transferRole",
    values: [AddressLike]
  ): string;

  decodeFunctionResult(
    functionFragment: "decodePackedTransaction",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "encodePackedTransaction",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "executeTransaction",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getAllUser", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getMetadata",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getRole", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getTotalUser",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "init", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "isActivePermission",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isActiveUser",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "quickEncodePackedTransaction",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferRole",
    data: BytesLike
  ): Result;
}

export namespace ExecutedTransactionEvent {
  export type InputTuple = [
    target: AddressLike,
    value: BigNumberish,
    data: BytesLike
  ];
  export type OutputTuple = [target: string, value: bigint, data: string];
  export interface OutputObject {
    target: string;
    value: bigint;
    data: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace TransferRoleEvent {
  export type InputTuple = [
    preUser: AddressLike,
    newUser: AddressLike,
    role: BigNumberish
  ];
  export type OutputTuple = [preUser: string, newUser: string, role: bigint];
  export interface OutputObject {
    preUser: string;
    newUser: string;
    role: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface OrosignV1 extends BaseContract {
  connect(runner?: ContractRunner | null): OrosignV1;
  waitForDeployment(): Promise<this>;

  interface: OrosignV1Interface;

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

  decodePackedTransaction: TypedContractMethod<
    [txData: BytesLike],
    [IOrosignV1.PackedTransactionStructOutput],
    "view"
  >;

  encodePackedTransaction: TypedContractMethod<
    [
      timeout: BigNumberish,
      target: AddressLike,
      value: BigNumberish,
      data: BytesLike
    ],
    [string],
    "view"
  >;

  executeTransaction: TypedContractMethod<
    [
      creatorSignature: BytesLike,
      signatureList: BytesLike[],
      message: BytesLike
    ],
    [boolean],
    "nonpayable"
  >;

  getAllUser: TypedContractMethod<[], [bigint[]], "view">;

  getMetadata: TypedContractMethod<
    [],
    [IOrosignV1.OrosignV1MetadataStructOutput],
    "view"
  >;

  getRole: TypedContractMethod<
    [checkAddress: AddressLike],
    [Permissioned.RoleRecordStructOutput],
    "view"
  >;

  getTotalUser: TypedContractMethod<[], [bigint], "view">;

  init: TypedContractMethod<
    [
      userList: AddressLike[],
      roleList: BigNumberish[],
      votingThreshold: BigNumberish
    ],
    [boolean],
    "nonpayable"
  >;

  isActivePermission: TypedContractMethod<
    [checkAddress: AddressLike, requiredPermission: BigNumberish],
    [boolean],
    "view"
  >;

  isActiveUser: TypedContractMethod<
    [checkAddress: AddressLike],
    [boolean],
    "view"
  >;

  quickEncodePackedTransaction: TypedContractMethod<
    [target: AddressLike, value: BigNumberish, data: BytesLike],
    [string],
    "view"
  >;

  transferRole: TypedContractMethod<
    [newUser: AddressLike],
    [boolean],
    "nonpayable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "decodePackedTransaction"
  ): TypedContractMethod<
    [txData: BytesLike],
    [IOrosignV1.PackedTransactionStructOutput],
    "view"
  >;
  getFunction(
    nameOrSignature: "encodePackedTransaction"
  ): TypedContractMethod<
    [
      timeout: BigNumberish,
      target: AddressLike,
      value: BigNumberish,
      data: BytesLike
    ],
    [string],
    "view"
  >;
  getFunction(
    nameOrSignature: "executeTransaction"
  ): TypedContractMethod<
    [
      creatorSignature: BytesLike,
      signatureList: BytesLike[],
      message: BytesLike
    ],
    [boolean],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "getAllUser"
  ): TypedContractMethod<[], [bigint[]], "view">;
  getFunction(
    nameOrSignature: "getMetadata"
  ): TypedContractMethod<
    [],
    [IOrosignV1.OrosignV1MetadataStructOutput],
    "view"
  >;
  getFunction(
    nameOrSignature: "getRole"
  ): TypedContractMethod<
    [checkAddress: AddressLike],
    [Permissioned.RoleRecordStructOutput],
    "view"
  >;
  getFunction(
    nameOrSignature: "getTotalUser"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "init"
  ): TypedContractMethod<
    [
      userList: AddressLike[],
      roleList: BigNumberish[],
      votingThreshold: BigNumberish
    ],
    [boolean],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "isActivePermission"
  ): TypedContractMethod<
    [checkAddress: AddressLike, requiredPermission: BigNumberish],
    [boolean],
    "view"
  >;
  getFunction(
    nameOrSignature: "isActiveUser"
  ): TypedContractMethod<[checkAddress: AddressLike], [boolean], "view">;
  getFunction(
    nameOrSignature: "quickEncodePackedTransaction"
  ): TypedContractMethod<
    [target: AddressLike, value: BigNumberish, data: BytesLike],
    [string],
    "view"
  >;
  getFunction(
    nameOrSignature: "transferRole"
  ): TypedContractMethod<[newUser: AddressLike], [boolean], "nonpayable">;

  getEvent(
    key: "ExecutedTransaction"
  ): TypedContractEvent<
    ExecutedTransactionEvent.InputTuple,
    ExecutedTransactionEvent.OutputTuple,
    ExecutedTransactionEvent.OutputObject
  >;
  getEvent(
    key: "TransferRole"
  ): TypedContractEvent<
    TransferRoleEvent.InputTuple,
    TransferRoleEvent.OutputTuple,
    TransferRoleEvent.OutputObject
  >;

  filters: {
    "ExecutedTransaction(address,uint256,bytes)": TypedContractEvent<
      ExecutedTransactionEvent.InputTuple,
      ExecutedTransactionEvent.OutputTuple,
      ExecutedTransactionEvent.OutputObject
    >;
    ExecutedTransaction: TypedContractEvent<
      ExecutedTransactionEvent.InputTuple,
      ExecutedTransactionEvent.OutputTuple,
      ExecutedTransactionEvent.OutputObject
    >;

    "TransferRole(address,address,uint128)": TypedContractEvent<
      TransferRoleEvent.InputTuple,
      TransferRoleEvent.OutputTuple,
      TransferRoleEvent.OutputObject
    >;
    TransferRole: TypedContractEvent<
      TransferRoleEvent.InputTuple,
      TransferRoleEvent.OutputTuple,
      TransferRoleEvent.OutputObject
    >;
  };
}