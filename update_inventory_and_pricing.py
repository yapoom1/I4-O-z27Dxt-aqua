import os
import json
import time
import re
import requests
import pandas as pd

SALEOR_API_URL = "https://aquacare.udayamarketing.in/graphql/"
EMAIL = "aquacare@gmail.com"
PASSWORD = "1234567890"

WAREHOUSE_ID = "V2FyZWhvdXNlOjk4ODVmNzEwLWQ0YmUtNDY5Ni1hMTk3LWUyYjM0ZTNmODRkMA=="
CHANNEL_ID = "Q2hhbm5lbDoy" # india_channel

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

def main():
    token = get_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    csv_path = r"c:\Users\Admin\Downloads\whatsapp-catalogue-cleaned.csv"
    try:
        df = pd.read_csv(csv_path)
    except Exception as e:
        print(f"Error reading CSV: {e}")
        return

    print("Fetching products...")
    query_products = """
    query {
      products(first: 100) {
        edges {
          node {
            id
            name
            variants {
              id
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
        name = node['name']
        print(f"Updating {name}...")
        
        # Get prices from CSV
        row = df[df['name'] == name]
        if row.empty:
            print(f"  No CSV data found for {name}. Skipping...")
            continue
            
        selling_price = row.iloc[0]['price_value']
        raw_text = str(row.iloc[0].get('raw_text', ''))
        
        # Parse original price: ₹19,500.00 ₹22,500.00 -> 22500.0
        original_price = None
        match = re.search(r'₹[\d,.]+\s+₹([\d,.]+)', raw_text)
        if match:
            original_price = float(match.group(1).replace(',', ''))
        
        variants = node['variants']
        for v in variants:
            variant_id = v['id']
            
            # 1. Update Inventory (add to default warehouse)
            inventory_query = """
            mutation ProductVariantStocksCreate($variantId: ID!, $stocks: [StockInput!]!) {
                productVariantStocksCreate(variantId: $variantId, stocks: $stocks) {
                    errors { field message }
                }
            }
            """
            inventory_input = {
                "variantId": variant_id,
                "stocks": [
                    {
                        "warehouse": WAREHOUSE_ID,
                        "quantity": 100
                    }
                ]
            }
            res_inv = run_graphql_query(inventory_query, inventory_input, headers)
            inv_errs = res_inv.get("data", {}).get("productVariantStocksCreate", {}).get("errors", [])
            if inv_errs:
                # Might already exist, try update
                if any(e.get("field") == "warehouse" for e in inv_errs):
                    # Try Update instead
                    inv_update_query = """
                    mutation ProductVariantStocksUpdate($variantId: ID!, $stocks: [StockInput!]!) {
                        productVariantStocksUpdate(variantId: $variantId, stocks: $stocks) {
                            errors { field message }
                        }
                    }
                    """
                    res_inv_upd = run_graphql_query(inv_update_query, inventory_input, headers)
                    upd_errs = res_inv_upd.get("data", {}).get("productVariantStocksUpdate", {}).get("errors", [])
                    if upd_errs:
                        print(f"  Error updating inventory: {upd_errs}")
                else:
                    print(f"  Error creating inventory: {inv_errs}")
                    
            # 2. Update Pricing
            variant_channel_query = """
            mutation ProductVariantChannelListingUpdate($id: ID!, $input: [ProductVariantChannelListingAddInput!]!) {
                productVariantChannelListingUpdate(id: $id, input: $input) {
                    errors { field message }
                }
            }
            """
            
            price_input = {
                "channelId": CHANNEL_ID,
                "price": selling_price
            }
            if original_price:
                price_input["priorPrice"] = original_price
                
            variant_channel_input = [price_input]
            
            res_vch = run_graphql_query(variant_channel_query, {"id": variant_id, "input": variant_channel_input}, headers)
            v_errs = res_vch.get("data", {}).get("productVariantChannelListingUpdate", {}).get("errors", [])
            if v_errs:
                print(f"  Error updating pricing: {v_errs}")

    print("Finished updating inventory and pricing.")

if __name__ == "__main__":
    main()
