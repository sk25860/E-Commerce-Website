async function filterProducts() {
   console.log("filterProducts called!");
   const name = document.getElementById('name').value;
      console.log("name: ", name);
   const priceRange = document.getElementById('priceRange').value;
     console.log("price range: ", priceRange);
   const favorite = document.getElementById('favorite').checked;
     console.log("favorite: ", favorite);
   
   const response = await fetch(`/filter-products?name=${name}&priceRange=${priceRange}&favorite=${favorite}`);
   const filteredProducts = await response.json();
   
   //populate productsContainer with the filtered products
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
                 <button class="cart-submit" type="submit">Add to Cart</button>
               </form>
            `;
         
         productsContainer.appendChild(productContainer);
      });
   document.getElementById('priceValue').innerHTML = "$" + document.getElementById('priceRange').value;
}

//initially load function
window.onload = async function () {
   console.log("calling filterProducts...");
   await filterProducts();
};

document.getElementById('name').addEventListener('input', filterProducts);
document.getElementById('priceRange').addEventListener('change', filterProducts);

document.getElementById('sortButton').addEventListener('click', function() {
   window.location.href = '/sort-products'; 
});
