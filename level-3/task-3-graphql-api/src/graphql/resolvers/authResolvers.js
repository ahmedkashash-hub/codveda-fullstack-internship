import { requireAuth } from '../../auth/authorization.js';
import { getUserById, loginUser, registerUser } from '../../services/authService.js';
import { unauthenticated } from '../../utils/graphqlErrors.js';

const authResolvers = {
  Query: {
    currentUser: async (_parent, _args, context) => {
      const { userId } = requireAuth(context);
      const user = await getUserById(userId);
      if (!user) throw unauthenticated();
      return user;
    },
  },
  Mutation: {
    register: (_parent, { input }) => registerUser(input),
    login: (_parent, { input }) => loginUser(input),
  },
};

export default authResolvers;
