const baseSchema = `#graphql
  type Health {
    status: String!
    service: String!
  }

  type Query {
    health: Health!
  }
`;

export default baseSchema;
