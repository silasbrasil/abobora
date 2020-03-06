import { expect } from "chai";
import "mocha";

describe("global exports", () => {
  it("should return true", () => {
    const expectation: boolean = true;
    expect(expectation).to.equal(true);
  });
});

