import { addManyProducts, getProducts } from "../Dao/DB/products.service.js";

const generateRandomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
  
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters[randomIndex];
    }
  
    return code;
};
  

const generateMockProducts = async () => {
    const mockProducts = [];
    
    //Sí, podría haber usado Faker, pero quería hacerlo
    //lo más generico posible.
    for (let i = 1; i <= 100; i++) {
        const mockProduct = {
            title: `Product ${i}`,
            description: `Description ${i}`,
            price: i * 10,
            thumbnail: `thumbnail${i}.jpg`,
            code: generateRandomCode(),
            stock: 10,
            category: `Category ${i}`,
            status: true
        };
          
      
        mockProducts.push(mockProduct);
    }
    
    try {
      await addManyProducts(mockProducts);
      console.log('Mock products created successfully.');
    } catch (error) {
        customError(500, 'Error creating mock products.');
        //console.error('Error creating mock products:', error);
    }

    await getProducts();
};

export { generateMockProducts }