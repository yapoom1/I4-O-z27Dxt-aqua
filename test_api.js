fetch('http://localhost:3000/api/checkout/complete', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phone: '+919999999999',
    address: {
      firstName: 'Test',
      lastName: 'User',
      streetAddress1: '123 Test St',
      city: 'New Delhi',
      state: 'Delhi',
      postalCode: '110001',
      country: 'IN'
    }
  })
})
.then(res => res.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
.catch(err => console.error(err));
