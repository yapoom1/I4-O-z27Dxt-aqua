import requests

url = 'https://aquacare.udayamarketing.in/graphql/'
query = '''
mutation tokenCreate($email: String!, $password: String!) {
  tokenCreate(email: $email, password: $password) {
    token
    errors {
      field
      message
    }
  }
}
'''
variables = {
    'email': 'aquacare@gmail.com',
    'password': '1234567890'
}

response = requests.post(url, json={'query': query, 'variables': variables})
print('Token Response:', response.json())

if 'data' in response.json() and response.json()['data']['tokenCreate']['token']:
    token = response.json()['data']['tokenCreate']['token']
    headers = {'Authorization': f'Bearer {token}'}
    
    # Query IDs
    query_ids = '''
    query {
      channels {
        id
        slug
      }
      productTypes(first: 1) {
        edges {
          node {
            id
            name
          }
        }
      }
      categories(first: 1) {
        edges {
          node {
            id
            name
          }
        }
      }
    }
    '''
    res_ids = requests.post(url, json={'query': query_ids}, headers=headers)
    print('IDs Response:', res_ids.json())
