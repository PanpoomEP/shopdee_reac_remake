import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  InputBase,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Badge,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Avatar,
  Box
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import { Link, useNavigate } from 'react-router-dom';

const categories = ['ทั้งหมด', 'เสื้อ', 'กางเกง', 'หมวก', 'ถุงเท้า', 'รองเท้า'];

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:4000/api/products")
      .then((response) => {
        if (response.data.status) {
          setProducts(response.data.products);
        }
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });
  }, []);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.productID === product.productID);
      if (existingItem) {
        return prevCart.map((item) =>
          item.productID === product.productID ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productID) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) =>
          item.productID === productID ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0);
    });
  };

  const handleCartOpen = () => {
    setCartOpen(true);
  };

  const handleCartClose = () => {
    setCartOpen(false);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryClick = (category) => {
    if (category === 'ทั้งหมด') {
      setSearchTerm('');
    } else {
      setSearchTerm(category);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('custID');
    localStorage.removeItem('username');
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    navigate('/signin');
  };

  const handleEditProfile = () => {
    navigate('/editprofile');
  };

  const firstName = localStorage.getItem('firstName');
  const lastName = localStorage.getItem('lastName');
  const profilePicture = localStorage.getItem('profilePicture');

  const filteredProducts = products.filter((product) =>
    product.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <AppBar position="static" sx={{ backgroundColor: "#4caf50" }}>
        <Toolbar>
          <img src="logo.webp" alt="Shopdee Logo" style={{ height: 50, marginRight: 16 }} />
          <div
            style={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              background: "white",
              borderRadius: 4,
              padding: "2px 10px",
            }}
          >
            <SearchIcon style={{ marginRight: 8, color: "gray" }} />
            <InputBase
              placeholder="ค้นหาสินค้า..."
              style={{ flexGrow: 1 }}
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <IconButton color="inherit" sx={{ marginLeft: 2 }} onClick={handleCartOpen}>
            <Badge badgeContent={cart.reduce((total, item) => total + item.quantity, 0)} color="secondary">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
          {firstName && lastName && (
            <Box display="flex" alignItems="center" onClick={handleMenuOpen} sx={{ cursor: 'pointer' }}>
              <Typography variant="body1" sx={{ marginRight: 2 }}>
                {firstName} {lastName}
              </Typography>
              <Avatar src={`/public/assets/profile/${profilePicture}`} />
            </Box>
          )}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleEditProfile}>Edit Profile</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container sx={{ flexGrow: 1, mt: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            {/* Category section */}
            <Box>
              <Typography variant="h4">หมวดหมู่</Typography>
              <List>
                {categories.map((category) => (
                  <ListItem button key={category} onClick={() => handleCategoryClick(category)}>
                    <ListItemText primary={category} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Grid>
          <Grid item xs={9}>
            {/* Best Sellers Section */}
            <Typography variant="h4" gutterBottom>
              สินค้าขายดี
            </Typography>
            <Grid container spacing={3}>
              {filteredProducts.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product.productID}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Link to={`/products/${product.productID}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <CardMedia
                        component="img"
                        height="300"
                        image={`http://localhost:4000/api/product/image/${product.imageFile}`}
                        alt={product.productName}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6">{product.productName}</Typography>
                        <Typography color="textSecondary">{product.productDetail}</Typography>
                        <Typography variant="body1" color="primary">
                          ราคา: {product.price} บาท
                        </Typography>
                      </CardContent>
                    </Link>
                    <Button
                      variant="contained"
                      color="success"
                      fullWidth
                      sx={{ mt: 'auto', backgroundColor: "#4caf50" }}
                      onClick={() => addToCart(product)}
                    >
                      เพิ่มลงตะกร้า
                    </Button>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>

      {/* Cart Dialog */}
      <Dialog open={cartOpen} onClose={handleCartClose}>
        <DialogTitle>ตะกร้าสินค้า</DialogTitle>
        <DialogContent>
          <List>
            {cart.length === 0 ? (
              <Typography variant="body1" textAlign="center">ไม่มีสินค้าในตะกร้า</Typography>
            ) : (
              cart.map((item) => (
                <ListItem key={item.productID}>
                  <ListItemText primary={item.productName} secondary={`ราคา: ${item.price} บาท, จำนวน: ${item.quantity}`} />
                  <IconButton onClick={() => removeFromCart(item.productID)}>
                    <RemoveIcon />
                  </IconButton>
                  <IconButton onClick={() => addToCart(item)}>
                    <AddIcon />
                  </IconButton>
                </ListItem>
              ))
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCartClose} color="primary">
            ปิด
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default HomePage;