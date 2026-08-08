const productSchema = `#graphql
  type Product {
    id: ID!
    name: String!
    description: String
    sku: String!
    price: String!
    stock: Int!
    isActive: Boolean!
    categoryId: ID!
    category: Category!
    createdAt: String!
    updatedAt: String!
  }

  type PageInfo {
    page: Int!
    limit: Int!
    totalItems: Int!
    totalPages: Int!
  }

  type ProductConnection {
    nodes: [Product!]!
    pageInfo: PageInfo!
  }

  extend type Query {
    product(id: ID!): Product
    products(
      page: Int = 1
      limit: Int = 10
      search: String
      categoryId: ID
      isActive: Boolean
    ): ProductConnection!
  }
`;

export default productSchema;
