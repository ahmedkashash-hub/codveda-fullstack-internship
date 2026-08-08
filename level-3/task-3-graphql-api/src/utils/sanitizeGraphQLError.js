const AUTH_INPUT_PATTERN = /RegisterInput|LoginInput|input\.password|input:.*password/i;

export const sanitizeGraphQLError = (formattedError) => {
  if (
    !formattedError.message.startsWith('Variable "$input"') ||
    !AUTH_INPUT_PATTERN.test(formattedError.message)
  ) {
    return formattedError;
  }

  return {
    message: 'Invalid authentication input.',
    extensions: {
      code: formattedError.extensions?.code ?? 'BAD_USER_INPUT',
    },
  };
};
