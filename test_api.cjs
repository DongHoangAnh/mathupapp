const axios = require('axios');
axios.get('http://0.0.0.0:5000/api/videos?grade=2').then(res => console.log(res.data.length)).catch(e => console.error(e.message));
