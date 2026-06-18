import os
import sys
import urllib.request
import zipfile
import shutil

WORKSPACE = r"C:\Old_Website"
JDK_DIR = os.path.join(WORKSPACE, "jdk21")
JDK_ZIP = os.path.join(WORKSPACE, "jdk21.zip")
URL = "https://api.adoptium.net/v3/binary/latest/21/ga/windows/x64/jdk/hotspot/normal/eclipse"

def download_file(url, path):
    print(f"Downloading JDK 21 from {url}...")
    headers = {'User-Agent': 'Mozilla/5.0'}
    req = urllib.request.Request(url, headers=headers)
    
    def report_hook(block_num, block_size, total_size):
        read_so_far = block_num * block_size
        if total_size > 0:
            percent = read_so_far * 1e2 / total_size
            s = f"\rProgress: {percent:.1f}% ({read_so_far / (1024*1024):.1f} MB of {total_size / (1024*1024):.1f} MB)"
            sys.stdout.write(s)
            sys.stdout.flush()
        else:
            sys.stdout.write(f"\rDownloaded {read_so_far} bytes")
            sys.stdout.flush()

    # Need a custom opener to handle redirects with custom headers
    opener = urllib.request.build_opener()
    opener.addheaders = [('User-Agent', 'Mozilla/5.0')]
    urllib.request.install_opener(opener)
    
    urllib.request.urlretrieve(url, path, reporthook=report_hook)
    print("\nDownload complete.")

def setup_jdk():
    # 1. Create JDK Directory
    os.makedirs(JDK_DIR, exist_ok=True)
    
    # 2. Download zip if not already there
    if not os.path.exists(JDK_ZIP):
        download_file(URL, JDK_ZIP)
    else:
        print("JDK 21 Zip already exists, skipping download.")
        
    # 3. Extract zip
    temp_extract = os.path.join(WORKSPACE, "temp_jdk_extract")
    if os.path.exists(temp_extract):
        shutil.rmtree(temp_extract)
        
    print("Extracting JDK 21 zip file...")
    with zipfile.ZipFile(JDK_ZIP, 'r') as zip_ref:
        zip_ref.extractall(temp_extract)
        
    # Find the extracted folder (should be named like jdk-21.0.x+y)
    extracted_items = os.listdir(temp_extract)
    if not extracted_items:
        print("Error: Extraction folder is empty!")
        return False
        
    jdk_folder_name = extracted_items[0]
    src_jdk_path = os.path.join(temp_extract, jdk_folder_name)
    
    # Clean up existing jdk21 dir contents
    for item in os.listdir(JDK_DIR):
        item_path = os.path.join(JDK_DIR, item)
        if os.path.isdir(item_path):
            shutil.rmtree(item_path)
        else:
            os.remove(item_path)
            
    # Move files to jdk21
    print("Moving JDK 21 files to destination...")
    for item in os.listdir(src_jdk_path):
        shutil.move(os.path.join(src_jdk_path, item), os.path.join(JDK_DIR, item))
        
    # Cleanup temp extraction folder
    shutil.rmtree(temp_extract)
    print("JDK 21 Setup completed successfully!")
    return True

if __name__ == "__main__":
    setup_jdk()
