const productsContainer = document.getElementById('products');
const productCount = document.getElementById('product-count');

async function loadProducts() {
    try {
        const response = await fetch('http://localhost:3000/products');

        if (!response.ok) {
            throw new Error('Failed to fetch products.');
        }

        const products = await response.json();

        productCount.textContent = `${products.length} products`;

        if (products.length === 0) {
            productsContainer.innerHTML =
                '<p class="state-message">No products found.</p>';
            return;
        }

        productsContainer.innerHTML = products
            .map(
                (product) => `
                    <article class="product-card">
                        <div class="product-id">#${product.id}</div>
                        <h2>${product.name}</h2>
                        <p class="product-price">$${product.price}</p>
                    </article>`
                
            )
            .join('');
    } catch (error) {
        console.error(error);

        productCount.textContent = 'Unavailable';

        productsContainer.innerHTML = `
            <p class="state-message error-message">
                Failed to load products. Make sure the API is running.
            </p>
        `;
    }
}

loadProducts();
