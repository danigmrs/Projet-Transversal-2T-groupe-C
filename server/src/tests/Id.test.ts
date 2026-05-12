import { checkIdParam } from "../middlewares/checkIdParam";

test("should return 400 if id is invalid", () => {
  const req: any = { params: { id: "abc" } };

  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  const next = jest.fn();

  checkIdParam(req, res, next);

  expect(res.status).toHaveBeenCalledWith(400);

  expect(res.json).toHaveBeenCalledWith({
    error: "ID invalide",
  });

  expect(next).not.toHaveBeenCalled();
});

test("should return 400 if id is negative", () => {
  const req: any = { params: { id: "-5" } };

  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  const next = jest.fn();

  checkIdParam(req, res, next);

  expect(res.status).toHaveBeenCalledWith(400);
});

test("should call next if id is valid", () => {
  const req: any = { params: { id: "5" } };

  const res: any = {};

  const next = jest.fn();

  checkIdParam(req, res, next);

  expect(next).toHaveBeenCalled();
});