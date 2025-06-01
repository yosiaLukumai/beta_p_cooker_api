#!/bin/bash
WORKING_DIR="/home/afrimetering/server/beta_p_cooker_api"
TARGET_BRANCH="master"
REPOSITORY="git@github.com:yosiaLukumai/beta_p_cooker_api.git"
ENV_FILE_SOURCE=".env" # Path to the .env file relative to the script's execution
PM2_PROCESS_ID="0"

# --- Script Logic ---
echo "Starting deployment script..."

# Check if the working directory exists
if [ -d "$WORKING_DIR" ]; then
  echo "Deleting existing working directory '$WORKING_DIR'..."
  rm -rf "$WORKING_DIR" || {
    echo "Error: Could not delete working directory '$WORKING_DIR'."
    exit 1
  }
fi

# echo "Copying .env file from '$ENV_FILE_SOURCE' to '$WORKING_DIR'..."
# mkdir -p "$(dirname "$WORKING_DIR/")" # Ensure parent directory exists


echo "Cloning '$REPOSITORY' into '$WORKING_DIR' (branch '$TARGET_BRANCH')..."
git clone --depth 1 -b "$TARGET_BRANCH" "$REPOSITORY" "$WORKING_DIR" || {
  echo "Error: Git clone failed."
  exit 1
}

cp "$ENV_FILE_SOURCE" "$WORKING_DIR/" || {
  echo "Error: Could not copy .env file."
  exit 1
}

echo "Installing npm dependencies (production only)..."
cd "$WORKING_DIR" || {
  echo "Error: Could not change directory to '$WORKING_DIR'."
  exit 1
}
npm install .

if [ $? -ne 0 ]; then
  echo "Error: npm install failed."
  exit 1
fi

echo "Restarting Node.js application (PM2 ID $PM2_PROCESS_ID)..."

pm2 stop "$PM2_PROCESS_ID"
if [ $? -ne 0 ]; then
  echo "Warning: PM2 stop failed for process ID '$PM2_PROCESS_ID'. It might not be running."
fi

pm2 start "$PM2_PROCESS_ID"
if [ $? -ne 0 ]; then
  echo "Error: PM2 start failed for process ID '$PM2_PROCESS_ID'."
fi

echo "Deployment script finished."