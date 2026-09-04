import os
import json
import base64
import requests
import pandas as pd

# Configuration - Set your instance details here
SALEOR_API_URL = "https://aquacare.udayamarketing.in/graphql/"
EMAIL = "aquacare@gmail.com"
PASSWORD = "1234567890"

def get_token():
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
        'email': EMAIL,
        'password': PASSWORD
    }
    response = requests.post(SALEOR_API_URL, json={'query': query, 'variables': variables})
    if response.status_code != 200:
        print(f"Failed to get token: {response.status_code} {response.text}")
    data = response.json()
    token = data.get('data', {}).get('tokenCreate', {}).get('token')
    if not token:
        raise Exception(f"Failed to get token: {data}")
    return token

def get_ids(headers):
    query_ids = '''
    query {
      channels { id slug }
      productTypes(first: 1) { edges { node { id name } } }
      categories(first: 1) { edges { node { id name } } }
    }
    '''
    res = requests.post(SALEOR_API_URL, json={'query': query_ids}, headers=headers)
    data = res.json()
    channel_id = data['data']['channels'][0]['id']
    product_type_id = data['data']['productTypes']['edges'][0]['node']['id']
    category_id = data['data']['categories']['edges'][0]['node']['id']
    return channel_id, product_type_id, category_id

def create_editorjs_description(text):
    """
    Saleor uses Editor.js format for descriptions.
    """
    return json.dumps({
        "blocks": [
            {
                "type": "paragraph",
                "data": {
                    "text": text
                }
            }
        ]
    })

def run_graphql_query(query, variables, headers):
    payload = {"query": query}
    if variables:
        payload["variables"] = variables

    response = requests.post(SALEOR_API_URL, json=payload, headers=headers)
    if response.status_code != 200:
        raise Exception(f"Query failed with status code {response.status_code}. Response: {response.text}")
    return response.json()

def upload_image(product_id, image_data_base64, headers, filename="image.jpg"):
    """
    Uploads an image via GraphQL multipart request.
    """
    if image_data_base64.startswith("data:image"):
        # Remove data:image/jpeg;base64, prefix
        image_data_base64 = image_data_base64.split(",")[1]
        
    image_bytes = base64.b64decode(image_data_base64)
    
    query = """
    mutation ProductMediaCreate($product: ID!, $image: Upload!) {
        productMediaCreate(product: $product, input: {image: $image}) {
            media {
                url
            }
            errors {
                field
                message
            }
        }
    }
    """
    
    operations = json.dumps({
        "query": query,
        "variables": {
            "product": product_id,
            "image": None
        }
    })
    
    file_map = json.dumps({"0": ["variables.image"]})
    
    files = {
        "operations": (None, operations, "application/json"),
        "map": (None, file_map, "application/json"),
        "0": (filename, image_bytes, "image/jpeg")
    }
    
    upload_headers = {"Authorization": headers["Authorization"]}
    response = requests.post(SALEOR_API_URL, headers=upload_headers, files=files)
    return response.json()

def main():
    print("Authenticating...")
    token = get_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    print("Fetching IDs...")
    CHANNEL_ID, PRODUCT_TYPE_ID, CATEGORY_ID = get_ids(headers)
    print(f"Using Channel: {CHANNEL_ID}, ProductType: {PRODUCT_TYPE_ID}, Category: {CATEGORY_ID}")

    csv_path = r"c:\Users\Admin\Downloads\whatsapp-catalogue-cleaned.csv"
    if not os.path.exists(csv_path):
        print(f"CSV file not found at {csv_path}")
        return

    try:
        df = pd.read_csv(csv_path)
    except Exception as e:
        print(f"Error reading CSV: {e}")
        return
    
    for index, row in df.iterrows():
        name = row.get("name")
        price = row.get("price_value")
        description = row.get("description")
        image_data = row.get("image_data")
        
        if pd.isna(name) or pd.isna(price):
            print(f"Skipping row {index}: missing name or price")
            continue
            
        print(f"\nUploading {name}...")
        
        # 1. Create Product
        product_create_query = """
        mutation ProductCreate($input: ProductCreateInput!) {
            productCreate(input: $input) {
                product {
                    id
                }
                errors {
                    field
                    message
                }
            }
        }
        """
        product_input = {
            "name": name,
            "productType": PRODUCT_TYPE_ID,
            "category": CATEGORY_ID,
            "description": create_editorjs_description(description) if pd.notna(description) else None
        }
        
        res = run_graphql_query(product_create_query, {"input": product_input}, headers)
        errors = res.get("data", {}).get("productCreate", {}).get("errors", [])
        if errors:
            print(f"  Error creating product: {errors}")
            continue
            
        product_id = res["data"]["productCreate"]["product"]["id"]
        print(f"  Product created with ID: {product_id}")
        
        # 2. Update Channel Listing (Product)
        product_channel_query = """
        mutation ProductChannelListingUpdate($id: ID!, $input: ProductChannelListingUpdateInput!) {
            productChannelListingUpdate(id: $id, input: $input) {
                errors {
                    field
                    message
                }
            }
        }
        """
        channel_input = {
            "updateChannels": [
                {
                    "channelId": CHANNEL_ID,
                    "isPublished": True,
                    "visibleInListings": True,
                    "isAvailableForPurchase": True
                }
            ]
        }
        res_ch = run_graphql_query(product_channel_query, {"id": product_id, "input": channel_input}, headers)
        ch_errors = res_ch.get("data", {}).get("productChannelListingUpdate", {}).get("errors", [])
        if ch_errors:
            print(f"  Warning: product channel update errors: {ch_errors}")
        
        # 3. Create Variant
        variant_create_query = """
        mutation ProductVariantCreate($input: ProductVariantCreateInput!) {
            productVariantCreate(input: $input) {
                productVariant {
                    id
                }
                errors {
                    field
                    message
                }
            }
        }
        """
        variant_input = {
            "product": product_id,
            "trackInventory": False,
            "attributes": []
        }
        res_var = run_graphql_query(variant_create_query, {"input": variant_input}, headers)
        var_errors = res_var.get("data", {}).get("productVariantCreate", {}).get("errors", [])
        if var_errors:
            print(f"  Error creating variant: {var_errors}")
            continue
            
        variant_id = res_var["data"]["productVariantCreate"]["productVariant"]["id"]
        
        # 4. Update Channel Listing (Variant - Price)
        variant_channel_query = """
        mutation ProductVariantChannelListingUpdate($id: ID!, $input: [ProductVariantChannelListingAddInput!]!) {
            productVariantChannelListingUpdate(id: $id, input: $input) {
                errors {
                    field
                    message
                }
            }
        }
        """
        variant_channel_input = [
            {
                "channelId": CHANNEL_ID,
                "price": price
            }
        ]
        res_var_ch = run_graphql_query(variant_channel_query, {"id": variant_id, "input": variant_channel_input}, headers)
        var_ch_errors = res_var_ch.get("data", {}).get("productVariantChannelListingUpdate", {}).get("errors", [])
        if var_ch_errors:
            print(f"  Warning: variant channel update errors: {var_ch_errors}")
        
        # 5. Upload Image
        if pd.notna(image_data) and str(image_data).startswith("data:image"):
            print("  Uploading image...")
            upload_res = upload_image(product_id, image_data, headers)
            media_errors = upload_res.get("data", {}).get("productMediaCreate", {}).get("errors", [])
            if media_errors:
                print(f"  Error uploading image: {media_errors}")
            else:
                print("  Image uploaded successfully.")
        
        print("  Upload complete for", name)

if __name__ == "__main__":
    main()
