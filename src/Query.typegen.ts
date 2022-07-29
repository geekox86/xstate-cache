// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "xstate.stop": { type: "xstate.stop" };
    "": { type: "" };
    "xstate.init": { type: "xstate.init" };
    "done.invoke.fetcher": {
      type: "done.invoke.fetcher";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "error.platform.fetcher": { type: "error.platform.fetcher"; data: unknown };
  };
  invokeSrcNameMap: {
    fetcher: "done.invoke.fetcher";
  };
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingActions: {
    setOptions: "SET_OPTIONS";
    setData: "SET_DATA";
    setTimestamp: "SET_TIMESTAMP";
    invalidate: "INVALIDATE";
    abortFreshTimeout: "xstate.stop";
    setFreshTimeout: "";
  };
  eventsCausingServices: {
    fetcher: "EXECUTE" | "";
  };
  eventsCausingGuards: {
    isForcedExecute: "EXECUTE";
    shouldExecute: "";
    shouldLoad: "";
    isFresh: "";
    isStale: "";
  };
  eventsCausingDelays: {};
  matchesStates:
    | "executer"
    | "executer.checking"
    | "executer.idle"
    | "executer.running"
    | "executer.running.checking"
    | "executer.running.loading"
    | "executer.running.refreshing"
    | "executer.aborted"
    | "executer.done"
    | "executer.error"
    | "data"
    | "data.checking"
    | "data.none"
    | "data.stale"
    | "data.fresh"
    | {
        executer?:
          | "checking"
          | "idle"
          | "running"
          | "aborted"
          | "done"
          | "error"
          | { running?: "checking" | "loading" | "refreshing" };
        data?: "checking" | "none" | "stale" | "fresh";
      };
  tags: never;
}
