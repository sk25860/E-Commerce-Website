async function filterProducts() {
   const name = document.getElementById('name').value;
   const priceRange = document.getElementById('priceRange').value;
   const favorite = document.getElementById('favorite').checked;
   
   const response = await fetch(`/filter-products?name=${name}&priceRange=${priceRange}&favorite=${favorite}`);
   const filteredProducts = await response.json();
   
   const productsContainer = document.getElementById('products-container');
      productsContainer.innerHTML = '';
      filteredProducts.forEach(product => {
         const productContainer = document.createElement('div');
         if (product.favorite) {
            productContainer.className = 'product-container-favorite';
         } else {
            productContainer.className = 'product-container';
         }
         productContainer.innerHTML = `
               <img src="${product.image}" alt="${product.name}" style="max-width: 200px;">
               <h3 class="product-name">${product.name}</h3>
               <p>$${product.price}</p>
               <p>${product.quantity} left</p>
               ${product.favorite ? '<p>Favorite Item!</p>' : ''}
               <form method="POST" action="/addToCart">
                 <input type="hidden" name="productId" value="${product._id}">
                 <button type="submit">Add to Cart</button>
               </form>
            `;
         
         productsContainer.appendChild(productContainer);
      });
   document.getElementById('priceValue').innerHTML = "$" + document.getElementById('priceRange').value;
}

window.onload = async function () {
   await filterProducts();
};

document.getElementById('name').addEventListener('input', filterProducts);
document.getElementById('priceRange').addEventListener('change', filterProducts);


console.log(customer);
