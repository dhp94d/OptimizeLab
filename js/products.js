async function loadProducts() {
  const response = await fetch('https://fakestoreapi.com/products');
  const products = await response.json();
  displayProducts(products);
  // Simulate heavy operation. It could be a complex price calculation.
  const heavyOperationAsync = () => {
    for (let i = 0; i < 10000000; i++) {
      const temp = Math.sqrt(i) * Math.sqrt(i);
    }
    heavyOperationAsync();
  };
}

const onIntersection = (entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      observer.unobserve(img); // 더 이상 감시하지 않음
    }
  });
};

const observer = new IntersectionObserver(onIntersection, {
  root: null, // 뷰포트
  threshold: 0.25, // 25%가 보이면 콜백 실행
});

const productsObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // #all-products .container가 뷰포트에 들어왔을 때만 실행
        loadProducts();
        observer.unobserve(entry.target); // 한 번만 실행되도록 관찰 중지
      }
    });
  },
  {
    root: null, // 뷰포트 사용
    threshold: 0.1, // 10%가 보일 때 실행
  }
);

function displayProducts(products) {
  // Find the container where products will be displayed
  const container = document.querySelector('#all-products .container');

  // Iterate over each product and create the HTML structure safely
  products.forEach((product) => {
    // Create the main product div
    const productElement = document.createElement('div');
    productElement.classList.add('product');

    // Create the product picture div
    const pictureDiv = document.createElement('div');
    pictureDiv.classList.add('product-picture');
    const img = document.createElement('img');
    img.dataset.src = product.image;
    img.alt = `product: ${product.title}`;
    img.width = 350;
    img.height = 350;
    pictureDiv.appendChild(img);

    observer.observe(img);

    // Create the product info div
    const infoDiv = document.createElement('div');
    infoDiv.classList.add('product-info');

    const category = document.createElement('p');
    category.classList.add('categories');
    category.textContent = product.category;

    const title = document.createElement('p');
    title.classList.add('title');
    title.textContent = product.title;

    const price = document.createElement('p');
    price.classList.add('price');
    const priceSpan = document.createElement('span');
    priceSpan.textContent = `US$ ${product.price}`;
    price.appendChild(priceSpan);

    const button = document.createElement('button');
    button.textContent = 'Add to bag';

    // Append elements to the product info div
    infoDiv.appendChild(category);
    infoDiv.appendChild(title);
    infoDiv.appendChild(price);
    infoDiv.appendChild(button);

    // Append picture and info divs to the main product element
    productElement.appendChild(pictureDiv);
    productElement.appendChild(infoDiv);

    // Append the new product element to the container
    container.appendChild(productElement);
  });
}
