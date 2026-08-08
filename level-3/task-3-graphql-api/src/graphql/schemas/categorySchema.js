const categorySchema = `#graphql
  type Category {
    id: ID!
    name: String!
    description: String
    createdAt: String!
    updatedAt: String!
    products: [Product!]!
  }

  extend type Query {
    category(id: ID!): Category
    categories: [Category!]!
  }
`;

export default categorySchema;
