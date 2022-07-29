import { actions, createMachine, DoneInvokeEvent } from "xstate";

/*
@todo Add options for:
  executeOnInvoke
  executeOnStale
  executeOnInterval
  executeOnRefocus
  executeOnReconnect
*/
type QueryOptions = {
  key?: string;
  fetcher?: () => Promise<any>;
  initialData?: any;
  placeholderData?: any;
  initialTimestamp?: number;
  freshTime: number;
};

type QueryContext = QueryOptions & {
  data?: any;
  timestamp?: number;
  invalidateTimestamp?: number;
};

type SetOptionsEvent = {
  type: "SET_OPTIONS";
  data: QueryOptions;
};

type SetDataEvent = {
  type: "SET_DATA";
  data: any;
};

type SetTimestampEvent = {
  type: "SET_TIMESTAMP";
  data: { timestamp: number };
};

type ExecuteEvent = {
  type: "EXECUTE";
  data?: { isForced?: boolean };
};

type AbortEvent = { type: "ABORT" };
type ResetEvent = { type: "RESET" };
type InvalidateEvent = { type: "INVALIDATE" };

type QueryEvents =
  | SetOptionsEvent
  | SetDataEvent
  | SetTimestampEvent
  | ExecuteEvent
  | AbortEvent
  | ResetEvent
  | InvalidateEvent;

type ExecuterServiceEvent = DoneInvokeEvent<any>;

type QueryServiceEvents = {
  executer: ExecuterServiceEvent;
};

// @todo Support typing of data
const query = createMachine(
  {
    id: "query",
    strict: true,
    preserveActionOrder: true,

    tsTypes: {} as import("./Query.typegen").Typegen0,
    schema: {
      context: {} as QueryContext,
      events: {} as QueryEvents,
      services: {} as QueryServiceEvents,
    },

    context: {
      freshTime: Number.POSITIVE_INFINITY,
    },

    type: "parallel",
    states: {
      // @todo Support disabled and pending executer states
      executer: {
        initial: "checking",
        states: {
          checking: {
            always: [
              {
                cond: "shouldExecute",
                target: "running",
              },
              "idle",
            ],
          },

          idle: {},

          running: {
            invoke: {
              id: "fetcher",
              src: "fetcher",
              onDone: "done",
              onError: "error",
            },

            initial: "checking",
            states: {
              checking: {
                always: [
                  {
                    cond: "shouldLoad",
                    target: "loading",
                  },
                  "refreshing",
                ],
              },

              loading: {},
              refreshing: {},
            },
          },

          aborted: {},
          done: {},
          error: {},
        },

        on: {
          EXECUTE: [
            {
              cond: "isForcedExecute",
              target: ".running",
            },
            ".checking",
          ],

          ABORT: ".aborted",
          RESET: ".checking", // @todo Needs action
        },
      },

      data: {
        initial: "checking",
        states: {
          checking: {
            always: [
              {
                cond: "isFresh",
                target: "fresh",
              },
              {
                cond: "isStale",
                target: "stale",
              },
              "none",
            ],
          },

          none: {},
          stale: {},

          fresh: {
            entry: "setFreshTimeout",
            exit: "abortFreshTimeout",
          },
        },
      },
    },

    on: {
      SET_OPTIONS: { actions: "setOptions" },
      SET_DATA: { actions: "setData" },
      SET_TIMESTAMP: { actions: "setTimestamp" },
      INVALIDATE: { actions: "invalidate" },
    },
  },
  {
    guards: {
      shouldExecute: (context) =>
        context.timestamp === undefined ||
        context.invalidateTimestamp !== undefined,

      isForcedExecute: (_context, event) => event.data?.isForced ?? false,

      shouldLoad: (context) => context.timestamp === undefined,

      isFresh: (context) =>
        context.timestamp !== undefined &&
        Date.now() - context.timestamp <= context.freshTime &&
        context.invalidateTimestamp === undefined,

      isStale: (context) =>
        (context.timestamp !== undefined &&
          Date.now() - context.timestamp > context.freshTime) ||
        context.invalidateTimestamp !== undefined,
    },

    actions: {
      setOptions: actions.pure<QueryContext, SetOptionsEvent>(() => [
        actions.choose([
          {
            cond: (context) => context.data === undefined,
            actions: actions.assign({
              data: (_context, event) => event.data.initialData,
              timestamp: (_context, event) =>
                event.data.initialTimestamp ?? Date.now(),
            }),
          },
          {
            cond: (context, event) => event.data.fetcher !== context.fetcher,
            actions: "invalidate",
          },
        ]),

        actions.assign({
          key: (_context, event) => event.data.key,
          fetcher: (_context, event) => event.data.fetcher,
          initialData: (_context, event) => event.data.initialData,
          placeholderData: (_context, event) => event.data.placeholderData,
          initialTimestamp: (_context, event) => event.data.initialTimestamp,
          freshTime: (_context, event) => event.data.freshTime,
        }),
      ]),

      setData: actions.assign({
        data: (_context, event) => event.data,
      }),

      setTimestamp: actions.assign({
        timestamp: (_context, event) => event.data.timestamp,
      }),

      invalidate: actions.assign({
        invalidateTimestamp: (_context) => Date.now(),
      }),

      setFreshTimeout: actions.send(
        { type: "INVALIDATE" },
        {
          id: "freshTimeout",
          delay: (context) =>
            context.freshTime - (Date.now() - context.timestamp!),
        }
      ),

      abortFreshTimeout: actions.cancel("freshTimeout"),
    },

    services: {
      fetcher: (context) => context.fetcher!,
    },
  }
);

export { query };
