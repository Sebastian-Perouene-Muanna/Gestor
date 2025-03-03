document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById('product-form');
    const productList = document.getElementById('products');
    const alertMessages = document.getElementById('alert-messages');
  
    let products = JSON.parse(localStorage.getItem('products')) || [];
    let editIndex = -1;
  
    // Guarda la lista de productos en localStorage
    function saveProducts() {
      localStorage.setItem('products', JSON.stringify(products));
    }
  
    // Calcula los días restantes para el vencimiento
    function getDaysLeft(expiryDate) {
      const now = new Date();
      const exp = new Date(expiryDate);
      const diffTime = exp - now;
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
  
    // Renderiza la lista de productos
    function renderProducts() {
      productList.innerHTML = '';
  
      // Ordena los productos por fecha de vencimiento (ascendente)
      const sortedProducts = [...products].sort(
        (a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)
      );
  
      // Crea elementos en la lista
      sortedProducts.forEach((product) => {
        const li = document.createElement('li');
        li.innerHTML = `
          <strong>${product.name}</strong> 
          (Código: ${product.code}) 
          - Categoría: ${product.category}
          - Vence: ${product.expiryDate}
          <div>
            <button class="btn-delete">Eliminar</button>
            <button class="btn-edit">Editar</button>
          </div>
        `;
  
        // Botón eliminar
        li.querySelector('.btn-delete').addEventListener('click', () => {
          const realIndex = products.findIndex(
            (p) =>
              p.name === product.name &&
              p.code === product.code &&
              p.expiryDate === product.expiryDate
          );
          deleteProduct(realIndex);
        });
  
        // Botón editar
        li.querySelector('.btn-edit').addEventListener('click', () => {
          const realIndex = products.findIndex(
            (p) =>
              p.name === product.name &&
              p.code === product.code &&
              p.expiryDate === product.expiryDate
          );
          editProduct(realIndex);
        });
  
        // Resalta productos próximos a vencer
        const daysLeft = getDaysLeft(product.expiryDate);
        if (daysLeft <= 3) {
          li.style.backgroundColor = '#ffb3b3'; // Muy cerca de vencer
        } else if (daysLeft <= 30) {
          li.style.backgroundColor = '#fff0b3'; // Queda menos de un mes
        }
  
        productList.appendChild(li);
      });
    }
  
    // Añade o edita un producto
    function addProduct(product) {
      if (editIndex === -1) {
        products.push(product);
      } else {
        products[editIndex] = product;
        editIndex = -1;
      }
      saveProducts();
      renderProducts();
    }
  
    // Elimina un producto por índice
    function deleteProduct(index) {
      products.splice(index, 1);
      saveProducts();
      renderProducts();
    }
  
    // Prepara el formulario para editar
    function editProduct(index) {
      const product = products[index];
      document.getElementById('product-name').value = product.name;
      document.getElementById('product-code').value = product.code;
      document.getElementById('product-category').value = product.category;
      document.getElementById('expiry-date').value = product.expiryDate;
      editIndex = index;
    }
  
    // Chequea las fechas de vencimiento y muestra alertas
    function checkExpiryDates() {
      const alerts = [];
  
      products.forEach((product) => {
        const daysLeft = getDaysLeft(product.expiryDate);
  
        // Ajusta los mensajes según tus umbrales
        if (daysLeft <= 3 && daysLeft >= 0) {
          alerts.push(`¡Atención! Quedan ${daysLeft} día(s) para que venza ${product.name}.`);
        } else if (daysLeft < 0) {
          alerts.push(
            `El producto ${product.name} ya está vencido (${Math.abs(daysLeft)} día(s) atrás).`
          );
        } else if (daysLeft === 30) {
          alerts.push(
            `Sugerencia de precio para ${product.name}. Queda 1 mes para su vencimiento.`
          );
        }
      });
  
      if (alerts.length > 0) {
        alertMessages.innerHTML = alerts.map((alert) => `<p>${alert}</p>`).join('');
        alertMessages.style.display = 'block';
      } else {
        alertMessages.style.display = 'none';
      }
    }
  
    // Evento al enviar el formulario
    productForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const name = document.getElementById('product-name').value;
      const code = document.getElementById('product-code').value;
      const category = document.getElementById('product-category').value;
      const expiryDate = document.getElementById('expiry-date').value;
  
      // Crea/edita el objeto producto
      addProduct({ name, code, category, expiryDate });
      productForm.reset();
    });
  
    // Inicializa la app
    renderProducts();
    checkExpiryDates(); // Muestra alertas inmediatamente
    setInterval(checkExpiryDates, 60000); // Comprobar cada minuto
  
    // Funciones globales (si requieres llamarlas desde el HTML)
    window.deleteProduct = deleteProduct;
    window.editProduct = editProduct;
  });
  