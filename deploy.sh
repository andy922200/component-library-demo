#!/usr/bin/env sh

# abort on errors
set -e

# build the project
npm run build

# check if the dist directory exists
if [ -d "dist" ]; then
  cd dist
else
  echo "Build directory 'dist' does not exist, aborting."
  exit 1
fi

# place .nojekyll to bypass Jekyll processing
echo > .nojekyll

# if you are deploying to a custom domain
# echo 'www.example.com' > CNAME

# remove previous .git folder and initialize git again
rm -rf .git
git init

git add -A
git commit -m 'deploy'

# push to gh-pages branch
REMOTE_URL="https://github.com/andy922200/component-library-demo.git"
BRANCHES=("main" "master")
SUCCESS=0

for BRANCH in "${BRANCHES[@]}"; do
  echo "Trying to push using branch: $BRANCH"
  if git push -f "$REMOTE_URL" "$BRANCH:gh-pages"; then
    echo "Successfully pushed using branch: $BRANCH"
    SUCCESS=1
    break
  else
    echo "Failed to push using branch: $BRANCH, trying the next one..."
  fi
done

if [ $SUCCESS -eq 0 ]; then
  echo "Error: Failed to push to gh-pages using all available branches."
  exit 1
fi

cd -

# clean up
rm -rf dist/.git