import { PrismaClient } from "@prisma/client";
import { randomString } from "../util";

const prisma = new PrismaClient();

export async function CreateUser({
  email,
  hash,
}: {
  email: string;
  hash: string;
}) {
  const newUser = await prisma.user.create({
    data: {
      email,
      hash,
    },
  });

  await CreateNewVerificationRecord(newUser.id);
  return { id: newUser.id, email: newUser.email };
}

export async function VerifyUser(id: string) {
  return await prisma.user.update({
    where: { id },
    data: {
      verified: true,
    },
  });
}

export async function DeleteVerificationRecord(token: string) {
  return await prisma.verification.delete({
    where: {
      token,
    },
  });
}

export async function GetUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: {
      email,
    },
  });
}

export async function GetUserById(id: string) {
  return await prisma.user.findUnique({
    where: {
      id,
    },
  });
}

export async function CreateLoginStrike(id: string) {
  return await prisma.strike.create({
    data: {
      userId: id,
    },
  });
}

// Return an array of user's login strikes within the last hour
export async function GetLoginStrikes(id: string) {
  let date = new Date();
  date.setHours(date.getHours() - 1);

  return await prisma.strike.findMany({
    where: { userId: id, strikeTime: { gte: date } },
  });
}

export async function GetVerificationRecord(key: string) {
  return await prisma.verification.findUnique({
    where: {
      token: key,
    },
  });
}

export async function CreateNewVerificationRecord(userId: string) {
  // Delete existing verification records first
  await prisma.verification.deleteMany({
    where: {
      userId,
    },
  });
  const token = randomString(26);
  const verificationRecord = await prisma.verification.create({
    data: {
      userId,
      token,
    },
  });

  // TODO:
  // Send user verification email
  // mailer.sendVerificationEmail(userId, token);
}

export async function CreatePasswordResetRecord(userId: string) {
  // Delete existing password reset records first
  await prisma.reset.deleteMany({
    where: {
      userId,
    },
  });
  const token = randomString(26);
  const passwordResetRecord = await prisma.reset.create({
    data: {
      userId,
      token,
    },
  });

  // TODO:
  // Send password reset email
  // mailer.sendPasswordResetEmail(userId, token)
}

export async function GetPasswordResetRecord(token: string) {
  return await prisma.reset.findUnique({
    where: {
      token,
    },
  });
}

export async function UpdatePassword({
  id,
  hash,
}: {
  id: string;
  hash: string;
}) {
  await prisma.user.update({
    where: { id },
    data: { hash },
  });
  // Delete all password reset records belonging to that user
  await prisma.reset.deleteMany({
    where: { userId: id },
  });
}
