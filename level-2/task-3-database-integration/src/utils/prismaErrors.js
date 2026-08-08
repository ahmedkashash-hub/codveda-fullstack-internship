import { Prisma } from '@prisma/client'

function isUniqueConstraintError(error) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  )
}

function isForeignKeyConstraintError(error) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2003'
  )
}

function isRecordNotFoundError(error) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2025'
  )
}

export {
  isForeignKeyConstraintError,
  isRecordNotFoundError,
  isUniqueConstraintError,
}
