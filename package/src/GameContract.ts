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
} from "./common.js";

export interface GameContractInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "initialize"
      | "owner"
      | "questSubmitDaily"
      | "questSubmitGame"
      | "questSubmitSocial"
      | "renounceOwnership"
      | "transferOwnership"
      | "userCheck"
      | "userListAdd"
      | "userListCheck"
      | "userListRemove"
      | "userTotal"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | "OwnershipTransferred"
      | "QuestCompleteDaily"
      | "QuestCompleteGame"
      | "QuestCompleteSocial"
      | "UserListAdd"
      | "UserListRemove"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "initialize",
    values: [AddressLike]
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "questSubmitDaily",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "questSubmitGame",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "questSubmitSocial",
    values: [BytesLike]
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
    functionFragment: "userCheck",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "userListAdd",
    values: [AddressLike[]]
  ): string;
  encodeFunctionData(
    functionFragment: "userListCheck",
    values: [AddressLike[]]
  ): string;
  encodeFunctionData(
    functionFragment: "userListRemove",
    values: [AddressLike[]]
  ): string;
  encodeFunctionData(functionFragment: "userTotal", values?: undefined): string;

  decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "questSubmitDaily",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "questSubmitGame",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "questSubmitSocial",
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
  decodeFunctionResult(functionFragment: "userCheck", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "userListAdd",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "userListCheck",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "userListRemove",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "userTotal", data: BytesLike): Result;
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

export namespace QuestCompleteDailyEvent {
  export type InputTuple = [user: AddressLike, questName: BytesLike];
  export type OutputTuple = [user: string, questName: string];
  export interface OutputObject {
    user: string;
    questName: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace QuestCompleteGameEvent {
  export type InputTuple = [user: AddressLike, questName: BytesLike];
  export type OutputTuple = [user: string, questName: string];
  export interface OutputObject {
    user: string;
    questName: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace QuestCompleteSocialEvent {
  export type InputTuple = [user: AddressLike, questName: BytesLike];
  export type OutputTuple = [user: string, questName: string];
  export interface OutputObject {
    user: string;
    questName: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace UserListAddEvent {
  export type InputTuple = [actor: AddressLike, totalAddedUser: BigNumberish];
  export type OutputTuple = [actor: string, totalAddedUser: bigint];
  export interface OutputObject {
    actor: string;
    totalAddedUser: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace UserListRemoveEvent {
  export type InputTuple = [actor: AddressLike, totalAddedUser: BigNumberish];
  export type OutputTuple = [actor: string, totalAddedUser: bigint];
  export interface OutputObject {
    actor: string;
    totalAddedUser: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface GameContract extends BaseContract {
  connect(runner?: ContractRunner | null): GameContract;
  waitForDeployment(): Promise<this>;

  interface: GameContractInterface;

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

  initialize: TypedContractMethod<
    [newGameContractOwner: AddressLike],
    [void],
    "nonpayable"
  >;

  owner: TypedContractMethod<[], [string], "view">;

  questSubmitDaily: TypedContractMethod<
    [questName: BytesLike],
    [void],
    "nonpayable"
  >;

  questSubmitGame: TypedContractMethod<
    [questName: BytesLike],
    [void],
    "nonpayable"
  >;

  questSubmitSocial: TypedContractMethod<
    [questName: BytesLike],
    [void],
    "nonpayable"
  >;

  renounceOwnership: TypedContractMethod<[], [void], "nonpayable">;

  transferOwnership: TypedContractMethod<
    [newOwner: AddressLike],
    [void],
    "nonpayable"
  >;

  userCheck: TypedContractMethod<[userToCheck: AddressLike], [boolean], "view">;

  userListAdd: TypedContractMethod<
    [userListToAdd: AddressLike[]],
    [void],
    "nonpayable"
  >;

  userListCheck: TypedContractMethod<
    [userListToCheck: AddressLike[]],
    [boolean[]],
    "view"
  >;

  userListRemove: TypedContractMethod<
    [userListToRemove: AddressLike[]],
    [void],
    "nonpayable"
  >;

  userTotal: TypedContractMethod<[], [bigint], "view">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "initialize"
  ): TypedContractMethod<
    [newGameContractOwner: AddressLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "owner"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "questSubmitDaily"
  ): TypedContractMethod<[questName: BytesLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "questSubmitGame"
  ): TypedContractMethod<[questName: BytesLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "questSubmitSocial"
  ): TypedContractMethod<[questName: BytesLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "renounceOwnership"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "transferOwnership"
  ): TypedContractMethod<[newOwner: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "userCheck"
  ): TypedContractMethod<[userToCheck: AddressLike], [boolean], "view">;
  getFunction(
    nameOrSignature: "userListAdd"
  ): TypedContractMethod<[userListToAdd: AddressLike[]], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "userListCheck"
  ): TypedContractMethod<[userListToCheck: AddressLike[]], [boolean[]], "view">;
  getFunction(
    nameOrSignature: "userListRemove"
  ): TypedContractMethod<
    [userListToRemove: AddressLike[]],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "userTotal"
  ): TypedContractMethod<[], [bigint], "view">;

  getEvent(
    key: "OwnershipTransferred"
  ): TypedContractEvent<
    OwnershipTransferredEvent.InputTuple,
    OwnershipTransferredEvent.OutputTuple,
    OwnershipTransferredEvent.OutputObject
  >;
  getEvent(
    key: "QuestCompleteDaily"
  ): TypedContractEvent<
    QuestCompleteDailyEvent.InputTuple,
    QuestCompleteDailyEvent.OutputTuple,
    QuestCompleteDailyEvent.OutputObject
  >;
  getEvent(
    key: "QuestCompleteGame"
  ): TypedContractEvent<
    QuestCompleteGameEvent.InputTuple,
    QuestCompleteGameEvent.OutputTuple,
    QuestCompleteGameEvent.OutputObject
  >;
  getEvent(
    key: "QuestCompleteSocial"
  ): TypedContractEvent<
    QuestCompleteSocialEvent.InputTuple,
    QuestCompleteSocialEvent.OutputTuple,
    QuestCompleteSocialEvent.OutputObject
  >;
  getEvent(
    key: "UserListAdd"
  ): TypedContractEvent<
    UserListAddEvent.InputTuple,
    UserListAddEvent.OutputTuple,
    UserListAddEvent.OutputObject
  >;
  getEvent(
    key: "UserListRemove"
  ): TypedContractEvent<
    UserListRemoveEvent.InputTuple,
    UserListRemoveEvent.OutputTuple,
    UserListRemoveEvent.OutputObject
  >;

  filters: {
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

    "QuestCompleteDaily(address,bytes32)": TypedContractEvent<
      QuestCompleteDailyEvent.InputTuple,
      QuestCompleteDailyEvent.OutputTuple,
      QuestCompleteDailyEvent.OutputObject
    >;
    QuestCompleteDaily: TypedContractEvent<
      QuestCompleteDailyEvent.InputTuple,
      QuestCompleteDailyEvent.OutputTuple,
      QuestCompleteDailyEvent.OutputObject
    >;

    "QuestCompleteGame(address,bytes32)": TypedContractEvent<
      QuestCompleteGameEvent.InputTuple,
      QuestCompleteGameEvent.OutputTuple,
      QuestCompleteGameEvent.OutputObject
    >;
    QuestCompleteGame: TypedContractEvent<
      QuestCompleteGameEvent.InputTuple,
      QuestCompleteGameEvent.OutputTuple,
      QuestCompleteGameEvent.OutputObject
    >;

    "QuestCompleteSocial(address,bytes32)": TypedContractEvent<
      QuestCompleteSocialEvent.InputTuple,
      QuestCompleteSocialEvent.OutputTuple,
      QuestCompleteSocialEvent.OutputObject
    >;
    QuestCompleteSocial: TypedContractEvent<
      QuestCompleteSocialEvent.InputTuple,
      QuestCompleteSocialEvent.OutputTuple,
      QuestCompleteSocialEvent.OutputObject
    >;

    "UserListAdd(address,uint256)": TypedContractEvent<
      UserListAddEvent.InputTuple,
      UserListAddEvent.OutputTuple,
      UserListAddEvent.OutputObject
    >;
    UserListAdd: TypedContractEvent<
      UserListAddEvent.InputTuple,
      UserListAddEvent.OutputTuple,
      UserListAddEvent.OutputObject
    >;

    "UserListRemove(address,uint256)": TypedContractEvent<
      UserListRemoveEvent.InputTuple,
      UserListRemoveEvent.OutputTuple,
      UserListRemoveEvent.OutputObject
    >;
    UserListRemove: TypedContractEvent<
      UserListRemoveEvent.InputTuple,
      UserListRemoveEvent.OutputTuple,
      UserListRemoveEvent.OutputObject
    >;
  };
}
