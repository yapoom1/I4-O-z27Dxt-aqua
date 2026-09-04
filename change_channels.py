import requests
import json

SALEOR_API_URL = "https://aquacare.udayamarketing.in/graphql/"
EMAIL = "aquacare@gmail.com"
PASSWORD = "1234567890"

OLD_CHANNEL_ID = "Q2hhbm5lbDox" # default-channel
NEW_CHANNEL_ID = "Q2hhbm5lbDoy" # india_channel

def get_token():
    query = '''
    mutation tokenCreate($email: String!, $password: String!) {
      tokenCreate(email: $email, password: $password) {
        token
      }
    }
    '''
    res = requests.post(SALEOR_API_URL, json={'query': query, 'variables': {'email': EMAIL, 'password': PASSWORD}})
    return res.json()['data']['tokenCreate']['token']

import time

def run_graphql_query(query, variables, headers, retries=3):
    payload = {"query": query, "variables": variables}
    for attempt in range(retries):
        try:
            response = requests.post(SALEOR_API_URL, json=payload, headers=headers)
            if response.status_code != 200:
                print(f"Query failed with status code {response.status_code}. Response: {response.text}")
                if response.status_code in [502, 503, 504, 522, 524]:
                    print("Server error, retrying...")
                    time.sleep(2)
                    continue
                else:
                    raise Exception(f"Query failed with status code {response.status_code}.")
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Request exception: {e}")
            time.sleep(2)
    raise Exception("Max retries exceeded")

import pandas as pd

def main():
    token = get_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    csv_path = r"c:\Users\Admin\Downloads\whatsapp-catalogue-cleaned.csv"
    df = pd.read_csv(csv_path)

    print("Fetching products...")
    # Get all products
    query_products = """
    query {
      products(first: 100) {
        edges {
          node {
            id
            name
            variants {
              id
              channelListings {
                channel {
                  id
                }
                price {
                  amount
                }
              }
            }
          }
        }
      }
    }
    """
    res = run_graphql_query(query_products, None, headers)
    products = res['data']['products']['edges']
    
    for p in products:
        node = p['node']
        product_id = node['id']
        name = node['name']
        print(f"Updating {name}...")
        
        # 1. Update Product Channel Listing
        product_channel_query = """
        mutation ProductChannelListingUpdate($id: ID!, $input: ProductChannelListingUpdateInput!) {
            productChannelListingUpdate(id: $id, input: $input) {
                errors { field message }
            }
        }
        """
        channel_input = {
            "updateChannels": [
                {
                    "channelId": NEW_CHANNEL_ID,
                    "isPublished": True,
                    "isAvailableForPurchase": True
                }
            ],
            "removeChannels": [OLD_CHANNEL_ID]
        }
        res_ch = run_graphql_query(product_channel_query, {"id": product_id, "input": channel_input}, headers)
        errs = res_ch.get("data", {}).get("productChannelListingUpdate", {}).get("errors", [])
        if errs:
            print(f"  Error updating product channel: {errs}")
            
        # 2. Update Variant Channel Listing
        variants = node['variants']
        for v in variants:
            variant_id = v['id']
            # Find the price in the old channel
            price_amount = None
            for cl in v['channelListings']:
                if cl['channel']['id'] == OLD_CHANNEL_ID:
                    price_amount = cl['price']['amount']
                    break
            
            if price_amount is None:
                # Try to get it from CSV
                row = df[df['name'] == name]
                if not row.empty:
                    price_amount = row.iloc[0]['price_value']
                else:
                    print(f"  No price found for variant {variant_id}. Skipping...")
                    continue
                
            variant_channel_query = """
            mutation ProductVariantChannelListingUpdate($id: ID!, $input: [ProductVariantChannelListingAddInput!]!) {
                productVariantChannelListingUpdate(id: $id, input: $input) {
                    errors { field message }
                }
            }
            """
            variant_channel_input = [
                {
                    "channelId": NEW_CHANNEL_ID,
                    "price": price_amount
                }
            ]
            res_vch = run_graphql_query(variant_channel_query, {"id": variant_id, "input": variant_channel_input}, headers)
            v_errs = res_vch.get("data", {}).get("productVariantChannelListingUpdate", {}).get("errors", [])
            if v_errs:
                print(f"  Error updating variant channel: {v_errs}")

    print("Finished updating channels.")

if __name__ == "__main__":
    main()
