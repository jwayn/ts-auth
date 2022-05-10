import { NextFunction, Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import createError from "http-errors";
import {
  GetUserByEmail,
  GetUserById,
  CreateUser,
  CreateLoginStrike,
  GetLoginStrikes,
  GetVerificationRecord,
  VerifyUser,
  DeleteVerificationRecord,
  CreatePasswordResetRecord,
  GetPasswordResetRecord,
  UpdatePassword,
} from "../db/User";
import { isValidEmail, isValidPassword } from "../util/index";
import { User } from "@prisma/client";

const AuthRouter = Router();

/**
 * This file feeds the following route declared
 * in /src/app.ts
 * Route: /api/v1/auth
 */

// POST - Email/password Sign up route
AuthRouter.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // If we don't have an email or password, send 400
      if (!req.body.email || !req.body.password) {
        return next(createError(400, "Invalid user credentials."));
      }

      // If the user already exists, send 400
      const userExists: User | null = await GetUserByEmail(req.body.email);
      if (userExists) {
        return next(createError(400, "User already exists."));
      }

      // If the user isn't valid, send 400
      if (
        !isValidEmail(req.body.email) ||
        !isValidPassword(req.body.password)
      ) {
        return next(
          createError(
            400,
            "Credentials do not meet email or password requirements"
          )
        );
      }

      // Create a new user with a salted hash
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(req.body.password, salt);
      const user = { email: req.body.email, hash };
      const newUser = await CreateUser(user);

      jwt.sign(
        { user_id: newUser.id, email: newUser.email, verified: false },
        process.env.JWT_SECRET as jwt.Secret,
        { expiresIn: "1d" },
        (err, token) => {
          res.json({ token });
        }
      );
    } catch (err) {
      next(err);
    }
  }
);

// GET email/password Sign in route
AuthRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  // If we don't have an email or password, send 403
  if (!req.body.email || !req.body.password) {
    return next(createError(403, "Invalid user credentials."));
  }

  // If the user doesn't exist, send 403
  const user: User | null = await GetUserByEmail(req.body.email);
  if (!user) {
    return next(createError(403, "Invalid user credentials."));
  }

  // If user has 5 or more login strikes within the last hour,
  // Create a password reset record if there isn't one created within the last 4 hours
  // and send an email with the link then send 403
  const strikes = await GetLoginStrikes(user.id);
  if (strikes.length >= 5) {
    return next(createError(403, "User has too many failed login attempts."));
  }

  // Otherwise, attempt to match passwords
  const passwordsMatch = await bcrypt.compare(req.body.password, user.hash);
  if (passwordsMatch) {
    // Return a signed JWT with user id and email if passwords match
    jwt.sign(
      { user_id: user.id, email: user.email, verified: user.verified },
      process.env.JWT_SECRET as jwt.Secret,
      { expiresIn: "1d" },
      (err, token) => {
        res.json({ token });
      }
    );
  } else {
    // Create a strike if passwords don't match
    await CreateLoginStrike(user.id);
    return res.sendStatus(403);
  }
});

// POST Verify user account with the verification key
AuthRouter.post(
  "/verify",
  async (req: Request, res: Response, next: NextFunction) => {
    // Ensure verificiation token is in payload
    if (!req.body.token)
      return next(createError(406, "Invalid verification token."));

    const verificationRecord = await GetVerificationRecord(req.body.token);
    // Ensure verification record exists
    if (!verificationRecord)
      return next(createError(406, "Invalid verification token."));

    // Flip boolean on user
    const user = await GetUserById(verificationRecord.userId);
    if (!user)
      return next(
        createError(500, "User in verification record does not exist.")
      );

    let acceptableVerificationDate = new Date();
    acceptableVerificationDate.setHours(
      acceptableVerificationDate.getHours() - 4
    );
    // If the verification record is older than 4 hours, forbidden
    if (verificationRecord.createdAt < acceptableVerificationDate)
      return next(createError(403, "Verification record is stale."));

    await VerifyUser(user.id);
    await DeleteVerificationRecord(req.body.token);

    jwt.sign(
      { user_id: user.id, email: user.email, verified: user.verified },
      process.env.JWT_SECRET as jwt.Secret,
      { expiresIn: "1d" },
      (err, token) => {
        res.json({ token });
      }
    );
  }
);

// TODO: Create GET verification route to request new verification record + email
AuthRouter.get(
  "/verify",
  async (req: Request, res: Response, next: NextFunction) => {}
);

// Takes in a user email, creates a record in the reset table
AuthRouter.get(
  "/passwordreset",
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.email) return next(createError(400, "Invalid user id."));

    const user = await GetUserByEmail(req.body.email);
    if (!user) return next(createError(400, "User does not exist."));

    // Check for existence of other pass reset records and delete
    await CreatePasswordResetRecord(user.id);
    return res.status(200).json("Password reset record created.");
  }
);

// Takes in a reset token and new password, updates the user's password
AuthRouter.post(
  "/passwordreset",
  async (req: Request, res: Response, next: NextFunction) => {
    if (
      !req.body.token ||
      !req.body.password ||
      !isValidPassword(req.body.password)
    )
      return next(createError(400, "Invalid token or password."));

    const passwordResetRecord = await GetPasswordResetRecord(req.body.token);
    if (!passwordResetRecord)
      return next(createError(400, "Password reset record does not exist."));

    // If the reset record is older than 4 hours, forbidden
    let acceptableRecordDate = new Date();
    acceptableRecordDate.setHours(acceptableRecordDate.getHours() - 4);
    if (passwordResetRecord.createdAt < acceptableRecordDate)
      return next(createError(403, "Password reset record is stale."));

    const user = await GetUserById(passwordResetRecord.userId);
    if (!user)
      return next(
        createError(500, "User from password reset record does not exist.")
      );

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(req.body.password, salt);
    await UpdatePassword({ id: user.id, hash });
    return res.status(200).json("User's password has been updated.");
  }
);

export default AuthRouter;
