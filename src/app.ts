import express, { application } from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import createError from "http-errors";

// Route imports
import AuthRouter from "./routes/auth";

const app: express.Application = express();

// Middleware defs
app.use(logger(process.env.NODE_ENV === "development" ? "dev" : "combined"));
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// Routes

app.use("/api/v1/auth", AuthRouter);

// // 404 Catches
// app.use(function (
//   err: express.Errback,
//   req: express.Request,
//   res: express.Response,
//   next: express.NextFunction
// ) {
//   console.error("This is a 404!");
//   next(createError(404));
// });

// error handler
app.use(function (
  err: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = err;

  console.error(err);
  res.status(err.status || 500);
  res.json({
    error: err,
  });
});

export default app;
