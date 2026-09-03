const query = `
  mutation {
    checkoutCreate(
      input: {
        channel: "default-channel"
        email: "test@example.com"
        lines: [
          {
            quantity: 1
            variantId: "UHJvZHVjdFZhcmlhbnQ6Mjg1"
          }
        ]
        shippingAddress: {
          firstName: "Test"
          lastName: "User"
          streetAddress1: "123 Test St"
          city: "New Delhi"
          countryArea: "Delhi"
          postalCode: "110001"
          country: IN
          phone: "+919999999999"
        }
        billingAddress: {
          firstName: "Test"
          lastName: "User"
          streetAddress1: "123 Test St"
          city: "New Delhi"
          countryArea: "Delhi"
          postalCode: "110001"
          country: IN
          phone: "+919999999999"
        }
      }
    ) {
      checkout {
        id
        shippingMethods {
          id
          name
          price {
            amount
            currency
          }
        }
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

fetch('https://aquacare.udayamarketing.in/graphql/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query })
})
.then(res => res.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
.catch(err => console.error(err));
