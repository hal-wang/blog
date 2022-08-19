set -e

pnpm install
npm run build
cd public
git config --global user.name 'hal-wang' 
git config --global user.email 'hi@hal.wang'
git init -b gh-pages
git add -A
git commit -m "publish"