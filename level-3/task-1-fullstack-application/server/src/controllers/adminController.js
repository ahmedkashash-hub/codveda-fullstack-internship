export const getAdminDashboard = (_request, response) => {
  response.status(200).json({
    message: 'Welcome to the admin dashboard',
  });
};
