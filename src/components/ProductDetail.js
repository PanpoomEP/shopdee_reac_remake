import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Grid,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Button,
  Box,
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

function ProductDetail() {
  // ดึงค่า productID จาก URL โดยใช้ useParams
  const { productID } = useParams();
  // สร้าง state เพื่อเก็บข้อมูลสินค้า
  const [product, setProduct] = useState(null);

  useEffect(() => {
    // ฟังก์ชันสำหรับดึงข้อมูลสินค้า
    const fetchProduct = async () => {
      try {
        // เรียก API เพื่อดึงข้อมูลสินค้าโดยใช้ productID
        const response = await axios.get(`http://localhost:4000/api/products/${productID}`);
        // ตรวจสอบว่า API สำเร็จหรือไม่
        if (response.data.status) {
          // ตั้งค่าข้อมูลสินค้าที่ดึงมาให้กับ state product
          setProduct(response.data.product);
        } else {
          console.error('Error fetching product:', response.data.message);
          // TODO: Handle error, e.g., show an error message
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        // TODO: Handle error, e.g., show an error message
      }
    };

    // เรียกฟังก์ชัน fetchProduct เมื่อ component ถูก render
    fetchProduct();
  }, [productID]); // dependency array ระบุว่า useEffect จะทำงานใหม่เมื่อ productID เปลี่ยน

  // ถ้ายังไม่มีข้อมูลสินค้า แสดงข้อความ loading
  if (!product) {
    return <div>กำลังโหลดข้อมูลสินค้า...</div>;
  }

  // แสดงข้อมูลสินค้า
  return (
    <Container sx={{ py: 8 }}>
      <Grid container spacing={4}>
        {/* ส่วนของรูปภาพ */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardMedia
              component="img"
              image={`http://localhost:4000/api/product/image/${product.imageFile}`}
              alt={product.productName}
              sx={{
                width: '100%',
                height: 'auto',
                objectFit: 'contain',
              }}
            />
          </Card>
        </Grid>
        {/* ส่วนของรายละเอียดสินค้า */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {product.productName}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" paragraph>
              {product.productDetail}
            </Typography>
            <Typography variant="h5" color="primary" sx={{ mb: 2 }}>
              ราคา: {product.price} บาท
            </Typography>
            {/* ปุ่มเพิ่มลงตะกร้า */}
            <Button
              variant="contained"
              color="success" // Change to green
              startIcon={<AddShoppingCartIcon />}
              sx={{ mt: 'auto' }}
              //TODO add to cart
            >
              เพิ่มลงตะกร้า
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}

export default ProductDetail;
