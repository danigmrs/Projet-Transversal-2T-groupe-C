import { requestLogger } from "../middlewares/logger";

test("should log request and call next", () => {
  const req: any = { method: "GET", url: "/test" };
  const res: any = {};
  const next = jest.fn();

  console.log = jest.fn();

  requestLogger(req, res, next);

  expect(console.log).toHaveBeenCalledWith(expect.stringMatching(/GET \/test/));
  expect(next).toHaveBeenCalled();
});
