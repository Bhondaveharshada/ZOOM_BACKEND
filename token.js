/* const axios = require('axios');
const jwt = require('jsonwebtoken');

// Zoom API details
const ZOOM_API_KEY = 'v_ILNsd6RIaXDo60R4yviQ';
const ZOOM_API_SECRET = 'UGpRsljbTZ4MztYHAlefPaVkHpWxVr95';
const ZOOM_USER_LIST_API = 'https://api.zoom.us/v2/users';

// Generate Zoom JWT Token
function generateZoomJwtToken() {
  const payload = {
    iss: ZOOM_API_KEY,
    exp: Math.floor(Date.now() / 1000) + 60 // Token expiration in seconds
  };
  return jwt.sign(payload, ZOOM_API_SECRET, { algorithm: 'HS256' });
}

async function getUsers() {
  try {
    const token = generateZoomJwtToken();
    console.log("token is", token);
    

    const response = await axios.get(ZOOM_USER_LIST_API, {
      headers: {
        'Authorization': `Bearer eyJzdiI6IjAwMDAwMSIsImFsZyI6IkhTNTEyIiwidiI6IjIuMCIsImtpZCI6ImNhOThkNzAzLWNhNDEtNGQwMy04OTk3LTE2NjQxMGFiMTJmMSJ9.eyJ2ZXIiOjEwLCJhdWlkIjoiOTk1OTM1Y2I3NzNjODA5YzFkMjYwNmY3ZWU5MGU4OGM1YTJhNDlmZjZiYTJkMGU4ZjI3YjQ5YTA2YzMyYzhlNiIsImNvZGUiOiJXMWw0bndETWpJOHNSTUVRcHhHUjlxZTdmTWh1c2dMd0EiLCJpc3MiOiJ6bTpjaWQ6dl9JTE5zZDZSSWFYRG82MFI0eXZpUSIsImdubyI6MCwidHlwZSI6MCwidGlkIjowLCJhdWQiOiJodHRwczovL29hdXRoLnpvb20udXMiLCJ1aWQiOiJTalUxNHpaalIzMjZ4QW82OWdsRzNRIiwibmJmIjoxNzI2ODMyNDYxLCJleHAiOjE3MjY4MzYwNjEsImlhdCI6MTcyNjgzMjQ2MSwiYWlkIjoiZmhTbVpOeW5SUjZScl9kT25qNjhldyJ9.V-kUgXcOrU1vg2pAy7ZZMH79BnwaA8UgK3jD4-_t8G6Rz53ZrT6f3FnUoWgOmeTQq-mS_OjPzIvbm7wJ1etspg`,  // Use the generated JWT token
        'Content-Type': 'application/json',
      },
    });

    const users = response.data.users;
    users.forEach(user => {
      console.log(`User ID: ${user.id}, Email: ${user.email}`);
    });
  } catch (error) {
    console.error('Error fetching users:', error.response ? error.response.data : error.message);
  }
}

getUsers();








// Function to generate JWT token
/* router.post('/generateZoomJwtToken', (req, res) => {
    const payload = {
      iss: API_KEY,   // Issuer (your API key)
      exp: Math.floor(Date.now() / 1000) + 5, // Token expiration (5 seconds in future)
    };
  
    // Generate the token
    const token = jwt.sign(payload, API_SECRET, { algorithm: 'HS256' });
  
    // Return the token in the response
    res.json({ token });
  }); */
  

// Generate the token


//user_id = SjU14zZjR326xAo69glG3Q
//User ID: SjU14zZjR326xAo69glG3Q, Email: harshadabhondave09@gmail.com */