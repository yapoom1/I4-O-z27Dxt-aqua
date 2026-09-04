import requests
query = """
query {
  __type(name: "StockInput") {
    name
    inputFields {
      name
      type {
        name
        kind
        ofType {
          name
          kind
        }
      }
    }
  }
}
"""
res = requests.post('https://aquacare.udayamarketing.in/graphql/', json={'query': query})
print(res.json())

