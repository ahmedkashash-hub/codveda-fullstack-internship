const authSchema = `#graphql
  enum Role {
    USER
    ADMIN
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: Role!
    createdAt: String!
    updatedAt: String!
  }

  input RegisterInput {
    name: String!
    email: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type AuthPayload {
    user: User!
    token: String!
  }

  extend type Query {
    currentUser: User
  }

  extend type Mutation {
    register(input: RegisterInput!): User!
    login(input: LoginInput!): AuthPayload!
  }
`;

export default authSchema;
