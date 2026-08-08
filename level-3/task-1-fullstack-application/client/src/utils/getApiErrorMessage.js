export default function getApiErrorMessage(error) {
  if (typeof error?.response?.data?.message === 'string') {
    return error.response.data.message;
  }

  if (error?.request) {
    return 'The service is unavailable. Please try again shortly.';
  }

  return 'Something went wrong. Please try again.';
}
