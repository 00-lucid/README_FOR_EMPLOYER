#! /bin/sh
set -ex
cd "$(dirname "$0")"

for proj in "plan.service" "viewer"; do
    npm run build --prefix $SOLUTION_PATH/$proj
done

rm -rf output/plan.service.zip
mkdir -p output/plan.service/output

cp  ../../plan.service/package.json        output/plan.service/package.json
cp  ../../plan.service/package-lock.json   output/plan.service/package-lock.json
npm ci --only=prod --prefix output/plan.service

cp ../../plan.service/sapnwrfc.ini         output/plan.service/sapnwrfc.ini
cp -r ../../plan.service/output/bin        output/plan.service/output/bin
cp -r ../../viewer/build                   output/plan.service/output/public
rm -rf output/plan.service/output/public/mock

zip -r output/plan.service.zip output/plan.service
rm -rf output/plan.service





