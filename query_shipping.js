const query = `
  query {
    shippingZones(first: 10) {
      edges {
        node {
          id
          name
          countries {
            code
            country
          }
          channels {
            id
            slug
          }
        }
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
