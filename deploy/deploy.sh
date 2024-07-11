#!/usr/bin/env bash
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
DEPLOY_DIR="/opt/web2art"
DEPLOY_MODE="production"
RSYNC_DIR=$DEPLOY_DIR

set -e

cd $SCRIPT_DIR/..

while getopts t:m:f flag
do
  case "${flag}" in
    f) FORCE=true;;
    m) DEPLOY_MODE=${OPTARG};;
    t) TARGET=${OPTARG};;
  esac
done

if [ -z ${TARGET+x} ]
  then
    echo "Error: Missing deploy target and mode"
    echo "Example usage: ./deploy.sh -t 192.168.1.2 -m [production]"
    exit 1
fi

echo "> Deploying to ${TARGET} in ${DEPLOY_MODE} mode..."

# Check what OS we're deploying to
echo -n "> Checking machine type..."
UNAME="$(ssh $TARGET "uname")"
case "${UNAME}" in
    MINGW*)    OS="win";;
    Darwin*)   OS="macos";;
    *)         OS="linux";;
esac
echo $OS

# Add prefixes for windows
if [ $OS == "win" ]
then
  RSYNC_DIR="../.."$DEPLOY_DIR
  DEPLOY_DIR="/c"$DEPLOY_DIR
fi

echo "> Copying files..."
rsync -av --exclude="node_modules" --exclude=".*" . $TARGET:$RSYNC_DIR

echo "> Installing dependencies..."
ssh $TARGET "cd $DEPLOY_DIR && npm install --omit=dev"

echo "> Done!"
