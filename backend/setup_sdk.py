import os
import sys
import urllib.request
import zipfile
import shutil
import subprocess

# Paths
WORKSPACE = r"C:\Old_Website"
SDK_DIR = os.path.join(WORKSPACE, "android_sdk")
CMD_TOOLS_ZIP = os.path.join(WORKSPACE, "cmdline-tools.zip")
JAVA_HOME = r"C:\Users\rrp72\Downloads\eclipse\plugins\org.eclipse.justj.openjdk.hotspot.jre.full.win32.x86_64_17.0.3.v20220515-1416\jre"

# Android cmdline tools zip URL
URL = "https://dl.google.com/android/repository/commandlinetools-win-14742923_latest.zip"

def download_file(url, path):
    print(f"Downloading Android Command Line Tools from {url}...")
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
    urllib.request.urlretrieve(url, path, reporthook=report_hook)
    print("\nDownload complete.")

def setup_sdk():
    # 1. Create SDK directories
    os.makedirs(SDK_DIR, exist_ok=True)
    
    # 2. Download zip if not already downloaded
    if not os.path.exists(CMD_TOOLS_ZIP):
        download_file(URL, CMD_TOOLS_ZIP)
    else:
        print("Zip file already exists, skipping download.")

    # 3. Extract zip
    temp_extract = os.path.join(WORKSPACE, "temp_extract")
    if os.path.exists(temp_extract):
        shutil.rmtree(temp_extract)
    
    print("Extracting zip file...")
    with zipfile.ZipFile(CMD_TOOLS_ZIP, 'r') as zip_ref:
        zip_ref.extractall(temp_extract)
    
    # Organize folder structure: sdk/cmdline-tools/latest/...
    cmdline_tools_dir = os.path.join(SDK_DIR, "cmdline-tools")
    latest_dir = os.path.join(cmdline_tools_dir, "latest")
    
    if os.path.exists(latest_dir):
        print("Removing existing cmdline-tools/latest...")
        shutil.rmtree(latest_dir)
        
    os.makedirs(cmdline_tools_dir, exist_ok=True)
    
    # Move extracted cmdline-tools contents to latest
    src_cmdline_tools = os.path.join(temp_extract, "cmdline-tools")
    shutil.move(src_cmdline_tools, latest_dir)
    
    # Clean up temp extract
    if os.path.exists(temp_extract):
        shutil.rmtree(temp_extract)
    print("Command line tools organized successfully.")

    # 4. Install platforms and tools using sdkmanager
    sdkmanager_path = os.path.join(latest_dir, "bin", "sdkmanager.bat")
    if not os.path.exists(sdkmanager_path):
        print(f"Error: sdkmanager not found at {sdkmanager_path}")
        return False
    
    print("Running sdkmanager to install platforms and build tools...")
    env = os.environ.copy()
    env["JAVA_HOME"] = JAVA_HOME
    
    # Packages to install: platform-tools, platforms;android-35, build-tools;35.0.0
    packages = ["platform-tools", "platforms;android-35", "build-tools;35.0.0"]
    cmd = [sdkmanager_path, f"--sdk_root={SDK_DIR}"] + packages
    
    # Run sdkmanager and auto-accept licenses by passing 'y'
    proc = subprocess.Popen(
        cmd,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        env=env
    )
    
    # Send 'y\n' multiple times to accept all license prompts
    stdout, stderr = proc.communicate(input=b"y\ny\ny\ny\ny\ny\ny\ny\n")
    print(stdout.decode(errors='ignore'))
    if proc.returncode != 0:
        print("sdkmanager failed:")
        print(stderr.decode(errors='ignore'))
        return False
        
    print("Android SDK packages installed successfully!")

    # 5. Create local.properties in capacitor project
    local_properties_path = r"C:\Old_Website\Website2.0\ui\android\local.properties"
    print(f"Creating/Updating local.properties at {local_properties_path}...")
    with open(local_properties_path, "w") as f:
        # Use forward slashes for paths in local.properties
        f.write(f"sdk.dir={SDK_DIR.replace('\\', '/')}\n")
    
    print("SDK Setup is fully complete!")
    return True

if __name__ == "__main__":
    setup_sdk()
