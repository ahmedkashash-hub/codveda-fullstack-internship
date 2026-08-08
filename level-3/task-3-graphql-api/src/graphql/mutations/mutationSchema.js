const mutationSchema = `#graphql
  input CreateCategoryInput {
    name: String!
    description: String
  }

  input UpdateCategoryInput {
    name: String
    description: String
  }

  input CreateProductInput {
    name: String!
    description: String
    sku: String!
    price: String!
    stock: Int
    isActive: Boolean
    categoryId: ID!
  }

  input UpdateProductInput {
    name: String
    description: String
    sku: String
    price: String
    stock: Int
    isActive: Boolean
    categoryId: ID
  }

  type CategoryMutationPayload {
    category: Category!
  }

  type ProductMutationPayload {
    product: Product!
  }

  type DeletePayload {
    success: Boolean!
    id: ID!
  }

  type Mutation {
    createCategory(input: CreateCategoryInput!): CategoryMutationPayload!
    updateCategory(id: ID!, input: UpdateCategoryInput!): CategoryMutationPayload!
    deleteCategory(id: ID!): DeletePayload!
    createProduct(input: CreateProductInput!): ProductMutationPayload!
    updateProduct(id: ID!, input: UpdateProductInput!): ProductMutationPayload!
    deleteProduct(id: ID!): DeletePayload!
  }
`;

export default mutationSchema;
