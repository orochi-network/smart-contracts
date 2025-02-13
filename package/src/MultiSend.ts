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

export interface MultiSendInterface extends Interface {
  getFunction(nameOrSignature: "multiSend"): FunctionFragment;

  getEvent(nameOrSignatureOrTopic: "BalanceUpdate"): EventFragment;

  encodeFunctionData(
    functionFragment: "multiSend",
    values: [AddressLike[], BigNumberish]
  ): string;

  decodeFunctionResult(functionFragment: "multiSend", data: BytesLike): Result;
}

export namespace BalanceUpdateEvent {
  export type InputTuple = [beneficially: AddressLike, balance: BigNumberish];
  export type OutputTuple = [beneficially: string, balance: bigint];
  export interface OutputObject {
    beneficially: string;
    balance: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface MultiSend extends BaseContract {
  connect(runner?: ContractRunner | null): MultiSend;
  waitForDeployment(): Promise<this>;

  interface: MultiSendInterface;

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

  multiSend: TypedContractMethod<
    [recipientList: AddressLike[], amount: BigNumberish],
    [void],
    "payable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "multiSend"
  ): TypedContractMethod<
    [recipientList: AddressLike[], amount: BigNumberish],
    [void],
    "payable"
  >;

  getEvent(
    key: "BalanceUpdate"
  ): TypedContractEvent<
    BalanceUpdateEvent.InputTuple,
    BalanceUpdateEvent.OutputTuple,
    BalanceUpdateEvent.OutputObject
  >;

  filters: {
    "BalanceUpdate(address,uint256)": TypedContractEvent<
      BalanceUpdateEvent.InputTuple,
      BalanceUpdateEvent.OutputTuple,
      BalanceUpdateEvent.OutputObject
    >;
    BalanceUpdate: TypedContractEvent<
      BalanceUpdateEvent.InputTuple,
      BalanceUpdateEvent.OutputTuple,
      BalanceUpdateEvent.OutputObject
    >;
  };
}
