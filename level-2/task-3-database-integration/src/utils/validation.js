import AppError from './AppError.js'

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function requiredString(value, fieldName, { min, max }) {
  if (typeof value !== 'string') {
    throw new AppError(`${fieldName} is required`, 400)
  }

  const normalized = value.trim()

  if (normalized.length < min || normalized.length > max) {
    throw new AppError(
      `${fieldName} must be between ${min} and ${max} characters`,
      400,
    )
  }

  return normalized
}

function optionalString(value, fieldName, max) {
  if (value === undefined || value === null) {
    return null
  }

  if (typeof value !== 'string') {
    throw new AppError(`${fieldName} must be a string`, 400)
  }

  const normalized = value.trim()

  if (normalized.length > max) {
    throw new AppError(`${fieldName} must not exceed ${max} characters`, 400)
  }

  return normalized || null
}

function validUuid(value, fieldName) {
  if (typeof value !== 'string' || !UUID_PATTERN.test(value.trim())) {
    throw new AppError(`${fieldName} must be a valid UUID`, 400)
  }

  return value.trim().toLowerCase()
}

export { optionalString, requiredString, validUuid }
