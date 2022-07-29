import { interpret } from "xstate";

import { query } from "./Query";

test("starts at request.idle and response.none states", (done) => {
  interpret(query)
    .onTransition((s) => {
      expect(s.value).toBe({
        request: "executing",
        response: "none",
      });
      done();
    })
    .start();
});
